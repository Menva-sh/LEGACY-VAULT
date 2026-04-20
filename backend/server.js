const express = require('express');

console.log('🚀 Starting ULTRA-MINIMAL diagnostic server...');

const app = express();

// Log ALL requests
app.use((req, res, next) => {
  console.log(`\n📨 REQUEST: ${req.method} ${req.path}`);
  console.log(`   URL: ${req.url}`);
  console.log(`   Headers:`, {
    origin: req.headers.origin,
    host: req.headers.host,
    'content-type': req.headers['content-type']
  });
  next();
});

// Root route - MUST respond
app.get('/', (req, res) => {
  console.log('✅ Root route handler executed');
  return res.status(200).json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    PORT: process.env.PORT || 3000
  });
});

// Test route
app.get('/test', (req, res) => {
  console.log('✅ Test route handler executed');
  return res.json({ message: 'Test working' });
});

// Catch-all for debugging
app.all('*', (req, res) => {
  console.log(`⚠️  No specific route matched for: ${req.method} ${req.path}`);
  return res.status(404).json({ 
    error: 'Route not found',
    requested: `${req.method} ${req.path}`,
    availableRoutes: ['GET /', 'GET /test']
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ DIAGNOSTIC SERVER RUNNING ON PORT ${PORT}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Ready to accept requests at: http://localhost:${PORT}`);
  console.log(`${'='.repeat(60)}\n`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down...');
  process.exit(0);
});
