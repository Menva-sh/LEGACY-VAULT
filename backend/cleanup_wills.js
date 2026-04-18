const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'legacy_vault'
});

async function cleanupWills() {
  try {
    console.log('Deleting only drafted wills...');
    const result = await pool.query('DELETE FROM digital_wills WHERE status = $1', ['drafted']);
    console.log(`Deleted ${result.rowCount} wills`);
    
    // Only delete PDFs, never touch users, assets, or executors
    console.log('Cleaning up generated PDF files...');
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, 'generated_wills');
    
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach(file => {
        fs.unlinkSync(path.join(dir, file));
        console.log(`Deleted: ${file}`);
      });
    }
    
    console.log('Cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupWills();
