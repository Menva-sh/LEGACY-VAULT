const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pooling optimizations for Neon
  max: 10,                    // Reduced from 20 - Neon has limits
  min: 1,                     // Reduced min connections
  idleTimeoutMillis: 60000,   // Increased from 30s to 60s to avoid aggressive closing
  connectionTimeoutMillis: 10000, // Timeout for new connections
  statement_timeout: 60000,   // Query statement timeout (60 seconds)
  query_timeout: 60000,       // Query timeout
  application_name: 'legacy_vault_app'
});

// Handle pool errors gracefully without crashing
pool.on('error', (err) => {
  console.error('⚠️ Connection pool error:', err.message);
  // Don't crash the app - the pool will handle reconnection automatically
});

// Handle individual client errors
pool.on('connect', (client) => {
  client.on('error', (err) => {
    console.error('⚠️ Client connection error:', err.message);
  });
});

pool.on('remove', () => {
  console.log('⚠️ Client removed from pool (idle timeout or error)');
});

pool.connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL (Neon)");
    client.release();
  })
  .catch(err => console.error('❌ Connection failed:', err));

module.exports = pool;