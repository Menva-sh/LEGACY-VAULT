const express = require('express');
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const { createNewWill, getAllWills, getWill, updateWillContent, publishTheWill, removeWill } = require('../controllers/willController');
const { generateDigitalWill } = require('../controllers/willGeneratorController');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// POST /wills - Create new will
router.post('/', createNewWill);

// GET /wills - Get all wills
router.get('/', getAllWills);

// GET /wills/download/:filename - Download PDF (must be before /:willId to match first)
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../generated_wills', filename);

    // Verify file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Send file with proper headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    const fileStream = fs.createReadStream(filepath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      res.status(500).json({ error: 'Error reading file' });
    });
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// GET /wills/:willId - Get single will
router.get('/:willId', getWill);

// PUT /wills/:willId - Update will
router.put('/:willId', updateWillContent);

// PATCH /wills/:willId/publish - Publish will
router.patch('/:willId/publish', publishTheWill);

// DELETE /wills/:willId - Delete will
router.delete('/:willId', removeWill);

module.exports = router;
