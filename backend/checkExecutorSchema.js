const pool = require('./db');

const checkExecutorSchema = async () => {
  try {
    console.log('\n📊 CHECKING EXECUTORS TABLE SCHEMA...\n');

    // Get all columns for executors table
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'executors'
      ORDER BY ordinal_position
    `);

    if (result.rows.length === 0) {
      console.log('❌ ERROR: executors table not found!');
      process.exit(1);
    }

    console.log(`✅ Found executors table with ${result.rows.length} columns:\n`);
    
    const columnNames = [];
    result.rows.forEach((col, i) => {
      columnNames.push(col.column_name);
      console.log(`${i + 1}. ${col.column_name}`);
      console.log(`   Type: ${col.data_type}`);
      console.log(`   Nullable: ${col.is_nullable}`);
      console.log(`   Default: ${col.column_default || 'None'}\n`);
    });

    // Check for required columns
    const requiredColumns = ['id', 'user_id', 'executor_email', 'executor_name', 'setup_token', 'token_expires_at', 'password', 'is_active'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

    if (missingColumns.length > 0) {
      console.log(`\n⚠️ MISSING COLUMNS: ${missingColumns.join(', ')}`);
    } else {
      console.log(`\n✅ All required columns exist!`);
    }

    // Check if executors exist
    const executorCount = await pool.query('SELECT COUNT(*) as count FROM executors');
    console.log(`\n📈 Executors in database: ${executorCount.rows[0].count}`);

    // Get all executor tokens
    const executors = await pool.query(`
      SELECT id, executor_email, setup_token, is_active, password
      FROM executors
      ORDER BY created_at DESC
    `);

    if (executors.rows.length > 0) {
      console.log(`\n📋 All executors:\n`);
      executors.rows.forEach(exec => {
        console.log(`ID: ${exec.id}`);
        console.log(`Email: ${exec.executor_email}`);
        console.log(`Setup Token: ${exec.setup_token || 'NULL'}`);
        console.log(`Has Password: ${exec.password ? 'YES' : 'NO'}`);
        console.log(`Active: ${exec.is_active}`);
        console.log(`---`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error checking schema:', err.message);
    console.error(err);
    process.exit(1);
  }
};

checkExecutorSchema();
