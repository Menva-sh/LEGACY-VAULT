#!/usr/bin/env node
// Fix the foreign key constraint on digital_wills table
// Run with: node fix-database.js

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database foreign key constraint...\n');

    // Step 1: Drop the old constraint
    console.log('Step 1: Dropping old constraint...');
    await pool.query(`
      ALTER TABLE digital_wills 
      DROP CONSTRAINT digital_wills_executor_id_fkey
    `);
    console.log('✅ Old constraint dropped\n');

    // Step 2: Add the new constraint with ON DELETE SET NULL
    console.log('Step 2: Adding new constraint with ON DELETE SET NULL...');
    await pool.query(`
      ALTER TABLE digital_wills 
      ADD CONSTRAINT digital_wills_executor_id_fkey 
      FOREIGN KEY (executor_id) REFERENCES executors(id) ON DELETE SET NULL
    `);
    console.log('✅ New constraint added\n');

    console.log('✨ Database fixed successfully!');
    console.log('🎉 You can now delete executors without errors.\n');

    await pool.end();
  } catch (err) {
    console.error('❌ Error fixing database:', err.message);
    process.exit(1);
  }
}

fixDatabase();
