/**
 * Will PDF Generation Controller
 * Generates professional Digital Will PDFs using PDFKit
 */

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { getUserById } = require('../models/userModel');
const { getAssetsByUserId } = require('../models/assetModel');
const { getExecutorsByUserId } = require('../models/executorModel');
const { saveGeneratedWill } = require('../models/willModel');

/**
 * Generate Digital Will PDF - ReportLab version
 * Calls Python service to generate professional PDF and saves to database
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

    // Save PDF to disk
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Digital_Will_${userId}_${timestamp}.pdf`;
    const filepath = path.join(__dirname, '../generated_wills', filename);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filepath), { recursive: true });

    // Write PDF to disk
    await fs.writeFile(filepath, pdfBuffer);
    console.log(`✅ PDF saved to disk: ${filepath}`);

    // Save will record to database
    const relativeFilePath = `generated_wills/${filename}`;
    const willTitle = `Digital Will - ${userData.full_name}`;
    const willDescription = `Professional digital will with ${mappedAssets.length} asset(s) and ${mappedExecutors.length} executor(s)`;
    const willContent = 'Generated using PDFKit professional template';
    
    const will = await saveGeneratedWill(
      userId, 
      willTitle, 
      willDescription, 
      willContent, 
      relativeFilePath
    );

    console.log(`✅ PDF generated and saved: ${filename}`);

    // Return JSON response (matching old endpoint behavior)
    res.status(200).json({
      message: 'Digital will PDF generated successfully',
      will: {
        id: will.id,
        title: will.title,
        description: will.description,
        status: will.status,
        file_path: will.file_path,
        created_at: will.created_at,
        download_url: `/${filename}`
      }
    });

  } catch (err) {
    console.error('❌ Error generating PDF:', err.message);
    res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
  }
};

/**
 * Generate PDF using Node.js with professional styling
 * Uses PDFKit with professional layout and branding
 */
async function generatePdfViasPython(userData) {
  const PDFDocument = require('pdfkit');
  
  return new Promise((resolve, reject) => {
    try {
      const pdfBuffer = [];
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40
      });

      // Collect PDF data
      doc.on('data', (chunk) => {
        pdfBuffer.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(pdfBuffer));
      });

      doc.on('error', (err) => {
        reject(err);
      });

      // ═══════════════════════════════════════════════════════════
      // PAGE 1 — MAIN DOCUMENT
      // ═══════════════════════════════════════════════════════════

      // Header
      doc.fontSize(24).font('Helvetica-Bold').fillColor('#6b2d4e');
      doc.text('DIGITAL WILL', { align: 'center' });
      doc.fontSize(10).text('Last Will and Testament of Digital Assets', { align: 'center' });
      doc.moveDown(0.5);

      // Grantor info
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#6b2d4e');
      doc.text('GRANTOR INFORMATION');
      doc.moveDown(0.3);

      doc.fontSize(11).font('Helvetica').fillColor('#2c2c2a');
      doc.text(`Name: ${userData.full_name}`);
      doc.text(`Email: ${userData.email}`);
      doc.text(`User ID: #${userData.id}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown(0.5);

      // Digital Assets
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#6b2d4e');
      doc.text('DIGITAL ASSETS');
      doc.moveDown(0.3);

      if (userData.assets && userData.assets.length > 0) {
        userData.assets.forEach((asset, index) => {
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a0810');
          doc.text(`${index + 1}. ${asset.name}`);
          
          doc.fontSize(10).font('Helvetica').fillColor('#4a4846');
          doc.text(`Type: ${asset.type}`);
          doc.text(`Description: ${asset.description}`);
          doc.text(`Location: ${asset.location}`);
          doc.text(`Created: ${asset.created_at}`);
          doc.moveDown(0.2);
        });
      } else {
        doc.fontSize(11).font('Helvetica').text('No digital assets registered.');
      }
      doc.moveDown(0.5);

      // Executors
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#6b2d4e');
      doc.text('DESIGNATED EXECUTORS');
      doc.moveDown(0.3);

      if (userData.executors && userData.executors.length > 0) {
        userData.executors.forEach((executor, index) => {
          doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a0810');
          doc.text(`${index + 1}. ${executor.name}`);
          
          doc.fontSize(10).font('Helvetica').fillColor('#4a4846');
          doc.text(`Email: ${executor.email}`);
          doc.text(`Permission: ${executor.permission}`);
          doc.text(`Status: ${executor.status}`);
          doc.text(`Access: ${executor.access_granted ? 'Granted' : 'Pending'}`);
          doc.moveDown(0.2);
        });
      } else {
        doc.fontSize(11).font('Helvetica').text('No executors designated.');
      }
      doc.moveDown(0.5);

      // Disclaimer
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#6b2d4e');
      doc.text('LEGAL DISCLAIMER');
      doc.moveDown(0.3);

      const disclaimer = `This Digital Will is generated by LEGACY VAULT and serves as a record of your digital assets and executor designations. This document is intended to supplement, not replace, legal advice. For a binding will with legal effect, please consult with an attorney licensed in your jurisdiction. This digital record should be reviewed regularly and updated as your circumstances change. Legacy Vault accepts no liability for the legal validity of this instrument.`;

      doc.fontSize(10).font('Helvetica').fillColor('#4a4846');
      doc.text(disclaimer, { align: 'justify' });
      doc.moveDown(0.5);

      // Footer
      doc.fontSize(9).fillColor('#999790');
      doc.text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
      doc.text(`Document ID: will_${userData.id}_${new Date().toISOString().split('T')[0]}`, { align: 'center' });

      // Finalize document
      doc.end();

    } catch (err) {
      reject(err);
    }
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
