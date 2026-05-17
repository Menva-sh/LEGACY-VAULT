const express = require('express');
const pool = require('../db');
const { verifyExecutorToken } = require('../controllers/executorAuthController');

const router = express.Router();

router.get('/executor/verify', verifyExecutorToken, (req, res) => {
  res.json({ verified: true, executorId: req.executorId });
});

router.post('/assets/:assetId/workflow-complete', verifyExecutorToken, async (req, res) => {
  try {
    const { assetId } = req.params;
    const { action, executorId, completedAt } = req.body;
    const verifiedExecutorId = req.executorId;

    if (Number(executorId) !== Number(verifiedExecutorId)) {
      return res.status(403).json({ error: 'Executor session mismatch' });
    }

    if (!action || !completedAt) {
      return res.status(400).json({ error: 'Action and completedAt are required' });
    }

    const accessCheck = await pool.query(
      `SELECT a.id
       FROM digital_assets a
       INNER JOIN executors e ON a.user_id = e.user_id
       WHERE a.id = $1 AND e.id = $2`,
      [assetId, verifiedExecutorId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found or not assigned to you' });
    }

    await pool.query(
      `INSERT INTO asset_workflow_completions (asset_id, executor_id, action, completed_at)
       VALUES ($1, $2, $3, $4)`,
      [assetId, verifiedExecutorId, action, new Date(completedAt)]
    );

    res.status(201).json({ success: true, message: 'Completion recorded' });
  } catch (err) {
    console.error('Workflow completion error:', err.message);
    res.status(500).json({ error: 'Failed to record workflow completion' });
  }
});

router.post('/assets/:assetId/step-view', verifyExecutorToken, async (req, res) => {
  const { assetId } = req.params;
  const { platform, action, stepNumber, viewedAt } = req.body;

  console.log('Workflow step viewed:', {
    assetId,
    executorId: req.executorId,
    platform,
    action,
    stepNumber,
    viewedAt
  });

  res.json({ success: true, message: 'Step view recorded' });
});

module.exports = router;
