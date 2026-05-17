/**
 * Migration script: Add action_type and last_message to digital_assets
 * Run with: node scripts/check_and_add_columns.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to Neon PostgreSQL\n');

    // 1. Check current columns in digital_assets
    const colCheck = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'digital_assets'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Current columns in digital_assets:');
    colCheck.rows.forEach(r => {
      console.log(`   ${r.column_name.padEnd(25)} ${r.data_type.padEnd(20)} default: ${r.column_default || 'none'}`);
    });

    const existingCols = colCheck.rows.map(r => r.column_name);

    // 2. Add action_type if missing
    if (!existingCols.includes('action_type')) {
      console.log('\n⚙️  Adding action_type column...');
      await client.query(`
        ALTER TABLE digital_assets
        ADD COLUMN action_type VARCHAR(50) DEFAULT 'pass';
      `);
      console.log('✅ action_type column added (default: pass)');
    } else {
      console.log('\n✅ action_type column already exists');
    }

    // 3. Add last_message if missing
    if (!existingCols.includes('last_message')) {
      console.log('⚙️  Adding last_message column...');
      await client.query(`
        ALTER TABLE digital_assets
        ADD COLUMN last_message TEXT;
      `);
      console.log('✅ last_message column added');
    } else {
      console.log('✅ last_message column already exists');
    }

    // 4. Add email column if missing (older schema may not have it)
    if (!existingCols.includes('email')) {
      console.log('⚙️  Adding email column...');
      await client.query(`
        ALTER TABLE digital_assets
        ADD COLUMN email VARCHAR(255);
      `);
      console.log('✅ email column added');
    } else {
      console.log('✅ email column already exists');
    }

    // 5. Show current sample rows
    const sample = await client.query(`
      SELECT id, asset_name, asset_type, email, action_type, last_message
      FROM digital_assets
      ORDER BY created_at DESC
      LIMIT 5;
    `);
    console.log('\n📊 Sample rows in digital_assets (latest 5):');
    if (sample.rows.length === 0) {
      console.log('   (no rows yet)');
    } else {
      sample.rows.forEach(r => {
        console.log(`   [${r.id}] ${r.asset_name} | ${r.asset_type} | ${r.email} | action=${r.action_type} | msg=${r.last_message || '(none)'}`);
      });
    }

    console.log('\n🎉 Migration complete. All required columns are present.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
