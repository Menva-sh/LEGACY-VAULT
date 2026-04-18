const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// ============================================
// MIDDLEWARE
// ============================================

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Serve static assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, '.'), {
  index: false,  // Don't auto-serve index.html for directories
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

// ============================================
// ROUTES
// ============================================

// Root route
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err.message);
      res.status(500).send('Cannot load index.html');
    }
  });
});

// Pages route: /pages/dashboard -> pages/dashboard.html
app.get('/pages/:page', (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, 'pages', `${page}.html`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.warn(`Page not found: ${filePath}`);
    return res.status(404).sendFile(path.join(__dirname, 'index.html'));
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`Error sending ${page}.html:`, err.message);
      res.status(500).send('Cannot load page');
    }
  });
});

// CSS route (explicit)
app.get('/css/:file', (req, res) => {
  const filePath = path.join(__dirname, 'css', req.params.file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('CSS file not found');
  }
  res.sendFile(filePath);
});

// JS route (explicit)
app.get('/js/:file', (req, res) => {
  const filePath = path.join(__dirname, 'js', req.params.file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('JS file not found');
  }
  res.sendFile(filePath);
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler - anything else gets index.html (for SPA navigation)
app.use((req, res) => {
  console.log(`[404 fallback] Serving index.html for: ${req.path}`);
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal server error');
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   LEGACY VAULT Frontend Server        ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║   🌐 Frontend: http://localhost:${PORT}       ║`);
  console.log(`║   🔌 Backend:  http://localhost:3000   ║`);
  console.log(`║   📁 Root:     ${__dirname.substring(0, 30)}... ║`);
  console.log('╚════════════════════════════════════════╝\n');
});
