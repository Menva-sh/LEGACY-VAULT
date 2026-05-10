const pool = require('../db');

// Add executor to a user's vault
const addExecutor = async (userId, executorEmail, executorName, permissions = 'view') => {
  try {
    console.log(`\n📊 DATABASE: Creating executor`);
    console.log(`   userId: ${userId}`);
    console.log(`   executorEmail: ${executorEmail}`);
    console.log(`   executorName: ${executorName}`);
    console.log(`   permissions: ${permissions}`);
    
    const query = `
      INSERT INTO executors (user_id, executor_email, executor_name, permissions, status, is_active, created_at)
      VALUES ($1, $2, $3, $4, 'pending', false, NOW())
      RETURNING id, user_id, executor_email, executor_name, permissions, is_active, status, created_at
    `;
    
    console.log(`📋 Executing INSERT query with params: [${userId}, '${executorEmail}', '${executorName}', '${permissions}']`);
    
    const result = await pool.query(query, [userId, executorEmail, executorName, permissions]);
    
    console.log(`✅ INSERT successful`);
    console.log(`   Returned rows: ${result.rows.length}`);
    console.log(`   Result: ${JSON.stringify(result.rows[0])}`);
    
    return result.rows[0];
  } catch (err) {
    console.error(`❌ Error adding executor: ${err.message}`);
    console.error(`   Full error:`, err);
    throw new Error(`Error adding executor: ${err.message}`);
  }
};

// Get all executors for a user
const getExecutorsByUserId = async (userId) => {
  try {
    const query = 'SELECT id, user_id, executor_email, executor_name, permissions, is_active, status, created_at FROM executors WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching executors: ${err.message}`);
  }
};

// Get single executor
const getExecutorById = async (executorId, userId) => {
  try {
    const query = 'SELECT id, user_id, executor_email, executor_name, permissions, is_active, status FROM executors WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [executorId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error fetching executor: ${err.message}`);
  }
};

