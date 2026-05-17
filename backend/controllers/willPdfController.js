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
      email: asset.email || 'N/A',
      description: asset.description || 'Digital asset description',
      action_type: asset.action_type || 'pass',
      last_message: asset.last_message || '',
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
 * Uses PDFKit with professional layout and branding - Exactly 2 pages
 */
async function generatePdfViasPython(userData) {
  const PDFDocument = require('pdfkit');
  
  return new Promise((resolve, reject) => {
    try {
      const pdfBuffer = [];
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0
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

      const pageWidth = 595.27; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);
      const borderColor = '#d4c5c5';
      const bgColor = '#fdf8f5';

      // Draw page background and border
      const drawPageBackground = () => {
        // Background
        doc.rect(0, 0, pageWidth, pageHeight).fill(bgColor);
        
        // Border (1pt frame)
        doc.rect(margin - 5, margin - 5, contentWidth + 10, pageHeight - (margin * 2) + 10).stroke(borderColor);
      };

      // Helper functions
      const drawHeader = (title, subtitle) => {
        // Header background (purple)
        doc.rect(0, 0, pageWidth, 110).fill('#6b2d4e');
        
        // LEGACY VAULT wordmark
        doc.fontSize(8).fillColor('#c4889e').font('Helvetica');
        doc.text('L  E  G  A  C  Y     V  A  U  L  T', margin, 15);
        
        // Main title
        doc.fontSize(24).fillColor('#ffffff').font('Helvetica-Bold');
        doc.text(title, margin, 35, { width: contentWidth });
        
        // Subtitle
        doc.fontSize(11).fillColor('#f4c0d1').font('Helvetica');
        doc.text(subtitle, margin, 70, { width: contentWidth });
        
        // Instrument number (right aligned)
        const today = new Date();
        doc.fontSize(7).fillColor('#c4889e').font('Helvetica');
        doc.text(`INSTRUMENT NO. will_${userData.id}_${today.toISOString().split('T')[0]}`, margin, 20, { align: 'right', width: contentWidth });
        doc.text(`EXECUTED: ${today.toLocaleDateString()} · CONFIDENTIAL`, margin, 30, { align: 'right', width: contentWidth });
        
        return 130; // Return Y position after header
      };

      const drawArticleTitle = (number, title, y) => {
        doc.fontSize(7).fillColor('#6b2d4e').font('Helvetica-Bold');
        doc.text(`ARTICLE  ${number}`, margin, y);
        
        doc.fontSize(12).fillColor('#4a4846').font('Helvetica-Bold');
        doc.text(title, margin + 50, y - 3);
        
        // Horizontal line
        doc.moveTo(margin, y + 15).lineTo(pageWidth - margin, y + 15).stroke('#d4c5c5');
        
        return y + 25;
      };

      const drawBoxedContent = (content, y, height = null) => {
        const boxHeight = height || 60;
        
        // Draw box
        doc.rect(margin, y, contentWidth, boxHeight).stroke('#dedad4');
        
        // Left colored strip
        doc.rect(margin, y, 6, boxHeight).fill('#6b2d4e');
        
        // Content
        doc.fontSize(9).fillColor('#4a4846').font('Helvetica');
        doc.text(content, margin + 15, y + 8, { width: contentWidth - 30, height: boxHeight - 16 });
        
        return y + boxHeight + 10;
      };

      // ═══════════════════════════════════════════════════════════
      // PAGE 1 — MAIN DOCUMENT
      // ═══════════════════════════════════════════════════════════

      drawPageBackground();
      let currentY = drawHeader('LAST WILL AND TESTAMENT', 'OF DIGITAL ASSETS AND ELECTRONIC PROPERTY');

      // Preamble
      const preambleText = `KNOW ALL MEN BY THESE PRESENTS: I, ${userData.full_name}, User Identification Number #${userData.id}, domiciled and registered with Legacy Vault, being of sound and disposing mind and memory, and not acting under duress, menace, fraud, or undue influence of any person, do hereby make, publish, and declare this my Last Will and Testament of Digital Assets, hereby revoking all former digital wills, codicils, and testamentary dispositions of digital property heretofore made by me.`;
      
      currentY = drawBoxedContent(preambleText, currentY, 65);

      // ARTICLE I — IDENTIFICATION
      currentY = drawArticleTitle('I', 'IDENTIFICATION OF THE TESTATOR', currentY);

      // Grantor info in two columns
      doc.fontSize(6.5).fillColor('#999790').font('Helvetica');
      doc.text('FULL LEGAL NAME', margin, currentY);
      doc.text('DATE OF BIRTH / REGISTRATION', pageWidth / 2, currentY);

      doc.fontSize(10).fillColor('#1a0810').font('Helvetica-Bold');
      doc.text(userData.full_name, margin, currentY + 8);
      const dob = userData.date_of_birth || new Date().toISOString().split('T')[0];
      doc.text(dob, pageWidth / 2, currentY + 8);

      currentY += 30;

      doc.fontSize(6.5).fillColor('#999790').font('Helvetica');
      doc.text('EMAIL ADDRESS', margin, currentY);
      doc.text('USER IDENTIFICATION', pageWidth / 2, currentY);

      doc.fontSize(10).fillColor('#1a0810').font('Helvetica-Bold');
      doc.text(userData.email, margin, currentY + 8);
      doc.text(`Legacy Vault ID #${userData.id}`, pageWidth / 2, currentY + 8);

      currentY += 35;

      // ARTICLE II — DIGITAL ASSETS (Compact)
      currentY = drawArticleTitle('II', 'SCHEDULE OF DIGITAL ASSETS', currentY);

      doc.fontSize(8).fillColor('#4a4846').font('Helvetica-Oblique');
      doc.text('Digital assets bequeathed as enumerated:', margin, currentY);
      currentY += 12;

      // Compact asset cards
      const actionLabels = { pass: 'Pass to Executor', delete: 'Delete Account', last_message: 'Final Message' };
      if (userData.assets && userData.assets.length > 0) {
        userData.assets.slice(0, 2).forEach((asset, index) => {
          const romanNums = ['I', 'II'];
          const cardHeight = (asset.action_type === 'last_message' && asset.last_message) ? 52 : 40;
          
          // Box
          doc.rect(margin, currentY, contentWidth, cardHeight).stroke('#dedad4');
          doc.rect(margin, currentY, 6, cardHeight).fill('#6b2d4e');
          
          // Roman numeral
          doc.fontSize(11).fillColor('#ffffff').font('Helvetica-Bold');
          doc.text(romanNums[index], margin + 2, currentY + 2);
          
          // Asset name
          doc.fontSize(10).fillColor('#1a0810').font('Helvetica-Bold');
          doc.text(asset.name, margin + 20, currentY + 5);
          
          // Type + action on one line
          doc.fontSize(8).fillColor('#4a4846').font('Helvetica');
          doc.text(`${asset.type}  •  ${actionLabels[asset.action_type] || 'Pass to Executor'}  •  ${asset.email}`, margin + 20, currentY + 18);
          
          // Farewell message if set
          if (asset.action_type === 'last_message' && asset.last_message) {
            doc.fontSize(7).fillColor('#555').font('Helvetica-Oblique');
            doc.text(`Message: "${asset.last_message.slice(0, 90)}${asset.last_message.length > 90 ? '…' : ''}"`, margin + 20, currentY + 30, { width: contentWidth - 30 });
          }
          
          currentY += cardHeight + 5;
        });
      }

      currentY += 5;

      // ARTICLE III — EXECUTORS (Compact)
      currentY = drawArticleTitle('III', 'APPOINTED EXECUTORS', currentY);

      // Executor cards - compact
      if (userData.executors && userData.executors.length > 0) {
        userData.executors.slice(0, 2).forEach((executor, index) => {
          const romanNums = ['I', 'II'];
          
          // Box
          doc.rect(margin, currentY, contentWidth, 35).stroke('#dedad4');
          doc.rect(margin, currentY, 6, 35).fill('#c08fa8');
          
          // Roman numeral
          doc.fontSize(11).fillColor('#ffffff').font('Helvetica-Bold');
          doc.text(romanNums[index], margin + 2, currentY + 2);
          
          // Executor name and email
          doc.fontSize(10).fillColor('#1a0810').font('Helvetica-Bold');
          doc.text(executor.name.toUpperCase(), margin + 20, currentY + 3);
          
          doc.fontSize(8).fillColor('#4a4846').font('Helvetica');
          doc.text(executor.email, margin + 20, currentY + 16);
          
          // Status labels (right side)
          doc.fontSize(6.5).fillColor('#999790').font('Helvetica');
          doc.text(`${executor.permission} • ${executor.status}`, pageWidth - margin - 150, currentY + 8);
          
          currentY += 40;
        });
      }

      // ═══════════════════════════════════════════════════════════
      // PAGE 2 — SIGNATURE AND EXECUTION PAGE
      // ═══════════════════════════════════════════════════════════

      doc.addPage();
      drawPageBackground();
      currentY = drawHeader('SIGNATURE AND EXECUTION PAGE', `Last Will and Testament of ${userData.full_name}`);

      // IN WITNESS WHEREOF section
      const witnessText = `IN WITNESS WHEREOF, I, ${userData.full_name}, the Testator named in this Last Will and Testament of Digital Assets, have hereunto set my hand and seal to this, my Last Will and Testament, on this 9th day of May, in the year Two Thousand and Twenty-Six, declaring and publishing this as my Last Will and Testament of Digital Assets, in the presence of the witnesses whose signatures appear below, each of whom signed in my presence and in the presence of each other.`;

      doc.fontSize(8.5).fillColor('#4a4846').font('Helvetica');
      doc.text(witnessText, margin, currentY, { width: contentWidth });
      currentY += 65;

      // TESTATOR section
      doc.fontSize(10).fillColor('#6b2d4e').font('Helvetica-Bold');
      doc.text('TESTATOR', margin, currentY);
      currentY += 10;

      doc.fontSize(8).fillColor('#4a4846').font('Helvetica');
      const testatorDeclaration = `I, ${userData.full_name}, sign my name to this instrument 9th day of May, 2026, and being first duly sworn, declare to the undersigned authority that I sign and execute this instrument as my Last Will and that I sign it willingly.`;
      doc.text(testatorDeclaration, margin, currentY, { width: contentWidth });
      currentY += 45;

      // Signature line
      doc.moveTo(margin, currentY).lineTo(margin + 150, currentY).stroke('#999790');
      doc.fontSize(6.5).fillColor('#999790').font('Helvetica');
      doc.text('SIGNATURE OF TESTATOR', margin, currentY + 3);

      doc.moveTo(pageWidth / 2 + 10, currentY).lineTo(pageWidth / 2 + 150, currentY).stroke('#999790');
      doc.text('DATE', pageWidth / 2 + 10, currentY + 3);

      currentY += 30;

      // ATTESTATION OF WITNESSES section
      doc.fontSize(10).fillColor('#6b2d4e').font('Helvetica-Bold');
      doc.text('ATTESTATION OF WITNESSES', margin, currentY);
      currentY += 10;

      doc.fontSize(8).fillColor('#4a4846').font('Helvetica');
      const attestationText = 'We, the undersigned witnesses, declare that the Testator signed and executed this instrument as the Last Will and Testament of Digital Assets in our presence, both present at the same time; and that in the Testator\'s presence, at their request, and in the presence of each other, we have subscribed our names hereto as witnesses hereof; and that to the best of our knowledge the Testator was at the time of signing of sound and disposing mind.';
      doc.text(attestationText, margin, currentY, { width: contentWidth });
      currentY += 50;

      // Witness signature lines - 2 columns, more compact
      doc.fontSize(6.5).fillColor('#999790').font('Helvetica-Bold');
      doc.text('WITNESS NO. 1 — SIGNATURE', margin, currentY);
      doc.moveTo(margin, currentY + 12).lineTo(margin + 120, currentY + 12).stroke('#999790');

      doc.text('WITNESS NO. 1 — PRINT NAME', pageWidth / 2 + 10, currentY);
      doc.moveTo(pageWidth / 2 + 10, currentY + 12).lineTo(pageWidth / 2 + 150, currentY + 12).stroke('#999790');

      currentY += 25;

      // Witness 2
      doc.text('WITNESS NO. 2 — SIGNATURE', margin, currentY);
      doc.moveTo(margin, currentY + 12).lineTo(margin + 120, currentY + 12).stroke('#999790');

      doc.text('WITNESS NO. 2 — PRINT NAME', pageWidth / 2 + 10, currentY);
      doc.moveTo(pageWidth / 2 + 10, currentY + 12).lineTo(pageWidth / 2 + 150, currentY + 12).stroke('#999790');

      currentY += 35;

      // NOTARIAL ACKNOWLEDGEMENT section
      doc.fontSize(10).fillColor('#6b2d4e').font('Helvetica-Bold');
      doc.text('NOTARIAL ACKNOWLEDGEMENT / OFFICIAL SEAL', margin, currentY);
      currentY += 10;

      doc.fontSize(8).fillColor('#4a4846').font('Helvetica');
      doc.text('State / Jurisdiction of _________________ County / District of _________________', margin, currentY);
      currentY += 13;

      const notaryText = `Subscribed, sworn to and acknowledged before me by ${userData.full_name}, the Testator, and subscribed and sworn to before me by ___________________, ___________________ and __________________ witnesses, this _______ day of __________________, 20_______.`;
      doc.text(notaryText, margin, currentY, { width: pageWidth - margin - 120 });

      // Notary seal placeholder circle - properly centered
      const sealX = pageWidth - margin - 45;
      const sealY = currentY + 20;
      doc.circle(sealX, sealY, 30);
      doc.stroke('#f4c0d1');
      doc.fontSize(6).fillColor('#f4c0d1').font('Helvetica-Bold');
      doc.text('OFFICIAL\nNOTARY\nSEAL', sealX - 20, sealY - 12, { align: 'center', width: 40 });

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
