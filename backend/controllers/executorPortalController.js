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

    // Log access - get vault owner first
    if (wills.length > 0) {
      const vaultOwner = await getVaultOwnerByExecutorId(executorId);
      if (vaultOwner) {
        await logAccess(executorId, vaultOwner.id, 'wills_list_view', 'executor_portal_wills');
      }
    }

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

// Get single will for authenticated executor
const viewExecutorWill = async (req, res) => {
  try {
    const executorId = req.executorId; // From executor auth middleware
    const { willId } = req.params;

    if (!executorId) {
      return res.status(401).json({ error: 'Not authenticated as executor' });
    }

    if (!willId) {
      return res.status(400).json({ error: 'Will ID is required' });
    }

    console.log(`📖 Fetching will ${willId} for executor ${executorId}`);

    // Get the will - verify it's assigned to this executor
    const wills = await getPublishedWillsByExecutor(executorId);
    const will = wills.find(w => w.id === parseInt(willId));

    if (!will) {
      console.error(`❌ Will ${willId} not found or not assigned to executor ${executorId}`);
      return res.status(404).json({ error: 'Will not found or not assigned to you' });
    }

    // Log access
    const vaultOwner = await getVaultOwnerByExecutorId(executorId);
    if (vaultOwner) {
      await logAccess(executorId, vaultOwner.id, 'will_view', `will_${willId}`);
    }

    console.log(`✅ Found will: ${will.title}`);

    res.status(200).json({
      message: 'Will retrieved successfully',
      will
    });
  } catch (err) {
    console.error('❌ Error fetching executor will:', err.message);
    res.status(500).json({ error: 'Failed to retrieve will' });
  }
};

// Download will PDF for authenticated executor
const downloadExecutorWill = async (req, res) => {
  try {
    const executorId = req.executorId; // From executor auth middleware
    const { willId } = req.params;

    if (!executorId) {
      return res.status(401).json({ error: 'Not authenticated as executor' });
    }

    if (!willId) {
      return res.status(400).json({ error: 'Will ID is required' });
    }

    console.log(`📥 Downloading will ${willId} for executor ${executorId}`);

    // Verify will is assigned to this executor
    const wills = await getPublishedWillsByExecutor(executorId);
    const will = wills.find(w => w.id === parseInt(willId));

    if (!will) {
      console.error(`❌ Will ${willId} not found or not assigned to executor ${executorId}`);
      return res.status(403).json({ error: 'Will not found or not assigned to you' });
    }

    // Check if file path exists
    if (!will.file_path) {
      console.error(`❌ Will ${willId} has no file path`);
      return res.status(400).json({ error: 'Will PDF not available' });
    }

    // Construct full file path
    const fs = require('fs');
    const path = require('path');
    const filename = path.basename(will.file_path);
    const filepath = path.join(__dirname, '../generated_wills', filename);

    console.log(`📂 Looking for file: ${filepath}`);

    // Verify file exists
    if (!fs.existsSync(filepath)) {
      console.error(`❌ File not found: ${filepath}`);
      return res.status(404).json({ error: 'Will file not found' });
    }

    // Log access
    const vaultOwner = await getVaultOwnerByExecutorId(executorId);
    if (vaultOwner) {
      await logAccess(executorId, vaultOwner.id, 'will_download', `will_${willId}`);
    }

    console.log(`✅ Sending file: ${filename}`);

    // Send file with proper headers
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const fileStream = require('fs').createReadStream(filepath);

    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error reading file' });
      }
    });

    fileStream.pipe(res);

  } catch (err) {
    console.error('❌ Error downloading will:', err.message);
    res.status(500).json({ error: 'Failed to download will' });
  }
};

module.exports = {
  getExecutorDashboard,
  viewWill,
  viewAsset,
  getExecutorLogs,
  getExecutorWills,
  viewExecutorWill,
  downloadExecutorWill
};
