const bcrypt = require('bcryptjs');
const { generateSetupToken, isTokenExpired, generateExecutorToken } = require('../utils/tokenUtils');
const { 
  setSetupToken, 
  getExecutorBySetupToken, 
  setExecutorPassword, 
  getExecutorByEmail,
  updateLastLogin
} = require('../models/executorModel');

/**
 * Generate setup token and save to executor
 * Called by admin when creating executor
 */
const generateAndSetupToken = async (executorId) => {
  try {
    const { token, expiresAt } = generateSetupToken();
    
    console.log(`🔐 Generating setup token for executor ${executorId}`);
    await setSetupToken(executorId, token, expiresAt);
    
    console.log(`✅ Setup token created, expires: ${expiresAt}`);
    return token;
  } catch (err) {
    console.error('❌ Error generating setup token:', err.message);
    throw err;
  }
};

/**
 * Validate setup token and check expiry
 */
const validateSetupToken = async (setupToken) => {
  try {
    console.log(`🔍 Validating setup token: ${setupToken.substring(0, 10)}...`);
    
    const executor = await getExecutorBySetupToken(setupToken);
    if (!executor) {
      throw new Error('Token not found or already used');
    }
    
    if (isTokenExpired(executor.token_expires_at)) {
      throw new Error('Setup token has expired');
    }
    
    console.log(`✅ Token valid for executor: ${executor.executor_email}`);
    return executor;
  } catch (err) {
    console.error('❌ Token validation failed:', err.message);
    throw err;
  }
};

/**
 * Set executor password (when they first access portal)
 */
const setupExecutorPassword = async (req, res) => {
  try {
    const { setupToken, password, confirmPassword } = req.body;
    
    if (!setupToken || !password) {
      return res.status(400).json({ error: 'Setup token and password required' });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    console.log(`🔐 Setting password for token: ${setupToken.substring(0, 10)}...`);
    
    // Validate token
    const executor = await validateSetupToken(setupToken);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update executor with password and mark as active
    const updatedExecutor = await setExecutorPassword(executor.id, hashedPassword);
    
    console.log(`✅ Password set for executor: ${executor.executor_email}`);
    
    return res.status(200).json({
      message: 'Password set successfully',
      executor: {
        id: updatedExecutor.id,
        email: updatedExecutor.executor_email,
        name: updatedExecutor.executor_name
      }
    });
  } catch (err) {
    console.error('❌ Error setting password:', err.message);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Executor login with email and password
 */
const executorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    console.log(`🔓 Login attempt for executor: ${email}`);
    
    // Get executor
    const executor = await getExecutorByEmail(email);
    if (!executor) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, executor.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Update last login
    await updateLastLogin(executor.id);
    
    // Generate JWT token
    const token = generateExecutorToken(executor.id);
    
    console.log(`✅ Executor logged in: ${email}`);
    
    return res.status(200).json({
      message: 'Login successful',
      token,
      executor: {
        id: executor.id,
        email: executor.executor_email,
        name: executor.executor_name,
        userId: executor.user_id
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Verify executor token (for protected routes)
 */
const verifyExecutorToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    
    const token = authHeader.substring(7);
    const { verifyExecutorToken: verify } = require('../utils/tokenUtils');
    const decoded = verify(token);
    
    console.log(`✅ Token verified for executor: ${decoded.executorId}`);
    req.executorId = decoded.executorId;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  generateAndSetupToken,
  validateSetupToken,
  setupExecutorPassword,
  executorLogin,
  verifyExecutorToken
};
