const express = require('express');
const router = express.Router();
const { 
  setupExecutorPassword, 
  executorLogin, 
  verifyExecutorToken 
} = require('../controllers/executorAuthController');

/**
 * POST /executor-auth/setup
 * Setup executor password with setup token
 * Public route (no auth needed)
 */
router.post('/setup', setupExecutorPassword);

/**
 * POST /executor-auth/login
 * Login executor with email and password
 * Public route (no auth needed)
 */
router.post('/login', executorLogin);

/**
 * GET /executor-auth/verify
 * Verify executor token (protected)
 * Returns executor info if valid
 */
router.get('/verify', verifyExecutorToken, (req, res) => {
  res.status(200).json({
    message: 'Token valid',
    executorId: req.executorId
  });
});

module.exports = router;
