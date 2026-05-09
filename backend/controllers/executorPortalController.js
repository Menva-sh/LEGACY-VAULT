const { getAccessLogs, logAccess, getExecutorByEmail, getVaultOwnerByExecutorId, getExecutorAccessibleWills, getExecutorAccessibleAssets } = require('../models/executorPortalModel');
const { getWillById, getPublishedWillsByExecutor } = require('../models/willModel');
const { getAssetById } = require('../models/assetModel');

// Executor dashboard overview (what they have access to)
const getExecutorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { executorId } = req.params;

    // Get vault owner details
    const vaultOwner = await getVaultOwnerByExecutorId(executorId);
    if (!vaultOwner) {
      return res.status(404).json({ error: 'Executor not found' });
    }

    // Get accessible wills
    const wills = await getExecutorAccessibleWills(executorId);

    // Get accessible assets
    const assets = await getExecutorAccessibleAssets(executorId);

    // Log access
    await logAccess(executorId, vaultOwner.id, 'dashboard_view', 'vault_overview');

    res.json({
      message: 'Executor dashboard retrieved successfully',
      vaultOwner,
      summary: {
        willsCount: wills.length,
        assetsCount: assets.length
      },
      wills,
      assets
    });
  } catch (err) {
    console.error('Get executor dashboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard' });
  }
};

// Get specific will for executor
const viewWill = async (req, res) => {
  try {
    const { executorId, willId } = req.params;

    // Get vault owner
    const vaultOwner = await getVaultOwnerByExecutorId(executorId);
    if (!vaultOwner) {
      return res.status(404).json({ error: 'Executor not found' });
    }

    // Get will
    const will = await getWillById(willId, vaultOwner.id);
    if (!will) {
      return res.status(404).json({ error: 'Will not found' });
    }

    // Log access
    await logAccess(executorId, vaultOwner.id, 'will_view', `will_${willId}`);

    res.json({
      message: 'Will retrieved successfully',
      will
    });
  } catch (err) {
    console.error('View will error:', err);
    res.status(500).json({ error: 'Failed to retrieve will' });
  }
};

// Get specific asset for executor
const viewAsset = async (req, res) => {
  try {
    const { executorId, assetId } = req.params;

    // Get vault owner
    const vaultOwner = await getVaultOwnerByExecutorId(executorId);
    if (!vaultOwner) {
      return res.status(404).json({ error: 'Executor not found' });
    }

    // Get asset
    const asset = await getAssetById(assetId, vaultOwner.id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Log access
    await logAccess(executorId, vaultOwner.id, 'asset_view', `asset_${assetId}`);

    res.json({
      message: 'Asset retrieved successfully',
      asset
    });
  } catch (err) {
    console.error('View asset error:', err);
    res.status(500).json({ error: 'Failed to retrieve asset' });
  }
};

// Get executor access history/logs
const getExecutorLogs = async (req, res) => {
  try {
    const { executorId } = req.params;
    const { limit } = req.query;

    const logs = await getAccessLogs(executorId, parseInt(limit) || 50);

    res.json({
      message: 'Access logs retrieved successfully',
      count: logs.length,
      logs
    });
  } catch (err) {
    console.error('Get access logs error:', err);
    res.status(500).json({ error: 'Failed to retrieve access logs' });
  }
};

// Get wills for authenticated executor
const getExecutorWills = async (req, res) => {
  try {
    const executorId = req.executorId; // From executor auth middleware

    if (!executorId) {
      return res.status(401).json({ error: 'Not authenticated as executor' });
    }

    console.log(`📄 Fetching wills for executor: ${executorId}`);

    const wills = await getPublishedWillsByExecutor(executorId);

    console.log(`✅ Found ${wills.length} wills for executor ${executorId}`);

    res.status(200).json({
      message: 'Wills retrieved successfully',
      wills
    });
  } catch (err) {
    console.error('❌ Error fetching executor wills:', err.message);
    res.status(500).json({ error: 'Failed to retrieve wills' });
  }
};

module.exports = {
  getExecutorDashboard,
  viewWill,
  viewAsset,
  getExecutorLogs,
  getExecutorWills
};
