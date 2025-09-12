const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');
const path = require('path');

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('Usage: node add_beta_user.js <email>');
  console.log('Example: node add_beta_user.js newuser@example.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.log('❌ Invalid email format:', email);
  process.exit(1);
}

// Database setup
const dbPath = path.join(__dirname, 'data', 'zerofinanx.db');
const db = new Database(dbPath);

try {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Check if user already exists
  const existing = db.prepare('SELECT email FROM users WHERE email = ?').get(normalizedEmail);
  
  if (existing) {
    console.log('⚠️  User already exists:', normalizedEmail);
    console.log('✅ They already have beta access!');
  } else {
    // Add new beta user
    const userId = randomUUID();
    const result = db.prepare(`
      INSERT INTO users (id, email, first_name, last_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(userId, normalizedEmail, 'Beta', 'User');
    
    if (result.changes > 0) {
      console.log('✅ Successfully added beta user:', normalizedEmail);
      
      // Get total count
      const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
      console.log(`📊 Total beta users: ${count}`);
    } else {
      console.log('❌ Failed to add user');
    }
  }
} catch (error) {
  console.log('❌ Database error:', error.message);
} finally {
  db.close();
}