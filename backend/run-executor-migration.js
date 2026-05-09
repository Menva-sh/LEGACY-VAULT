const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runMigration() {
  try {
    console.log('🚀 Running migration: 011_add_executor_auth.sql');

    const migrationPath = path.join(__dirname, 'migrations', '011_add_executor_auth.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL into individual statements and execute
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await pool.query(statement);
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('Database columns added:');
    console.log('  - password (VARCHAR(255))');
    console.log('  - setup_token (VARCHAR(255), UNIQUE)');
    console.log('  - token_expires_at (TIMESTAMP)');
    console.log('  - is_active (BOOLEAN)');
    console.log('  - last_login (TIMESTAMP)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Columns already exist in database');
      process.exit(0);
    }
    process.exit(1);
  }
}

runMigration();
