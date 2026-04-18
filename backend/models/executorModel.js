const pool = require('../db');

// Add executor to a user's vault
const addExecutor = async (userId, executorEmail, executorName, permissions = 'view') => {
  try {
    const query = `
      INSERT INTO executors (user_id, executor_email, executor_name, permissions, status, is_active, created_at)
      VALUES ($1, $2, $3, $4, 'pending', false, NOW())
      RETURNING id, user_id, executor_email, executor_name, permissions, is_active, status, created_at
    `;
    const result = await pool.query(query, [userId, executorEmail, executorName, permissions]);
    return result.rows[0];
  } catch (err) {
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
    const query = 'DELETE FROM executors WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await pool.query(query, [executorId, userId]);
    return result.rows[0];
  } catch (err) {
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

module.exports = {
  addExecutor,
  getExecutorsByUserId,
  getExecutorById,
  updateExecutor,
  updateExecutorStatus,
  removeExecutor,
  executorExists
};
