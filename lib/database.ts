import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database singleton
let db: Database.Database | null = null;

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'zerofinanx.db');

// Initialize database with schema
export function initDatabase(): Database.Database {
  if (db) {
    return db;
  }

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create database connection
  db = new Database(DB_PATH);

  // Enable foreign key constraints
  db.pragma('foreign_keys = ON');
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');

  // Run migrations
  runMigrations();

  console.log(`SQLite database initialized at: ${DB_PATH}`);
  
  return db;
}

// Get database instance (initialize if needed)
export function getDatabase(): Database.Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

// Run database migrations
function runMigrations() {
  if (!db) return;

  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Define migrations
  const migrations = [
    {
      name: '001_create_tables',
      sql: `
        -- Users/Customers table
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          first_name TEXT,
          last_name TEXT,
          phone TEXT,
          notes TEXT,
          marketing_consent INTEGER DEFAULT 0,
          sms_consent INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Create index on email for faster lookups
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

        -- Calculators table  
        CREATE TABLE IF NOT EXISTS calculators (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          calculator_type TEXT CHECK(calculator_type IN ('url', 'code')) NOT NULL,
          code TEXT,
          content TEXT,
          url TEXT NOT NULL,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          fields TEXT, -- JSON string of form fields
          is_active INTEGER DEFAULT 1,
          is_published INTEGER DEFAULT 1,
          order_index INTEGER DEFAULT 0,
          file_name TEXT,
          artifact_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Create index for ordering calculators
        CREATE INDEX IF NOT EXISTS idx_calculators_order ON calculators(order_index);
        CREATE INDEX IF NOT EXISTS idx_calculators_published ON calculators(is_published, is_active);

        -- Lessons table
        CREATE TABLE IF NOT EXISTS lessons (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT NOT NULL,
          duration TEXT,
          difficulty TEXT NOT NULL,
          video_url TEXT,
          video_summary TEXT,
          start_message TEXT,
          icon TEXT NOT NULL,
          color TEXT NOT NULL,
          order_index INTEGER DEFAULT 0,
          active INTEGER DEFAULT 1,
          completed INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Create index for ordering lessons
        CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_index);
        CREATE INDEX IF NOT EXISTS idx_lessons_active ON lessons(active);
      `
    },
    {
      name: '002_create_waitlist',
      sql: `
        -- Waitlist table for beta closed signups
        CREATE TABLE IF NOT EXISTS waitlist (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Create index on email for faster lookups
        CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
        CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at);
      `
    }
  ];

  // Apply migrations
  for (const migration of migrations) {
    const exists = db.prepare('SELECT name FROM migrations WHERE name = ?').get(migration.name);
    
    if (!exists) {
      console.log(`Running migration: ${migration.name}`);
      
      // Run migration in transaction
      const transaction = db.transaction(() => {
        db.exec(migration.sql);
        db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name);
      });
      
      transaction();
      console.log(`Migration completed: ${migration.name}`);
    }
  }
}

// Close database connection (for cleanup)
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

// Utility function to generate ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Process exit cleanup
process.on('exit', () => {
  closeDatabase();
});

process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});