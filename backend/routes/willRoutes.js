const express = require('express');
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const { createNewWill, getAllWills, getWill, updateWillContent, publishTheWill, removeWill, assignToExecutors, removeFromExecutor } = require('../controllers/willController');
const { generateDigitalWill } = require('../controllers/willGeneratorController');
const { generateProfessionalWill, downloadGeneratedWill } = require('../controllers/willPdfController');

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
    console.log(`Download request for: ${filename}`);
    
    const filepath = path.join(__dirname, '../generated_wills', filename);
    console.log(`Full path: ${filepath}`);

    // Verify file exists
    if (!fs.existsSync(filepath)) {
      console.error(`File not found: ${filepath}`);
      return res.status(404).json({ error: 'File not found' });
    }

    console.log(`File found, sending: ${filepath}`);

    // Send file with proper headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const fileStream = fs.createReadStream(filepath);
    
    fileStream.on('error', (err) => {
      console.error('File stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error reading file' });
      }
    });
    
    fileStream.pipe(res);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// POST /wills/generate-professional - Generate professional PDF using ReportLab
router.post('/generate-professional', generateProfessionalWill);

// GET /wills/:willId - Get single will
router.get('/:willId', getWill);

// PUT /wills/:willId - Update will
router.put('/:willId', updateWillContent);

// PATCH /wills/:willId/publish - Publish will
router.patch('/:willId/publish', publishTheWill);

// POST /wills/:willId/assign-executors - Assign will to multiple executors
router.post('/:willId/assign-executors', assignToExecutors);

// DELETE /wills/:willId/executors/:executorId - Remove executor from will
router.delete('/:willId/executors/:executorId', removeFromExecutor);

// DELETE /wills/:willId - Delete will
router.delete('/:willId', removeWill);

module.exports = router;
