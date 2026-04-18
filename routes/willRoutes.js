const express = require('express');
const { verifyToken } = require('../backend/middleware/authMiddleware');
const { createNewWill, getAllWills, getWill, updateWillContent, publishTheWill, removeWill } = require('../backend/controllers/willController');
const { generateDigitalWill } = require('../backend/controllers/willGeneratorController');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// POST /wills - Create new will
router.post('/', createNewWill);

// GET /wills - Get all wills
router.get('/', getAllWills);

// GET /wills/:willId - Get single will
router.get('/:willId', getWill);

// PUT /wills/:willId - Update will
router.put('/:willId', updateWillContent);

// PATCH /wills/:willId/publish - Publish will
router.patch('/:willId/publish', publishTheWill);

// DELETE /wills/:willId - Delete will
router.delete('/:willId', removeWill);

module.exports = router;
