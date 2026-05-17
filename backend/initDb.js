const path = require('path');
const fs = require('fs');
const pool = require('./db');

const initializeDatabase = async () => {
  try {
    console.log('Initializing database tables...');

    // Step 0: Create migrations tracking table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INT PRIMARY KEY,
        name VARCHAR(255),
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Step 1: Check if we should reset the database
    const shouldReset = process.env.RESET_DB === 'true' || process.env.NODE_ENV === 'test';
    
    if (shouldReset) {
      console.log('⚠️  RESET_DB detected - dropping all tables...');
      
      // Disable foreign key constraints temporarily
      await pool.query('SET CONSTRAINTS ALL DEFERRED;');

      // Drop all tables (order matters for FK constraints)
      const dropStatements = [
        'DROP TABLE IF EXISTS executor_access_logs CASCADE;',
        'DROP TABLE IF EXISTS dead_mans_switch CASCADE;',  
        'DROP TABLE IF EXISTS digital_wills CASCADE;',
        'DROP TABLE IF EXISTS executors CASCADE;',
        'DROP TABLE IF EXISTS digital_assets CASCADE;',
        'DROP TABLE IF EXISTS users CASCADE;',
        'DELETE FROM schema_migrations;'
      ];

      for (const sql of dropStatements) {
        try {
          await pool.query(sql);
        } catch (err) {
          // Continue even if drop fails
        }
      }
      console.log('✅ Database reset complete');
    } else {
      console.log('✅ Using existing database (data will persist)');
    }

    // Step 2: Run migrations in order
    const migrationsPath = path.join(__dirname, 'migrations');
    const migrationFiles = [
      { version: 1, file: '001_create_users_table.sql' },
      { version: 2, file: '002_create_digital_assets_table.sql' },
      { version: 3, file: '003_create_executors_table.sql' },
      { version: 4, file: '004_create_digital_wills_table.sql' },
      { version: 5, file: '005_create_dead_mans_switch_table.sql' },
      { version: 6, file: '006_create_executor_access_logs_table.sql' },
      { version: 7, file: '007_add_file_path_to_wills.sql' },
      { version: 8, file: '008_add_last_active_to_users.sql' },
      { version: 9, file: '009_add_status_to_dead_mans_switch.sql' },
      { version: 10, file: '010_fix_wills_executor_fk.sql' },
      { version: 11, file: '011_add_executor_auth.sql' },
      { version: 12, file: '012_add_email_password_to_assets.sql' },
      { version: 13, file: '013_create_will_executor_assignments.sql' },
      { version: 14, file: '014_create_asset_workflow_completions.sql' }
    ];

    for (const migration of migrationFiles) {
      // Check if migration has already been executed
      const checkResult = await pool.query(
        'SELECT version FROM schema_migrations WHERE version = $1',
        [migration.version]
      );

      if (checkResult.rows.length > 0) {
        console.log(`⏭️  Skipped: ${migration.file} (already executed)`);
        continue;
      }

      const filePath = path.join(migrationsPath, migration.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${migration.file}`);
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await pool.query(sql);
        
        // Record migration as executed
        await pool.query(
          'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
          [migration.version, migration.file]
        );
        
        console.log(`✅ Executed: ${migration.file}`);
      } catch (err) {
        console.error(`❌ Error in ${migration.file}:`);
        console.error(`   ${err.message.split('\n')[0]}`);
      }
    }

    console.log('✅ Database initialization complete!');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
};

module.exports = initializeDatabase;
