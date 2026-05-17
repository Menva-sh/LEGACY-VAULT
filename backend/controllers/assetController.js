const { createAsset, getAssetsByUserId, getAssetById, updateAsset, deleteAsset, getAssetCount } = require('../models/assetModel');

// Upload/Create digital asset
const uploadAsset = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetName, assetType, description, email, password, actionType, lastMessage, action_type, last_message } = req.body;

    console.log('Asset creation - User ID:', userId);
    console.log('Request body:', { assetName, assetType, description, email });

    // Validation
    if (!assetName || !assetType) {
      console.error('Validation failed: Missing asset name or type');
      return res.status(400).json({ error: 'Asset name and type are required' });
    }

    if (!email) {
      console.error('Validation failed: Missing email');
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!userId) {
      console.error('No user ID in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const finalActionType = actionType || action_type || 'pass';
    const finalLastMessage = lastMessage || last_message || '';

    if (finalActionType === 'last_message' && !finalLastMessage) {
      return res.status(400).json({ error: 'Farewell message is required for Final Message action' });
    }

    const asset = await createAsset(userId, assetName, assetType, description || '', email, password || '', finalActionType, finalLastMessage);

    console.log('Asset created successfully:', asset);

    res.status(201).json({
      message: 'Digital asset created successfully',
      asset
    });
  } catch (err) {
    console.error('Upload asset error - Full details:', { message: err.message, code: err.code, stack: err.stack });
    res.status(500).json({ error: 'Failed to upload asset', details: err.message });
  }
};

// Get all assets for authenticated user
const getAllAssets = async (req, res) => {
  try {
    const userId = req.user.id;

    const assets = await getAssetsByUserId(userId);
    const count = await getAssetCount(userId);

    res.json({
      message: 'Assets retrieved successfully',
      count,
      assets
    });
  } catch (err) {
    console.error('Get assets error:', err);
    res.status(500).json({ error: 'Failed to retrieve assets' });
  }
};

// Get single asset
const getAsset = async (req, res) => {
  try {
    const { assetId } = req.params;
    const userId = req.user.id;

    const asset = await getAssetById(assetId, userId);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({
      message: 'Asset retrieved successfully',
      asset
    });
  } catch (err) {
    console.error('Get asset error:', err);
    res.status(500).json({ error: 'Failed to retrieve asset' });
  }
};

// Update asset metadata
const updateAssetMetadata = async (req, res) => {
  try {
    const { assetId } = req.params;
    const userId = req.user.id;
    const { assetName, email, password, description, actionType, lastMessage, action_type, last_message } = req.body;

    if (!assetName || !email) {
      return res.status(400).json({ error: 'Asset name and email are required' });
    }

    const finalActionType = actionType || action_type || 'pass';
    const finalLastMessage = lastMessage || last_message || '';
    const asset = await updateAsset(assetId, userId, assetName, email, password || '', description || '', finalActionType, finalLastMessage);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({
      message: 'Asset updated successfully',
      asset
    });
  } catch (err) {
    console.error('Update asset error:', err);
    res.status(500).json({ error: 'Failed to update asset' });
  }
};

// Delete asset
const removeAsset = async (req, res) => {
  try {
    const { assetId } = req.params;
    const userId = req.user.id;

    const asset = await deleteAsset(assetId, userId);

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({
      message: 'Asset deleted successfully',
      assetId: asset.id
    });
  } catch (err) {
    console.error('Delete asset error:', err);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
};

// Complete workflow for asset
const completeWorkflow = async (req, res) => {
  try {
    const { assetId } = req.params;
    const userId = req.user.id;
    const { action, executorId, completedAt } = req.body;

    // Validate required fields
    if (!action || !executorId || !completedAt) {
      return res.status(400).json({ error: 'Action, executorId, and completedAt are required' });
    }

    // Verify asset belongs to user
    const asset = await getAssetById(assetId, userId);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Get database connection
    const db = require('../db');

    // Insert workflow completion record
    const result = await db.query(
      `INSERT INTO asset_workflow_completions (asset_id, executor_id, action, completed_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, asset_id, executor_id, action, completed_at`,
      [assetId, executorId, action, new Date(completedAt)]
    );

    const completion = result.rows[0];

    console.log('Workflow completed for asset:', assetId, 'action:', action);

    res.status(201).json({
      message: 'Workflow completion recorded successfully',
      completion
    });
  } catch (err) {
    console.error('Complete workflow error:', err);
    res.status(500).json({ error: 'Failed to record workflow completion', details: err.message });
  }
};

module.exports = {
  uploadAsset,
  getAllAssets,
  getAsset,
  updateAssetMetadata,
  removeAsset,
  completeWorkflow
};
