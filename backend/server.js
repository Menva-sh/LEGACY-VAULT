const express = require('express');
const cors = require('cors');

const app = express();

// Test CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Simple root route
app.get('/', (req, res) => {
  console.log('[GET /] - Root route hit');
  res.json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      PORT: process.env.PORT || 3000
    }
  });
});

// Simple test route
app.get('/test', (req, res) => {
  console.log('[GET /test] - Test route hit');
  res.json({ message: 'Test route working' });
});

// Simple login test
app.post('/auth/login', (req, res) => {
  console.log('[POST /auth/login] - Login route hit');
  res.json({ message: 'Login endpoint working' });
});

// 404 handler
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.path} - No route found`);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ TEST SERVER running on port ${PORT}`);
  console.log(`✅ Try: curl http://localhost:${PORT}/`);
  console.log(`✅ Try: curl -X POST http://localhost:${PORT}/auth/login`);
  console.log('Ready to accept requests\n');
});
