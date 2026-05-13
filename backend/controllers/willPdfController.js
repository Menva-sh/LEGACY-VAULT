/**
 * Will PDF Generation Controller (ReportLab version)
 * Generates professional 2-page Digital Will PDFs using Python
 */

const { spawn } = require('child_process');
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
    const will = await saveGeneratedWill(userId, {
      title: `Digital Will and Testament of ${userData.full_name}`,
      description: `Professional digital will for ${userData.full_name} with ${mappedAssets.length} asset(s) and ${mappedExecutors.length} executor(s)`,
      content: 'Generated using ReportLab professional template',
      file_path: relativeFilePath,
      status: 'draft'
    });

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
        margin: 20 * 2.834645669, // 20mm in points
        bufferPages: true
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

      // Background color
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fdf8f5');

      // Left border (MAUVE)
      doc.rect(0, 0, 3.5 * 2.834645669, doc.page.height).fill('#6b2d4e');

      // Right border (MAUVE)
      const docWidth = doc.page.width;
      doc.rect(docWidth - 3.5 * 2.834645669, 0, 3.5 * 2.834645669, doc.page.height).fill('#6b2d4e');

      // Header band
      const headerHeight = 56 * 2.834645669;
      doc.rect(0, docWidth - headerHeight, docWidth, headerHeight).fill('#6b2d4e');

      // Wordmark
      doc.fontSize(7).fillColor('#f4c0d1').font('Helvetica');
      doc.text('L  E  G  A  C  Y     V  A  U  L  T', 20 * 2.834645669, (docWidth - 11 * 2.834645669));

      // Main title
      doc.fontSize(22).fillColor('#ffffff').font('Helvetica-Bold');
      doc.text('LAST WILL AND TESTAMENT', 20 * 2.834645669, (docWidth - 28 * 2.834645669));

      // Subtitle
      doc.fontSize(11).fillColor('#f4c0d1').font('Helvetica-Bold');
      doc.text('OF DIGITAL ASSETS AND ELECTRONIC PROPERTY', 20 * 2.834645669, (docWidth - 36 * 2.834645669));

      // Document meta
      doc.fontSize(7).fillColor('#c4889e').font('Helvetica');
      const metaX = docWidth - 20 * 2.834645669;
      doc.text('INSTRUMENT NO.  will_' + userData.id + '_' + new Date().toISOString().split('T')[0], metaX - 100, (docWidth - 44 * 2.834645669), { align: 'right' });
      doc.text('EXECUTED: ' + new Date().toLocaleDateString() + '  ·  CONFIDENTIAL', metaX - 100, (docWidth - 49.5 * 2.834645669), { align: 'right' });

      // Move to content area
      let y = docWidth - 64 * 2.834645669;

      // Preamble box
      doc.rect(20 * 2.834645669, y - 32 * 2.834645669, (docWidth - 40 * 2.834645669), 32 * 2.834645669)
        .fillAndStroke('#ffffff', '#dedad4');

      // Left strip in preamble
      doc.rect(20 * 2.834645669, y - 32 * 2.834645669, 5 * 2.834645669, 32 * 2.834645669).fill('#6b2d4e');

      // Preamble text
      doc.fontSize(8.5).fillColor('#4a4846').font('Helvetica');
      const preambleText = `KNOW ALL MEN BY THESE PRESENTS: I, ${userData.full_name}, User Identification Number #${userData.id}, domiciled and registered with Legacy Vault, being of sound and disposing mind and memory, and not acting under duress, menace, fraud, or undue influence of any person, do hereby make, publish, and declare this my Last Will and Testament of Digital Assets, hereby revoking all former digital wills, codicils, and testamentary dispositions of digital property heretofore made by me.`;
      
      doc.text(preambleText, 20 * 2.834645669 + 8 * 2.834645669, y - 28 * 2.834645669, {
        width: docWidth - 48 * 2.834645669,
        align: 'justify'
      });

      y -= 37 * 2.834645669;

      // ARTICLE I — GRANTOR IDENTIFICATION
      doc.fontSize(7).fillColor('#6b2d4e').font('Helvetica-Bold');
      doc.text('ARTICLE  I', 20 * 2.834645669, y);

      doc.fontSize(10.5).text('GRANTOR IDENTIFICATION', 20 * 2.834645669 + 29 * 2.834645669, y);

      y -= 7 * 2.834645669;

      // Grantor info fields
      doc.fontSize(6.5).fillColor('#999790').font('Helvetica');
      doc.text('FULL LEGAL NAME', 20 * 2.834645669, y);
      doc.text('DATE OF BIRTH / REG.', 20 * 2.834645669 + docWidth/2, y);

      doc.fontSize(10).fillColor('#1a0810').font('Helvetica-Bold');
      doc.text(userData.full_name, 20 * 2.834645669, y - 5 * 2.834645669);
      doc.text(userData.date_of_birth, 20 * 2.834645669 + docWidth/2, y - 5 * 2.834645669);

      y -= 13 * 2.834645669;

      // EMAIL and USER ID
      doc.fontSize(6.5).fillColor('#999790').font('Helvetica');
      doc.text('EMAIL ADDRESS', 20 * 2.834645669, y);
      doc.text('USER IDENTIFICATION', 20 * 2.834645669 + docWidth/2, y);

      doc.fontSize(10).fillColor('#1a0810').font('Helvetica-Bold');
      doc.text(userData.email, 20 * 2.834645669, y - 5 * 2.834645669);
      doc.text('Legacy Vault ID #' + userData.id, 20 * 2.834645669 + docWidth/2, y - 5 * 2.834645669);

      y -= 14 * 2.834645669;

      // ARTICLE II — DIGITAL ASSETS
      doc.fontSize(7).fillColor('#6b2d4e').font('Helvetica-Bold');
      doc.text('ARTICLE  II', 20 * 2.834645669, y);

      doc.fontSize(10.5).text('SCHEDULE OF DIGITAL ASSETS', 20 * 2.834645669 + 29 * 2.834645669, y);

      y -= 7 * 2.834645669;

      // Assets intro
      doc.fontSize(8).fillColor('#4a4846').font('Helvetica-Oblique');
      const assetsIntro = 'I give, bequeath, and devise the following digital assets, being the whole of my electronic estate, as specifically enumerated herein. Each asset shall pass to the designated Executor(s) in accordance with the permissions granted under Article III:';
      doc.text(assetsIntro, 20 * 2.834645669, y, {
        width: docWidth - 40 * 2.834645669,
        align: 'justify'
      });

      y -= 14 * 2.834645669;

      // Asset cards
      userData.assets.forEach((asset, index) => {
        const cardY = y;
        const cardHeight = 16 * 2.834645669;

        // Card background
        doc.rect(20 * 2.834645669, cardY - cardHeight, docWidth - 40 * 2.834645669, cardHeight)
          .fillAndStroke('#ffffff', '#dedad4');

        // Left strip
        doc.rect(20 * 2.834645669, cardY - cardHeight, 6 * 2.834645669, cardHeight).fill('#6b2d4e');

        // Roman numeral
        const romanNums = ['I', 'II', 'III'];
        doc.fontSize(7).fillColor('#ffffff').font('Helvetica-Bold');
        doc.text(romanNums[index] || 'IV', 20 * 2.834645669 + 3 * 2.834645669, cardY - cardHeight + 3 * 2.834645669);

        // Asset name
        doc.fontSize(10).fillColor('#1a0810').font('Helvetica-Bold');
        doc.text(asset.name, 20 * 2.834645669 + 9 * 2.834645669, cardY - cardHeight + 5.5 * 2.834645669);

        // Description
        doc.fontSize(8).fillColor('#4a4846').font('Helvetica');
        doc.text(asset.description, 20 * 2.834645669 + 9 * 2.834645669, cardY - cardHeight + 11 * 2.834645669);

        // Location and date (right side)
        doc.fontSize(7).fillColor('#999790').font('Helvetica');
        doc.text(`Location: ${asset.location}`, docWidth - 20 * 2.834645669 - 60, cardY - cardHeight + 5.5 * 2.834645669, { align: 'right' });
        doc.text(`Recorded: ${asset.created_at}`, docWidth - 20 * 2.834645669 - 60, cardY - cardHeight + 11 * 2.834645669, { align: 'right' });

        y -= (16 + 2) * 2.834645669;
      });

      y -= 6 * 2.834645669;

      // ARTICLE III — EXECUTORS
      doc.fontSize(7).fillColor('#6b2d4e').font('Helvetica-Bold');
      doc.text('ARTICLE  III', 20 * 2.834645669, y);

      doc.fontSize(10.5).text('APPOINTMENT OF PERSONAL EXECUTORS', 20 * 2.834645669 + 29 * 2.834645669, y);

      y -= 7 * 2.834645669;

      // Executors intro
      doc.fontSize(8).fillColor('#4a4846').font('Helvetica-Oblique');
      const executorsIntro = 'I hereby nominate, constitute, and appoint the following named individuals as Personal Executors of my digital estate. Each Executor shall serve in a fiduciary capacity and shall have only such authority as is expressly granted herein:';
      doc.text(executorsIntro, 20 * 2.834645669, y, {
        width: docWidth - 40 * 2.834645669,
        align: 'justify'
      });

      y -= 14 * 2.834645669;

      // Executor cards
      userData.executors.forEach((executor, index) => {
        const cardY = y;
        const cardHeight = 17 * 2.834645669;

        // Card background
        doc.rect(20 * 2.834645669, cardY - cardHeight, docWidth - 40 * 2.834645669, cardHeight)
          .fillAndStroke('#ffffff', '#dedad4');

        // Left strip (MAUVE_LIGHT)
        doc.rect(20 * 2.834645669, cardY - cardHeight, 6 * 2.834645669, cardHeight).fill('#c08fa8');

        // Roman numeral
        const romanNums = ['I', 'II'];
        doc.fontSize(7).fillColor('#ffffff').font('Helvetica-Bold');
        doc.text(romanNums[index] || 'III', 20 * 2.834645669 + 3 * 2.834645669, cardY - cardHeight + 3 * 2.834645669);

        // Executor name
        doc.fontSize(10).fillColor('#1a0810').font('Helvetica-Bold');
        doc.text(executor.name, 20 * 2.834645669 + 9 * 2.834645669, cardY - cardHeight + 5.5 * 2.834645669);

        // Email
        doc.fontSize(8).fillColor('#4a4846').font('Helvetica');
        doc.text(executor.email, 20 * 2.834645669 + 9 * 2.834645669, cardY - cardHeight + 10.5 * 2.834645669);

        // Right side info
        doc.fontSize(7).fillColor('#999790').font('Helvetica');
        doc.text(`Permission: ${executor.permission}`, docWidth - 20 * 2.834645669 - 140, cardY - cardHeight + 5 * 2.834645669, { align: 'right' });
        doc.text(`Status: ${executor.status}`, docWidth - 20 * 2.834645669 - 140, cardY - cardHeight + 9.5 * 2.834645669, { align: 'right' });

        y -= (17 + 2) * 2.834645669;
      });

      y -= 6 * 2.834645669;

      // ARTICLE IV — DISCLAIMER
      doc.fontSize(7).fillColor('#6b2d4e').font('Helvetica-Bold');
      doc.text('ARTICLE  IV', 20 * 2.834645669, y);

      doc.fontSize(10.5).text('GOVERNING TERMS AND LEGAL DISCLAIMER', 20 * 2.834645669 + 29 * 2.834645669, y);

      y -= 7 * 2.834645669;

      // Disclaimer card
      const disclaimerHeight = 28 * 2.834645669;
      doc.rect(20 * 2.834645669, y - disclaimerHeight, docWidth - 40 * 2.834645669, disclaimerHeight)
        .fillAndStroke('#ffffff', '#dedad4');

      doc.rect(20 * 2.834645669, y - disclaimerHeight, 5 * 2.834645669, disclaimerHeight).fill('#f4c0d1');

      doc.fontSize(7.8).fillColor('#4a4846').font('Helvetica');
      const disclaimer = 'This instrument has been generated by LEGACY VAULT and constitutes a formal record of the Testator\'s digital estate. This document is intended to supplement — and not replace — a legally executed will under the laws of the applicable jurisdiction. The Testator is strongly advised to seek independent legal counsel to give this instrument full binding legal effect. This record shall be reviewed and updated periodically to reflect any change in the Testator\'s digital estate or personal circumstances. Legacy Vault accepts no liability for the legal validity of this instrument in any jurisdiction.';

      doc.text(disclaimer, 20 * 2.834645669 + 8 * 2.834645669, y - disclaimerHeight + 3 * 2.834645669, {
        width: docWidth - 56 * 2.834645669,
        align: 'justify'
      });

      // Footer
      doc.rect(0, 0, docWidth, 11 * 2.834645669).fill('#6b2d4e');
      doc.fontSize(7).fillColor('#c4889e').font('Helvetica');
      doc.text('Generated by Legacy Vault  ·  legacyvault.com', 20 * 2.834645669, 4 * 2.834645669);
      doc.text('LAST WILL AND TESTAMENT  —  ' + userData.full_name, docWidth / 2 - 100, 4 * 2.834645669, { align: 'center' });
      doc.text('Instrument No. will_' + userData.id + '_' + new Date().toISOString().split('T')[0] + '  ·  Page 1 of 2', docWidth - 20 * 2.834645669 - 100, 4 * 2.834645669, { align: 'right' });

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
