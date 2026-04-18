-- Create digital_assets table
CREATE TABLE IF NOT EXISTS digital_assets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  description TEXT,
  file_path VARCHAR(500),
  file_size INTEGER,
  is_encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_digital_assets_user_id ON digital_assets(user_id);
