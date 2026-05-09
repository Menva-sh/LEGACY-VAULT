const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Generate a secure setup token for executors
 * Token valid for 7 days
 */
function generateSetupToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return { token, expiresAt };
}

/**
 * Verify setup token is not expired
 */
function isTokenExpired(expiresAt) {
  return new Date() > new Date(expiresAt);
}

/**
 * Generate JWT for executor authentication
 */
function generateExecutorToken(executorId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }
  
  const token = jwt.sign(
    { executorId, type: 'executor' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return token;
}

/**
 * Verify executor JWT token
 */
function verifyExecutorToken(token) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'executor') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (err) {
    throw new Error(`Invalid or expired token: ${err.message}`);
  }
}

module.exports = {
  generateSetupToken,
  isTokenExpired,
  generateExecutorToken,
  verifyExecutorToken
};
