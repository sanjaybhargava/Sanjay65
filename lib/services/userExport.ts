import { getDatabase } from '../database';

export interface UserExportData {
  email: string;
  signupDate: string;
}

export class UserExportService {
  private db = getDatabase();

  /**
   * Get all users with email and signup date
   */
  getUsersForExport(): UserExportData[] {
    try {
      const stmt = this.db.prepare(`
        SELECT email, created_at 
        FROM users 
        ORDER BY created_at DESC
      `);
      
      const rows = stmt.all() as { email: string; created_at: string }[];
      
      return rows.map(row => ({
        email: row.email,
        signupDate: this.formatDate(row.created_at)
      }));
    } catch (error) {
      console.error('Error fetching users for export:', error);
      return [];
    }
  }

  /**
   * Generate CSV content
   */
  generateCSV(users: UserExportData[]): string {
    const headers = ['Email', 'Signup Date'];
    const csvRows = [
      headers.join(','), // Header row
      ...users.map(user => [
        `"${user.email}"`, // Wrap in quotes to handle special characters
        `"${user.signupDate}"`
      ].join(','))
    ];
    
    return csvRows.join('\n');
  }

  /**
   * Generate Excel-compatible CSV content (with BOM for proper encoding)
   */
  generateExcelCSV(users: UserExportData[]): Buffer {
    const csvContent = this.generateCSV(users);
    // Add BOM for Excel to recognize UTF-8
    const bom = '\uFEFF';
    return Buffer.from(bom + csvContent, 'utf8');
  }

  /**
   * Format date to readable format
   */
  private formatDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      return isoDate; // Return original if parsing fails
    }
  }

  /**
   * Get user count for stats
   */
  getUserCount(): number {
    try {
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
      const result = stmt.get() as { count: number };
      return result.count;
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  }

  /**
   * Get recent signups (last 30 days)
   */
  getRecentSignupCount(): number {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const stmt = this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at >= ?
      `);
      
      const result = stmt.get(thirtyDaysAgo.toISOString()) as { count: number };
      return result.count;
    } catch (error) {
      console.error('Error getting recent signup count:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const userExportService = new UserExportService();