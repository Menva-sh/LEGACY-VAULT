const express = require('express');
const cors = require('cors');
const initializeDatabase = require('./initDb');
const { verifyToken } = require('./middleware/authMiddleware');
const { generateDigitalWill } = require('./controllers/willGeneratorController');
const deadManswitchScheduler = require('./services/deadManswitchScheduler');

// Import routes with error handling
let authRoutes, assetRoutes, executorRoutes, willRoutes, switchRoutes, executorPortalRoutes;

try {
  console.log('Importing auth routes from ./routes/authRoutes...');
  authRoutes = require('./routes/authRoutes');
  console.log('✅ Auth routes imported');
} catch (err) {
  console.error('❌ Failed to import auth routes:', err.message);
  process.exit(1);
}

try {
  console.log('Importing asset routes...');
  assetRoutes = require('./routes/assetRoutes');
  console.log('✅ Asset routes imported');
} catch (err) {
  console.error('❌ Failed to import asset routes:', err.message);
}

try {
  console.log('Importing executor routes...');
  executorRoutes = require('./routes/executorRoutes');
  console.log('✅ Executor routes imported');
} catch (err) {
  console.error('❌ Failed to import executor routes:', err.message);
}

try {
  console.log('Importing will routes...');
  willRoutes = require('./routes/willRoutes');
  console.log('✅ Will routes imported');
} catch (err) {
  console.error('❌ Failed to import will routes:', err.message);
}

try {
  console.log('Importing switch routes...');
  switchRoutes = require('./routes/switchRoutes');
  console.log('✅ Switch routes imported');
} catch (err) {
  console.error('❌ Failed to import switch routes:', err.message);
}

try {
  console.log('Importing portal routes...');
  executorPortalRoutes = require('./routes/executorPortalRoutes');
  console.log('✅ Portal routes imported');
} catch (err) {
  console.error('❌ Failed to import portal routes:', err.message);
}

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:8080', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve generated PDFs as static files
app.use('/generated_wills', express.static('generated_wills'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize database tables
initializeDatabase();

// Routes
console.log('Setting up root route...');
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running', timestamp: new Date() });
});

// GET /generate-will - Generate digital will PDF
console.log('Setting up digital will generator...');
app.get('/generate-will', verifyToken, generateDigitalWill);

console.log('Loading auth routes...');
app.use('/auth', authRoutes);
console.log('Loading asset routes...');
app.use('/assets', assetRoutes);
console.log('Loading executor routes...');
app.use('/executors', executorRoutes);
console.log('Loading will routes...');
app.use('/wills', willRoutes);
console.log('Loading switch routes...');
app.use('/switches', switchRoutes);
console.log('Loading portal routes...');
app.use('/portal', executorPortalRoutes);
console.log('All routes loaded successfully');

app.get('/test', (req, res) => {
  res.json({ message: 'Test route working', routes: Object.keys(app._router.stack).filter(i => i !== 'query' && i !== 'expressInit' && i !== 'cors' && i !== 'json' && i !== 'json') });
});

// Protected dashboard route for testing
app.get('/dashboard-test', require('./middleware/authMiddleware').verifyToken, (req, res) => {
  res.json({
    message: 'Welcome to protected dashboard',
    user: req.user,
    timestamp: new Date()
  });
});

// Manual trigger for Dead Man's Switch check (for testing)
app.post('/test/dead-mans-switch-check', async (req, res) => {
  try {
    console.log('[Manual Test] Triggering Dead Man\'s Switch check...');
    await deadManswitchScheduler.runManually();
    res.json({ message: 'Dead Man\'s Switch check completed', timestamp: new Date() });
  } catch (error) {
    console.error('[Manual Test] Error:', error);
    res.status(500).json({ error: 'Check failed', details: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  console.log(`[404] No route found for: ${req.method} ${req.path}`);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Start Dead Man's Switch scheduler
console.log('\n=== INITIALIZING SCHEDULED JOBS ===');
deadManswitchScheduler.start();
console.log('=== SCHEDULED JOBS INITIALIZED ===\n');

app.listen(3000, () => {
  console.log('Server running on port 3000');
});