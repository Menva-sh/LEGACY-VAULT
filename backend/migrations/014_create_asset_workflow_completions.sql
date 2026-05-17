-- Create asset_workflow_completions table to track completed workflows

CREATE TABLE IF NOT EXISTS asset_workflow_completions (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES digital_assets(id) ON DELETE CASCADE,
  executor_id INTEGER NOT NULL REFERENCES executors(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- delete, pass, last_message, handoff
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient lookups
CREATE INDEX idx_asset_workflow_asset_id ON asset_workflow_completions(asset_id);
CREATE INDEX idx_asset_workflow_executor_id ON asset_workflow_completions(executor_id);
CREATE INDEX idx_asset_workflow_completed_at ON asset_workflow_completions(completed_at);
