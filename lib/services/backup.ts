import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { getDatabase } from '../database';

export interface BackupResult {
  success: boolean;
  message: string;
  filePath?: string;
  timestamp?: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  importedCounts?: {
    users: number;
    calculators: number;
    lessons: number;
  };
  backupFilePath?: string;
}

export class BackupService {
  private db = getDatabase();
  private readonly backupDir = path.join(process.cwd(), 'data', 'backups');

  constructor() {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create a backup of the current database
   */
  async exportDatabase(): Promise<BackupResult> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `zerofinanx_backup_${timestamp}.db`;
      const backupPath = path.join(this.backupDir, backupFileName);
      
      // Create backup using SQLite BACKUP API
      const backupDb = new Database(backupPath);
      
      // Use SQLite's backup function for atomic operation
      this.db.backup(backupPath);
      backupDb.close();
      
      console.log(`Database backed up to: ${backupPath}`);
      
      return {
        success: true,
        message: `Database backup created successfully`,
        filePath: backupPath,
        timestamp
      };
    } catch (error) {
      console.error('Backup failed:', error);
      return {
        success: false,
        message: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Import data from a backup database file
   */
  async importDatabase(backupFilePath: string, strategy: 'merge' | 'replace' = 'merge'): Promise<ImportResult> {
    let backupDb: Database.Database | null = null;
    let currentBackupPath: string | undefined;

    try {
      // Validate backup file exists
      if (!fs.existsSync(backupFilePath)) {
        throw new Error('Backup file does not exist');
      }

      // Validate backup file is a valid SQLite database
      try {
        backupDb = new Database(backupFilePath, { readonly: true });
        
        // Check if required tables exist
        const tables = backupDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'calculators', 'lessons')").all();
        if (tables.length === 0) {
          throw new Error('Invalid backup file: missing required tables');
        }
        
      } catch (error) {
        throw new Error(`Invalid backup file: ${error instanceof Error ? error.message : 'Cannot read database'}`);
      }

      // Create backup of current database before importing
      const currentBackupResult = await this.exportDatabase();
      if (!currentBackupResult.success) {
        throw new Error('Failed to create backup of current database');
      }
      currentBackupPath = currentBackupResult.filePath;

      const importedCounts = {
        users: 0,
        calculators: 0,
        lessons: 0
      };

      // Start transaction for all import operations
      const transaction = this.db.transaction(() => {
        if (strategy === 'replace') {
          // Clear existing data
          this.db.exec('DELETE FROM users');
          this.db.exec('DELETE FROM calculators'); 
          this.db.exec('DELETE FROM lessons');
        }

        // Import users
        const users = backupDb!.prepare('SELECT * FROM users').all();
        const insertUser = this.db.prepare(`
          INSERT OR REPLACE INTO users (
            id, email, first_name, last_name, phone, notes,
            marketing_consent, sms_consent, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const user of users) {
          insertUser.run(
            user.id, user.email, user.first_name, user.last_name, 
            user.phone, user.notes, user.marketing_consent, 
            user.sms_consent, user.created_at, user.updated_at
          );
          importedCounts.users++;
        }

        // Import calculators
        const calculators = backupDb!.prepare('SELECT * FROM calculators').all();
        const insertCalculator = this.db.prepare(`
          INSERT OR REPLACE INTO calculators (
            id, name, description, category, calculator_type, code, content, url,
            icon, color, fields, is_active, is_published, order_index,
            file_name, artifact_url, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const calc of calculators) {
          insertCalculator.run(
            calc.id, calc.name, calc.description, calc.category, calc.calculator_type,
            calc.code, calc.content, calc.url, calc.icon, calc.color, calc.fields,
            calc.is_active, calc.is_published, calc.order_index, calc.file_name,
            calc.artifact_url, calc.created_at, calc.updated_at
          );
          importedCounts.calculators++;
        }

        // Import lessons
        const lessons = backupDb!.prepare('SELECT * FROM lessons').all();
        const insertLesson = this.db.prepare(`
          INSERT OR REPLACE INTO lessons (
            id, title, description, content, category, duration, difficulty,
            video_url, video_summary, start_message, icon, color, order_index,
            active, completed, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const lesson of lessons) {
          insertLesson.run(
            lesson.id, lesson.title, lesson.description, lesson.content,
            lesson.category, lesson.duration, lesson.difficulty, lesson.video_url,
            lesson.video_summary, lesson.start_message, lesson.icon, lesson.color,
            lesson.order_index, lesson.active, lesson.completed,
            lesson.created_at, lesson.updated_at
          );
          importedCounts.lessons++;
        }
      });

      // Execute the transaction
      transaction();

      console.log('Database import completed:', importedCounts);

      return {
        success: true,
        message: `Import completed successfully. Imported ${importedCounts.users} users, ${importedCounts.calculators} calculators, and ${importedCounts.lessons} lessons.`,
        importedCounts,
        backupFilePath: currentBackupPath
      };

    } catch (error) {
      console.error('Import failed:', error);
      
      // If we created a backup, mention it in the error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const message = currentBackupPath 
        ? `Import failed: ${errorMessage}. Your original data has been backed up to: ${currentBackupPath}`
        : `Import failed: ${errorMessage}`;

      return {
        success: false,
        message,
        backupFilePath: currentBackupPath
      };
    } finally {
      // Clean up backup database connection
      if (backupDb) {
        backupDb.close();
      }
    }
  }

  /**
   * List available backup files
   */
  listBackups(): Array<{ fileName: string; filePath: string; size: number; created: Date }> {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.endsWith('.db'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            fileName: file,
            filePath,
            size: stats.size,
            created: stats.birthtime
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime()); // Most recent first

      return files;
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  /**
   * Delete a backup file
   */
  deleteBackup(fileName: string): boolean {
    try {
      const filePath = path.join(this.backupDir, fileName);
      if (fs.existsSync(filePath) && fileName.endsWith('.db')) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting backup:', error);
      return false;
    }
  }

  /**
   * Get current database statistics
   */
  getDatabaseStats() {
    try {
      const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
      const calculatorCount = this.db.prepare('SELECT COUNT(*) as count FROM calculators').get() as { count: number };
      const lessonCount = this.db.prepare('SELECT COUNT(*) as count FROM lessons').get() as { count: number };

      return {
        users: userCount.count,
        calculators: calculatorCount.count,
        lessons: lessonCount.count
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return { users: 0, calculators: 0, lessons: 0 };
    }
  }
}

// Export singleton instance
export const backupService = new BackupService();