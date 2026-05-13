/**
 * Will PDF Generation Controller (ReportLab version)
 * Generates professional 2-page Digital Will PDFs using Python
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { getUserById } = require('../models/userModel');
const { getAssetsByUserId } = require('../models/assetModel');
const { getExecutorsByUserId } = require('../models/executorModel');
const { saveGeneratedWill } = require('../models/willModel');

/**
 * Generate Digital Will PDF - ReportLab version
 * Calls Python service to generate professional PDF
 */
const generateProfessionalWill = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch user assets
    const assets = await getAssetsByUserId(userId);

    // Fetch user executors
    const executors = await getExecutorsByUserId(userId);

    // Map assets to PDF format
    const mappedAssets = assets.map((asset, index) => ({
      name: asset.asset_name || `Asset ${index + 1}`,
      type: asset.asset_type || 'Digital Asset',
      description: asset.description || 'Digital asset description',
      location: asset.location || '—',
      created_at: asset.created_at || new Date().toISOString().split('T')[0]
    }));

    // Map executors to PDF format
    const mappedExecutors = executors.map((executor, index) => ({
      name: executor.executor_name || `Executor ${index + 1}`,
      email: executor.executor_email || 'executor@example.com',
      permission: executor.permissions || 'View Only',
      status: executor.status || 'pending',
      access_granted: executor.is_active || false,
      created_at: executor.created_at || new Date().toISOString().split('T')[0]
    }));

    // Prepare user data for Python
    const userData = {
      id: user.id,
      full_name: (user.first_name && user.last_name) 
        ? `${user.first_name} ${user.last_name}`.toUpperCase()
        : user.email.toUpperCase(),
      email: user.email,
      date_of_birth: user.date_of_birth || new Date().toISOString().split('T')[0],
      assets: mappedAssets.slice(0, 3), // Limit to 3 for layout
      executors: mappedExecutors.slice(0, 2) // Limit to 2 for layout
    };

    console.log(`📄 Generating PDF for user ${userId}: ${userData.full_name}`);

    // Generate PDF via Python
    const pdfBuffer = await generatePdfViasPython(userData);

    // Save will to database
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Digital_Will_${userId}_${timestamp}.pdf`;
    const filepath = `/generated_wills/${filename}`;

    const will = await saveGeneratedWill(userId, {
      title: `Digital Will and Testament of ${userData.full_name}`,
      description: `Digital Will for ${userData.full_name}`,
      content: 'Generated using ReportLab professional template',
      file_path: filepath,
      status: 'draft'
    });

    console.log(`✅ PDF generated and saved: ${filename}`);

    // Send PDF to client
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (err) {
    console.error('❌ Error generating PDF:', err.message);
    res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
  }
};

/**
 * Generate PDF using Python ReportLab service
 * Spawns Python process with user data
 */
async function generatePdfViasPython(userData) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../services/willPdfGenerator.py');
    const python = spawn('python3', [pythonScript]);

    let pdfBuffer = Buffer.alloc(0);
    let errorOutput = '';

    // Send user data to Python process via stdin
    python.stdin.write(JSON.stringify(userData));
    python.stdin.end();

    // Collect PDF binary data from stdout
    python.stdout.on('data', (chunk) => {
      pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
    });

    // Capture error output
    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    // Handle process completion
    python.on('close', (code) => {
      if (code === 0 && pdfBuffer.length > 0) {
        resolve(pdfBuffer);
      } else {
        reject(new Error(`Python process failed: ${errorOutput}`));
      }
    });

    // Handle spawn errors
    python.on('error', (err) => {
      reject(new Error(`Failed to spawn Python: ${err.message}`));
    });
  });
}

/**
 * Download existing generated will
 */
const downloadGeneratedWill = async (req, res) => {
  try {
    const { willId } = req.params;
    const userId = req.user.id;

    // Fetch will from database
    const will = await getWillById(willId, userId);
    if (!will) {
      return res.status(404).json({ error: 'Will not found' });
    }

    if (!will.file_path) {
      return res.status(400).json({ error: 'Will file not available' });
    }

    // Construct full file path
    const filename = path.basename(will.file_path);
    const filepath = path.join(__dirname, '../generated_wills', filename);

    // Send file
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(filepath);

  } catch (err) {
    console.error('❌ Error downloading will:', err.message);
    res.status(500).json({ error: 'Failed to download will' });
  }
};

module.exports = {
  generateProfessionalWill,
  downloadGeneratedWill,
  generatePdfViasPython
};
