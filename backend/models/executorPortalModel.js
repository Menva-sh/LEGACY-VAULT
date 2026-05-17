const pool = require('../db');

// Get executor access logs
const getAccessLogs = async (executorId, limit = 50) => {
  try {
    const query = `
      SELECT id, executor_id, user_id, access_type, accessed_resource, accessed_at
      FROM executor_access_logs
      WHERE executor_id = $1
      ORDER BY accessed_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [executorId, limit]);
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching access logs: ${err.message}`);
  }
};

// Log executor access
const logAccess = async (executorId, userId, accessType, accessedResource) => {
  try {
    const query = `
      INSERT INTO executor_access_logs (executor_id, user_id, access_type, accessed_resource, accessed_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, executor_id, access_type, accessed_at
    `;
    const result = await pool.query(query, [executorId, userId, accessType, accessedResource]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error logging access: ${err.message}`);
  }
};

// Get executor by email
const getExecutorByEmail = async (executorEmail) => {
  try {
    const query = 'SELECT id, user_id, executor_email, executor_name, permissions, status FROM executors WHERE executor_email = $1 AND status = \'approved\'';
    const result = await pool.query(query, [executorEmail]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error fetching executor: ${err.message}`);
  }
};

// Get related user (vault owner) for executor
const getVaultOwnerByExecutorId = async (executorId) => {
  try {
    const query = 'SELECT u.id, u.email, u.first_name, u.last_name FROM users u INNER JOIN executors e ON u.id = e.user_id WHERE e.id = $1';
    const result = await pool.query(query, [executorId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error fetching vault owner: ${err.message}`);
  }
};

// Get all designated wills accessible by executor
const getExecutorAccessibleWills = async (executorId) => {
  try {
    const query = `
      SELECT w.id, w.user_id, w.title, w.description, w.status, w.effective_date
      FROM digital_wills w
      WHERE w.executor_id = $1 AND w.status = 'published'
      ORDER BY w.created_at DESC
    `;
    const result = await pool.query(query, [executorId]);
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching accessible wills: ${err.message}`);
  }
};

// Get assets accessible by executor through their vault user
const getExecutorAccessibleAssets = async (executorId) => {
  try {
    const query = `
      SELECT a.id, a.asset_name, a.asset_type, a.description, a.email, a.password, a.action_type, a.last_message, a.created_at
      FROM digital_assets a
      INNER JOIN executors e ON a.user_id = e.user_id
      WHERE e.id = $1
      ORDER BY a.created_at DESC
    `;
    const result = await pool.query(query, [executorId]);
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching accessible assets: ${err.message}`);
  }
};

module.exports = {
  getAccessLogs,
  logAccess,
  getExecutorByEmail,
  getVaultOwnerByExecutorId,
  getExecutorAccessibleWills,
  getExecutorAccessibleAssets
};
