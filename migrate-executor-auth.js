const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load .env manually
const envPath = path.join(__dirname, 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('🚀 Running executor auth migration...\n');

    const migrations = [
      {
        name: 'Add password column',
        sql: 'ALTER TABLE executors ADD COLUMN IF NOT EXISTS password VARCHAR(255);'
      },
      {
        name: 'Add setup_token column',
        sql: 'ALTER TABLE executors ADD COLUMN IF NOT EXISTS setup_token VARCHAR(255) UNIQUE;'
      },
      {
        name: 'Add token_expires_at column',
        sql: 'ALTER TABLE executors ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP;'
      },
      {
        name: 'Add is_active column',
        sql: 'ALTER TABLE executors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;'
      },
      {
        name: 'Add last_login column',
        sql: 'ALTER TABLE executors ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;'
      },
      {
        name: 'Create index on setup_token',
        sql: 'CREATE INDEX IF NOT EXISTS idx_executors_setup_token ON executors(setup_token);'
      },
      {
        name: 'Create index on is_active',
        sql: 'CREATE INDEX IF NOT EXISTS idx_executors_is_active ON executors(is_active);'
      }
    ];

    for (const migration of migrations) {
      try {
        console.log(`⏳ ${migration.name}...`);
        await client.query(migration.sql);
        console.log(`✅ ${migration.name} - Success\n`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`ℹ️  ${migration.name} - Already exists\n`);
        } else {
          throw err;
        }
      }
    }

    console.log('🎉 Migration completed successfully!\n');
    console.log('Added columns:');
    console.log('  ✓ password (VARCHAR(255))');
    console.log('  ✓ setup_token (VARCHAR(255), UNIQUE)');
    console.log('  ✓ token_expires_at (TIMESTAMP)');
    console.log('  ✓ is_active (BOOLEAN, DEFAULT FALSE)');
    console.log('  ✓ last_login (TIMESTAMP)');
    console.log('\n✨ Executor authentication system ready!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    await pool.end();
  }
}

runMigration();
