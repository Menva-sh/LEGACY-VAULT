const pool = require('../db');

// Create digital asset
const createAsset = async (userId, assetName, assetType, description, email, password) => {
  try {
    const query = `
      INSERT INTO digital_assets (user_id, asset_name, asset_type, description, email, password, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, user_id, asset_name, asset_type, description, email, password, created_at
    `;
    const result = await pool.query(query, [userId, assetName, assetType, description, email, password]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error creating asset: ${err.message}`);
  }
};

// Get all assets for a user
const getAssetsByUserId = async (userId) => {
  try {
    const query = 'SELECT id, user_id, asset_name, asset_type, description, email, created_at FROM digital_assets WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (err) {
    throw new Error(`Error fetching assets: ${err.message}`);
  }
};

// Get single asset by id
const getAssetById = async (assetId, userId) => {
  try {
    const query = 'SELECT id, user_id, asset_name, asset_type, description, email, password, created_at FROM digital_assets WHERE id = $1 AND user_id = $2';
    const result = await pool.query(query, [assetId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error fetching asset: ${err.message}`);
  }
};

// Update asset
const updateAsset = async (assetId, userId, assetName, email, password, description) => {
  try {
    const query = `
      UPDATE digital_assets
      SET asset_name = $1, email = $2, password = $3, description = $4, updated_at = NOW()
      WHERE id = $5 AND user_id = $6
      RETURNING id, asset_name, email, password, description, updated_at
    `;
    const result = await pool.query(query, [assetName, email, password, description, assetId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error updating asset: ${err.message}`);
  }
};

// Delete asset
const deleteAsset = async (assetId, userId) => {
  try {
    const query = 'DELETE FROM digital_assets WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await pool.query(query, [assetId, userId]);
    return result.rows[0];
  } catch (err) {
    throw new Error(`Error deleting asset: ${err.message}`);
  }
};

// Get asset count for a user
const getAssetCount = async (userId) => {
  try {
    const query = 'SELECT COUNT(*) as count FROM digital_assets WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  } catch (err) {
    throw new Error(`Error counting assets: ${err.message}`);
  }
};

module.exports = {
  createAsset,
  getAssetsByUserId,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetCount
};
