const pool = require('../db');

// Create dead man's switch
const createSwitch = async (userId, triggerType, triggerValue, actionType, description) => {
  try {
    const query = `
      INSERT INTO dead_mans_switch (user_id, trigger_type, trigger_value, action_type, description, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, true, NOW())
      RETURNING id, user_id, trigger_type, trigger_value, action_type, description, is_active, created_at
    `;
    const result = await pool.query(query, [userId, triggerType, triggerValue, actionType, description]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error creating switch: ${err.message}`);
  }
};

// Get all switches for user
const getSwitchesByUserId = async (userId) => {
  try {
    const query = 'SELECT id, user_id, trigger_type, trigger_value, action_type, description, is_active, last_check, triggered_at, created_at FROM dead_mans_switch WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching switches: ${err.message}`);
  }
};

// Get single switch
const getSwitchById = async (switchId, userId) => {
  try {
    const query = 'SELECT id, user_id, trigger_type, trigger_value, action_type, description, is_active, last_check, triggered_at FROM dead_mans_switch WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [switchId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error fetching switch: ${err.message}`);
  }
};

// Update switch
const updateSwitch = async (switchId, userId, triggerValue, actionType, description) => {
  try {
    const query = `
      UPDATE dead_mans_switch
      SET trigger_value = $1, action_type = $2, description = $3, updated_at = NOW()
      WHERE id = $4 AND user_id = $5
      RETURNING id, trigger_type, trigger_value, action_type, description, is_active
    `;
    const result = await pool.query(query, [triggerValue, actionType, description, switchId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error updating switch: ${err.message}`);
  }
};

// Manually trigger switch
const triggerSwitch = async (switchId, userId) => {
  try {
    const query = `
      UPDATE dead_mans_switch
      SET triggered_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND is_active = true
      RETURNING id, trigger_type, triggered_at
    `;
    const result = await pool.query(query, [switchId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error triggering switch: ${err.message}`);
  }
};

// Ping switch (reset last check time)
const pingSwitch = async (switchId, userId) => {
  try {
    const query = `
      UPDATE dead_mans_switch
      SET last_check = NOW(), updated_at = NOW()
      WHERE id = $1 AND user_id = $2 AND is_active = true
      RETURNING id, trigger_type, last_check
    `;
    const result = await pool.query(query, [switchId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error pinging switch: ${err.message}`);
  }
};

// Deactivate/Activate switch
const toggleSwitchStatus = async (switchId, userId, isActive) => {
  try {
    const query = `
      UPDATE dead_mans_switch
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING id, is_active
    `;
    const result = await pool.query(query, [isActive, switchId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error toggling switch status: ${err.message}`);
  }
};

// Delete switch
const deleteSwitch = async (switchId, userId) => {
  try {
    const query = 'DELETE FROM dead_mans_switch WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await pool.query(query, [switchId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error deleting switch: ${err.message}`);
  }
};

// Get active switches that need checking (older than trigger value in days)
const getTriggeredSwitches = async () => {
  try {
    const query = `
      SELECT id, user_id, trigger_type, trigger_value, action_type, description, last_check, triggered_at
      FROM dead_mans_switch
      WHERE is_active = true
      AND trigger_type = 'inactivity_days'
      AND (last_check IS NULL OR last_check < NOW() - INTERVAL '1 day' * trigger_value)
      AND triggered_at IS NULL
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching triggered switches: ${err.message}`);
  }
};

module.exports = {
  createSwitch,
  getSwitchesByUserId,
  getSwitchById,
  updateSwitch,
  triggerSwitch,
  pingSwitch,
  toggleSwitchStatus,
  deleteSwitch,
  getTriggeredSwitches
};
