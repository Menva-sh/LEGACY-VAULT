const pool = require('../db');

// Create digital will
const createWill = async (userId, title, description, content) => {
  try {
    const query = `
      INSERT INTO digital_wills (user_id, title, description, content, status, created_at)
      VALUES ($1, $2, $3, $4, 'draft', NOW())
      RETURNING id, user_id, title, description, content, status, created_at
    `;
    const result = await pool.query(query, [userId, title, description, content]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error creating will: ${err.message}`);
  }
};

// Get all wills for user with assigned executors
const getWillsByUserId = async (userId) => {
  try {
    const query = `
      SELECT 
        dw.id, dw.user_id, dw.title, dw.description, dw.status, 
        dw.created_at, dw.effective_date, dw.file_path,
        json_agg(json_build_object('id', e.id, 'email', e.executor_email, 'name', e.executor_name)) 
          FILTER (WHERE e.id IS NOT NULL) as assigned_executors
      FROM digital_wills dw
      LEFT JOIN will_executor_assignments wea ON dw.id = wea.will_id
      LEFT JOIN executors e ON wea.executor_id = e.id
      WHERE dw.user_id = $1 
      GROUP BY dw.id, dw.user_id, dw.title, dw.description, dw.status, dw.created_at, dw.effective_date, dw.file_path
      ORDER BY dw.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching wills: ${err.message}`);
  }
};

// Get single will with all assigned executors
const getWillById = async (willId, userId) => {
  try {
    const query = `
      SELECT 
        dw.id, dw.user_id, dw.title, dw.description, dw.content, dw.status, 
        dw.created_at, dw.effective_date, dw.file_path,
        json_agg(json_build_object('id', e.id, 'email', e.executor_email, 'name', e.executor_name)) 
          FILTER (WHERE e.id IS NOT NULL) as assigned_executors
      FROM digital_wills dw
      LEFT JOIN will_executor_assignments wea ON dw.id = wea.will_id
      LEFT JOIN executors e ON wea.executor_id = e.id
      WHERE dw.id = $1 AND dw.user_id = $2
      GROUP BY dw.id, dw.user_id, dw.title, dw.description, dw.content, dw.status, dw.created_at, dw.effective_date, dw.file_path
    `;
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

// Get published wills for executor (via junction table)
const getPublishedWillsByExecutor = async (executorId) => {
  try {
    const query = `
      SELECT 
        dw.id, 
        dw.user_id, 
        dw.title, 
        dw.description, 
        dw.content, 
        dw.status, 
        dw.effective_date,
        dw.file_path,
        dw.created_at,
        u.first_name,
        u.last_name,
        u.email
      FROM digital_wills dw
      INNER JOIN will_executor_assignments wea ON dw.id = wea.will_id
      LEFT JOIN users u ON dw.user_id = u.id
      WHERE wea.executor_id = $1 AND dw.status = 'published'
      ORDER BY dw.created_at DESC
    `;
    const result = await pool.query(query, [executorId]);
    return result.rows.map(row => ({
      ...row,
      user_name: row.first_name || row.last_name 
        ? `${row.first_name || ''} ${row.last_name || ''}`.trim()
        : row.email
    }));
  } catch (err) {
    throw new Error(`Error fetching published wills: ${err.message}`);
  }
};

// Assign will to multiple executors
const assignWillToExecutors = async (willId, userId, executorIds) => {
  const client = await pool.connect();
  try {
    // Start transaction
    await client.query('BEGIN');

    // Verify the will belongs to the user
    const willCheck = await client.query(
      'SELECT id FROM digital_wills WHERE id = $1 AND user_id = $2',
      [willId, userId]
    );

    if (willCheck.rows.length === 0) {
      throw new Error('Will not found or does not belong to user');
    }

    // Verify all executors belong to the user
    const executorCheck = await client.query(
      'SELECT id FROM executors WHERE id = ANY($1) AND user_id = $2',
      [executorIds, userId]
    );

    if (executorCheck.rows.length !== executorIds.length) {
      throw new Error('One or more executors do not belong to this user');
    }

    // Clear existing assignments for this will
    await client.query('DELETE FROM will_executor_assignments WHERE will_id = $1', [willId]);

    // Insert new assignments
    for (const executorId of executorIds) {
      await client.query(
        'INSERT INTO will_executor_assignments (will_id, executor_id) VALUES ($1, $2)',
        [willId, executorId]
      );
    }

    await client.query('COMMIT');

    return {
      willId,
      assignedExecutorCount: executorIds.length,
      assignedExecutorIds: executorIds
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw new Error(`Error assigning will to executors: ${err.message}`);
  } finally {
    client.release();
  }
};

// Remove executor from will
const removeExecutorFromWill = async (willId, userId, executorId) => {
  try {
    // Verify the will belongs to the user
    const willCheck = await pool.query(
      'SELECT id FROM digital_wills WHERE id = $1 AND user_id = $2',
      [willId, userId]
    );

    if (willCheck.rows.length === 0) {
      throw new Error('Will not found or does not belong to user');
    }

    // Remove the assignment
    const result = await pool.query(
      'DELETE FROM will_executor_assignments WHERE will_id = $1 AND executor_id = $2 RETURNING id',
      [willId, executorId]
    );

    return result.rows[0];
  } catch (err) {
    throw new Error(`Error removing executor from will: ${err.message}`);
  }
};

// Create or update will with file path (for generated PDFs)
const saveGeneratedWill = async (userId, title, description, content, filePath) => {
  try {
    const query = `
      INSERT INTO digital_wills (user_id, title, description, content, file_path, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'draft', NOW())
      RETURNING id, user_id, title, description, content, file_path, status, created_at
    `;
    const result = await pool.query(query, [userId, title, description, content, filePath]);
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
  saveGeneratedWill,
  assignWillToExecutors,
  removeExecutorFromWill
};
