const express = require('express');
const { register, login } = require('../backend/controllers/authController');

const router = express.Router();

// POST /auth/register - Register a new user
router.post('/register', register);

// POST /auth/login - Login user
router.post('/login', login);

module.exports = router;
