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
  max: 20,                    // Maximum pool size
  min: 2,                     // Minimum pool size
  idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Timeout for new connections
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

pool.connect()
  .then((client) => {
    console.log("Connected to PostgreSQL (Neon)");
    client.release();
  })
  .catch(err => console.error('Connection failed:', err));

module.exports = pool;