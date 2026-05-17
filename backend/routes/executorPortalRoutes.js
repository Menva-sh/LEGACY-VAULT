const express = require('express');
const { getExecutorDashboard, viewWill, viewAsset, getExecutorLogs, getExecutorWills, getExecutorAssets, viewExecutorWill, downloadExecutorWill } = require('../controllers/executorPortalController');
const { verifyExecutorToken } = require('../controllers/executorAuthController');

const router = express.Router();

// ⚠️ IMPORTANT: Authenticated routes MUST come first (before parameterized routes)
// Otherwise /:executorId/wills/:willId will match /wills/:willId

// Authenticated executor portal routes (requires executor JWT token)
// GET /executor-portal/wills - Get all wills assigned to executor
router.get('/wills', verifyExecutorToken, getExecutorWills);

// GET /executor-portal/assets - Get all assets available to executor
router.get('/assets', verifyExecutorToken, getExecutorAssets);

// GET /executor-portal/wills/:willId - Get specific will for authenticated executor
router.get('/wills/:willId', verifyExecutorToken, viewExecutorWill);

// GET /executor-portal/wills/:willId/download - Download will PDF for authenticated executor
router.get('/wills/:willId/download', verifyExecutorToken, downloadExecutorWill);

// Executor portal routes (no authentication needed - external access)
// In production, implement token-based access or email verification

// GET /executor-portal/:executorId/dashboard - Executor dashboard
router.get('/:executorId/dashboard', getExecutorDashboard);

// GET /executor-portal/:executorId/wills/:willId - View specific will
router.get('/:executorId/wills/:willId', viewWill);

// GET /executor-portal/:executorId/assets/:assetId - View specific asset
router.get('/:executorId/assets/:assetId', viewAsset);

// GET /executor-portal/:executorId/logs - View access history
router.get('/:executorId/logs', getExecutorLogs);

module.exports = router;
