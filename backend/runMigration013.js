const pool = require('./db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  try {
    console.log('Running migration: 013_create_will_executor_assignments.sql');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '013_create_will_executor_assignments.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await pool.query(migrationSQL);

    console.log('✅ Migration 013 applied successfully!');

    // Verify table was created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'will_executor_assignments'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Verified: will_executor_assignments table exists');
    } else {
      console.log('⚠️ Warning: Table may not have been created');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
};

runMigration();
