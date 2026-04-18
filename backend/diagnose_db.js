const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'legacy_vault'
});

async function diagnose() {
  try {
    console.log('Checking database...\n');

    // Check users
    const usersResult = await pool.query('SELECT id, email, first_name, last_name FROM users;');
    console.log('USERS:', usersResult.rows);

    // Check digital_assets table structure
    const assetsTableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'digital_assets'
      ORDER BY ordinal_position;
    `);
    console.log('\nDIGITAL_ASSETS TABLE STRUCTURE:');
    console.log(assetsTableInfo.rows);

    // Check if any assets exist
    const assetsResult = await pool.query('SELECT * FROM digital_assets;');
    console.log('\nEXISTING ASSETS:', assetsResult.rows);

    // Check executors
    const executorsResult = await pool.query('SELECT * FROM executors;');
    console.log('\nEXISTING EXECUTORS:', executorsResult.rows);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

diagnose();
