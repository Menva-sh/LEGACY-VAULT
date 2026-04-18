const express = require('express');
const { getExecutorDashboard, viewWill, viewAsset, getExecutorLogs } = require('../backend/controllers/executorPortalController');

const router = express.Router();

// Executor portal routes (no authentication needed - external access)
// In production, implement token-based access or email verification

// GET /portal/:executorId/dashboard - Executor dashboard
router.get('/:executorId/dashboard', getExecutorDashboard);

// GET /portal/:executorId/wills/:willId - View specific will
router.get('/:executorId/wills/:willId', viewWill);

// GET /portal/:executorId/assets/:assetId - View specific asset
router.get('/:executorId/assets/:assetId', viewAsset);

// GET /portal/:executorId/logs - View access history
router.get('/:executorId/logs', getExecutorLogs);

module.exports = router;
