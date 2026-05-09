const sgMail = require('@sendgrid/mail');

console.log('🔑 SendGrid API Key:', process.env.SENDGRID_API_KEY ? '✅ Present' : '❌ Missing');

if (!process.env.SENDGRID_API_KEY) {
  console.error('⚠️  WARNING: SENDGRID_API_KEY is not set in .env!');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendExecutorNotification(executorEmail, executorName, userName, setupToken = null) {
  try {
    console.log(`📧 Preparing email for: ${executorEmail}`);
    
    // Build setup link if token provided
    const setupLink = setupToken 
      ? `https://legacy-vault-nine.vercel.app/executor-portal.html?token=${setupToken}`
      : null;
    
    const setupButtonHtml = setupLink ? `
      <div style="margin: 24px 0; text-align: center;">
        <a href="${setupLink}" style="
          display: inline-block;
          padding: 12px 32px;
          background: #6b2d4e;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        ">
          Set Up Your Executor Account
        </a>
      </div>
      <p style="font-size: 12px; color: #888780; text-align: center;">
        Link expires in 7 days
      </p>
    ` : '';
    
    const msg = {
      to: executorEmail,
      from: process.env.SENDER_EMAIL || 'noreply@legacyvault.com',
      subject: setupLink ? 'Set Up Your Executor Account' : 'You Have Been Designated as an Executor',
      html: `
        <html>
          <body style="font-family: system-ui, -apple-system, sans-serif; color: #2c2c2a; line-height: 1.6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #6b2d4e; margin-bottom: 16px;">Executor Designation Notice</h2>
              
              <p>Hello <strong>${executorName}</strong>,</p>
              
              <p>You have been designated as an executor for the Legacy Vault account of <strong>${userName}</strong>.</p>
              
              ${setupButtonHtml}
              
              <p>As an executor, you will have access to:</p>
              <ul style="color: #666;">
                <li>Digital assets and important documents</li>
                <li>Digital wills and instructions</li>
                <li>Contact information for other executors</li>
                <li>Account management and access permissions</li>
              </ul>
              
              <p>The account holder has set this up to ensure their important information is properly managed. You may be contacted if access is needed.</p>
              
              ${setupLink ? `
                <p style="background: #f7f4f0; padding: 16px; border-radius: 6px; border-left: 3px solid #6b2d4e;">
                  <strong>Next Steps:</strong><br>
                  Click the button above to set up your password and access your executor account. Your setup link is valid for 7 days.
                </p>
              ` : `
                <p style="background: #f7f4f0; padding: 16px; border-radius: 6px; border-left: 3px solid #6b2d4e;">
                  <strong>Next Steps:</strong><br>
                  If you have any questions or need more information about your role as an executor, please contact the account holder directly.
                </p>
              `}
              
              <p style="margin-top: 24px; color: #888780; font-size: 12px;">
                <em>This is an automated notification from Legacy Vault. Please do not reply to this email.</em>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e0ddd6; margin: 24px 0;">
              
              <p style="color: #888780; font-size: 12px;">
                Legacy Vault - Digital Estate Planning<br>
                © 2026 All rights reserved
              </p>
            </div>
          </body>
        </html>
      `
    };

    console.log(`📤 Sending email from: ${msg.from}`);
    const response = await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${executorEmail}`);
    console.log(`📊 SendGrid Response ID:`, response[0]?.headers?.['x-message-id']);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error(`❌ Email send failed for ${executorEmail}:`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Body:`, error.response.body);
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

module.exports = { sendExecutorNotification };
