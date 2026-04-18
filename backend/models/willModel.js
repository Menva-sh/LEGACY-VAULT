const pool = require('../db');

// Create digital will
const createWill = async (userId, title, description, content, executorId = null) => {
  try {
    const query = `
      INSERT INTO digital_wills (user_id, title, description, content, status, executor_id, created_at)
      VALUES ($1, $2, $3, $4, 'draft', $5, NOW())
      RETURNING id, user_id, title, description, content, status, executor_id, created_at
    `;
    const result = await pool.query(query, [userId, title, description, content, executorId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error creating will: ${err.message}`);
  }
};

// Get all wills for user
const getWillsByUserId = async (userId) => {
  try {
    const query = 'SELECT id, user_id, title, description, status, executor_id, created_at, effective_date, file_path FROM digital_wills WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching wills: ${err.message}`);
  }
};

// Get single will
const getWillById = async (willId, userId) => {
  try {
    const query = 'SELECT id, user_id, title, description, content, status, executor_id, created_at, effective_date, file_path FROM digital_wills WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [willId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error fetching will: ${err.message}`);
  }
};

// Update will
const updateWill = async (willId, userId, title, description, content) => {
  try {
    const query = `
      UPDATE digital_wills
      SET title = $1, description = $2, content = $3, updated_at = NOW()
      WHERE id = $4 AND user_id = $5
      RETURNING id, title, description, status, updated_at
    `;
    const result = await pool.query(query, [title, description, content, willId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error updating will: ${err.message}`);
  }
};

// Publish/Finalize will
const publishWill = async (willId, userId, effectiveDate = null) => {
  try {
    const query = `
      UPDATE digital_wills
      SET status = 'published', effective_date = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3 AND status = 'draft'
      RETURNING id, title, status, effective_date
    `;
    const result = await pool.query(query, [effectiveDate, willId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error publishing will: ${err.message}`);
  }
};

// Delete will
const deleteWill = async (willId, userId) => {
  try {
    const query = 'DELETE FROM digital_wills WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await pool.query(query, [willId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error deleting will: ${err.message}`);
  }
};

// Get published wills for executor access
const getPublishedWillsByExecutor = async (executorId) => {
  try {
    const query = 'SELECT id, user_id, title, description, content, status, executor_id, effective_date FROM digital_wills WHERE executor_id = $1 AND status = \'published\'';
    const result = await pool.query(query, [executorId]);
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching published wills: ${err.message}`);
  }
};

// Create or update will with file path (for generated PDFs)
const saveGeneratedWill = async (userId, title, description, content, filePath, executorId = null) => {
  try {
    const query = `
      INSERT INTO digital_wills (user_id, title, description, content, file_path, status, executor_id, created_at)
      VALUES ($1, $2, $3, $4, $5, 'drafted', $6, NOW())
      RETURNING id, user_id, title, description, content, file_path, status, created_at
    `;
    const result = await pool.query(query, [userId, title, description, content, filePath, executorId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error saving generated will: ${err.message}`);
  }
};

module.exports = {
  createWill,
  getWillsByUserId,
  getWillById,
  updateWill,
  publishWill,
  deleteWill,
  getPublishedWillsByExecutor,
  saveGeneratedWill
};
