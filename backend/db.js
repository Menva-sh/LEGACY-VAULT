const { Pool } = require('pg');
require('dotenv').config();

// Save the original pool query method before we create any instance
const OriginalPool = Pool;
const originalQueryFn = OriginalPool.prototype.query;

// Neon-specific connection configuration
// Using pgbouncer-compatible pooler endpoint
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  },
  // ===== Neon Pooler Optimizations =====
  // Neon's pooler endpoint handles concurrent connection management
  // These settings minimize connection churn and maximize stability
  
  max: 5,                     // Very conservative - Neon limits concurrent connections
  min: 0,                     // Start with 0, grow only when needed
  idleTimeoutMillis: 300000,  // 5 minutes - allow long idle periods
  connectionTimeoutMillis: 10000,
  statement_timeout: 30000,   // 30 second query timeout
  query_timeout: 30000,
  
  application_name: 'legacy_vault_app'
});

// ===== Connection Pool Event Handlers =====

// Log successful connections
pool.on('connect', (client) => {
  console.log('✅ New connection established (pool size:', pool.totalCount, ')');
});

// Handle pool errors gracefully
pool.on('error', (err) => {
  console.error('⚠️ Unexpected error in connection pool:', err.message);
  // Pool will attempt to recover automatically
});

pool.on('remove', () => {
  console.log(`ℹ️  Client removed from pool (now ${pool.totalCount} connections)`);
});

// ===== Initial Connection Test =====
pool.connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL (Neon Pooler)");
    client.release();
  })
  .catch(err => {
    console.error('❌ Initial connection failed:', err.message);
    console.error('   App will retry connections on first query');
  });

// ===== Query Wrapper with Retry Logic =====
// Override the query method to add automatic retries for connection errors
pool.query = async function(text, values, callback) {
  const maxRetries = 2;
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Call the original pool query method using the context (this)
      const result = await originalQueryFn.call(this, text, values);
      return result;
    } catch (err) {
      lastError = err;
      
      // Only retry on connection-related errors
      const isConnectionError = 
        err.message.includes('connection') ||
        err.message.includes('terminated') ||
        err.message.includes('ECONNREFUSED') ||
        err.code === 'ECONNREFUSED';
      
      if (attempt < maxRetries && isConnectionError) {
        const delay = Math.pow(2, attempt) * 100; // Exponential backoff: 100ms, 200ms
        console.log(`⚠️ Query retry (attempt ${attempt + 1}/${maxRetries + 1}) after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Non-connection error or exhausted retries
        break;
      }
    }
  }
  
  // Throw the last error encountered
  throw lastError;
};

module.exports = pool;