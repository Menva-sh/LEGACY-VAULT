const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadAsset, getAllAssets, getAsset, updateAssetMetadata, removeAsset } = require('../controllers/assetController');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// POST /assets - Upload/Create digital asset
router.post('/', uploadAsset);

// GET /assets - Get all assets for user
router.get('/', getAllAssets);

// GET /assets/:assetId - Get single asset
router.get('/:assetId', getAsset);

// PUT /assets/:assetId - Update asset metadata
router.put('/:assetId', updateAssetMetadata);

// DELETE /assets/:assetId - Delete asset
router.delete('/:assetId', removeAsset);

module.exports = router;