// Update executor
const updateExecutor = async (executorId, userId, executorName, permissions, isActive) => {
  try {
    const query = `
      UPDATE executors
      SET executor_name = $1, permissions = $2, is_active = $3, updated_at = NOW()
      WHERE id = $4 AND user_id = $5
      RETURNING id, executor_email, executor_name, permissions, is_active, status
    `;
    const result = await pool.query(query, [executorName, permissions, isActive, executorId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error updating executor: ${err.message}`);
  }
};

// Update executor status (approve, deny, deactivate)
const updateExecutorStatus = async (executorId, userId, status) => {
  try {
    const query = `
      UPDATE executors
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING id, executor_email, status
    `;
    const result = await pool.query(query, [status, executorId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error updating executor status: ${err.message}`);
  }
};

// Remove executor
const removeExecutor = async (executorId, userId) => {
  try {
    console.log(`Removing executor: id=${executorId}, userId=${userId}`);
    
    // Ensure IDs are integers
    const id = parseInt(executorId, 10);
    const uid = parseInt(userId, 10);
    
    if (isNaN(id) || isNaN(uid)) {
      throw new Error(`Invalid ID format: executorId=${executorId}, userId=${userId}`);
    }
    
    const query = 'DELETE FROM executors WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await pool.query(query, [id, uid]);
    console.log(`Delete result:`, result.rows);
    
    if (!result.rows || result.rows.length === 0) {
      console.warn(`Executor not found: id=${id}, userId=${uid}`);
      return null;
    }
    
    return result.rows[0];
  } catch (err) {
    console.error(`Error removing executor (id=${executorId}, userId=${userId}):`, err.message);
    throw new Error(`Error removing executor: ${err.message}`);
  }
};

// Check if executor exists for user
const executorExists = async (userId, executorEmail) => {
  try {
    const query = 'SELECT EXISTS(SELECT 1 FROM executors WHERE user_id = $1 AND executor_email = $2)';
    const result = await pool.query(query, [userId, executorEmail]);
    return result.rows[0].exists;
  } catch (err) {
    throw new Error(`Error checking executor: ${err.message}`);
  }
};

// Set executor setup token (called when creating executor)
const setSetupToken = async (executorId, setupToken, tokenExpiresAt) => {
  try {
    console.log(`\n📝 Setting setup token for executor ${executorId}`);
    console.log(`   Token: ${setupToken.substring(0, 15)}...`);
    console.log(`   Expires at: ${tokenExpiresAt}`);
    
    // First verify the executor exists
    const checkExecutor = await pool.query(
      'SELECT id, executor_email FROM executors WHERE id = $1',
      [executorId]
    );
    
    if (checkExecutor.rows.length === 0) {
      throw new Error(`Executor ${executorId} not found in database`);
    }
    
    console.log(`   ✅ Executor exists: ${checkExecutor.rows[0].executor_email}`);
    
    const query = `
      UPDATE executors
      SET setup_token = $1, token_expires_at = $2
      WHERE id = $3
      RETURNING id, setup_token, token_expires_at
    `;
    
    console.log(`   🔄 Executing UPDATE query...`);
    const result = await pool.query(query, [setupToken, tokenExpiresAt, executorId]);
    
    console.log(`   📊 Update result rows: ${result.rows.length}`);
    
    if (!result.rows[0]) {
      throw new Error(`UPDATE returned no rows for executor ${executorId}`);
    }
    
    console.log(`   ✅ Token saved successfully for executor ${executorId}`);
    console.log(`      Returned setup_token: ${result.rows[0].setup_token ? '✅ SAVED' : '❌ NULL'}`);
    console.log(`      Returned expires_at: ${result.rows[0].token_expires_at}\n`);
    
    return result.rows[0];
  } catch (err) {
    console.error(`❌ Error setting setup token: ${err.message}`);
    console.error(`   Stack: ${err.stack}`);
    throw new Error(`Error setting setup token: ${err.message}`);
  }
};

// Get executor by setup token
const getExecutorBySetupToken = async (setupToken) => {
  try {
    console.log(`\n🔍 DATABASE QUERY FOR TOKEN`);
    console.log(`   Full token: ${setupToken}`);
    console.log(`   Length: ${setupToken.length}`);
    console.log(`   Type: ${typeof setupToken}`);
    
    const query = `
      SELECT id, executor_email, executor_name, setup_token, token_expires_at, is_active
      FROM executors
      WHERE setup_token = $1
    `;
    const result = await pool.query(query, [setupToken]);
    
    if (!result.rows[0]) {
      console.log(`❌ No executor found with this exact token`);
      console.log(`\n📋 TOKENS IN DATABASE:`);
      const allTokens = await pool.query(`
        SELECT id, executor_email, setup_token, token_expires_at, is_active
        FROM executors 
        WHERE setup_token IS NOT NULL
        ORDER BY created_at DESC
      `);
      
      if (allTokens.rows.length === 0) {
        console.log(`   ⚠️  NO TOKENS FOUND IN DATABASE AT ALL`);
      } else {
        console.log(`   Found ${allTokens.rows.length} executors with setup tokens:`);
        allTokens.rows.forEach(row => {
          console.log(`   ---`);
          console.log(`   ID: ${row.id}`);
          console.log(`   Email: ${row.executor_email}`);
          console.log(`   Token: ${row.setup_token}`);
          console.log(`   Expires: ${row.token_expires_at}`);
          console.log(`   Active: ${row.is_active}`);
          console.log(`   Match: ${row.setup_token === setupToken ? '✅ YES' : '❌ NO'}`);
        });
      }
    } else {
      console.log(`✅ Found executor: ${result.rows[0].executor_email}`);
    }
    
    return result.rows[0];
  } catch (err) {
    console.error(`❌ Error fetching executor by token: ${err.message}`);
    throw new Error(`Error fetching executor by token: ${err.message}`);
  }
};

// Set executor password (after password setup)
const setExecutorPassword = async (executorId, hashedPassword) => {
  try {
    const query = `
      UPDATE executors
      SET password = $1, is_active = true, setup_token = NULL, token_expires_at = NULL, updated_at = NOW()
      WHERE id = $2
      RETURNING id, executor_email, executor_name, is_active
    `;
    const result = await pool.query(query, [hashedPassword, executorId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error setting executor password: ${err.message}`);
  }
};

// Get executor by email for login
const getExecutorByEmail = async (executorEmail) => {
  try {
    const query = `
      SELECT id, executor_email, executor_name, password, is_active, user_id
      FROM executors
      WHERE executor_email = $1 AND is_active = true
    `;
    const result = await pool.query(query, [executorEmail]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error fetching executor by email: ${err.message}`);
  }
};

// Update executor last login
const updateLastLogin = async (executorId) => {
  try {
    const query = `
      UPDATE executors
      SET last_login = NOW()
      WHERE id = $1
      RETURNING id, last_login
    `;
    const result = await pool.query(query, [executorId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error updating last login: ${err.message}`);
  }
};

module.exports = {
  addExecutor,
  getExecutorsByUserId,
  getExecutorById,
  updateExecutor,
  updateExecutorStatus,
  removeExecutor,
  executorExists,
  setSetupToken,
  getExecutorBySetupToken,
  setExecutorPassword,
  getExecutorByEmail,
  updateLastLogin
};
