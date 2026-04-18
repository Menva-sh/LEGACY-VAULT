const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { addNewExecutor, getAllExecutors, getExecutor, updateExecutorInfo, setExecutorStatus, removeExecutorFromVault } = require('../controllers/executorController');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// POST /executors - Add new executor
// Body: { executorEmail, executorName?, permissions? }
// Returns: 201 with executor (status='pending', is_active=false)
router.post('/', addNewExecutor);

// GET /executors - Get all executors for authenticated user
// Returns: 200 with array of executors
router.get('/', getAllExecutors);

// GET /executors/:executorId - Get single executor
router.get('/:executorId', getExecutor);

// PUT /executors/:executorId - Update executor
router.put('/:executorId', updateExecutorInfo);

// PATCH /executors/:executorId/status - Update executor status
router.patch('/:executorId/status', setExecutorStatus);

// DELETE /executors/:executorId - Remove executor
router.delete('/:executorId', removeExecutorFromVault);

module.exports = router;
