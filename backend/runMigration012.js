const pool = require('./db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  try {
    console.log('Running migration: 012_add_email_password_to_assets.sql');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '012_add_email_password_to_assets.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await pool.query(migrationSQL);

    console.log('✅ Migration 012 applied successfully!');

    // Verify columns were added
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'digital_assets' 
      AND column_name IN ('email', 'password')
    `);

    if (result.rows.length === 2) {
      console.log('✅ Verified: email and password columns exist');
      console.log('Column details:', result.rows);
    } else {
      console.log('⚠️ Warning: Expected 2 columns but found', result.rows.length);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
};

runMigration();
