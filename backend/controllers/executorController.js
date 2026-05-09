const { addExecutor, getExecutorsByUserId, getExecutorById, updateExecutor, updateExecutorStatus, removeExecutor, executorExists } = require('../models/executorModel');
const { sendExecutorNotification } = require('../services/emailService');
const { getUser } = require('../models/userModel');

// Add new executor
const addNewExecutor = async (req, res) => {
  try {
    const userId = req.user.id;
    const { executorEmail, executorName, permissions } = req.body;

    // Validation
    if (!executorEmail) {
      return res.status(400).json({ error: 'Executor email is required' });
    }

    // Check if executor already exists
    const exists = await executorExists(userId, executorEmail);
    if (exists) {
      return res.status(409).json({ error: 'Executor already designated' });
    }

    const executor = await addExecutor(userId, executorEmail, executorName || '', permissions || 'view');

    // Get current user info for email
    const user = await getUser(userId);
    const senderName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;

    // Send email notification (fire-and-forget - no await to avoid timeout)
    sendExecutorNotification(executorEmail, executorName || 'Executor', senderName)
      .catch(err => {
        console.error('✗ Failed to send executor notification email:', err.message);
        // Don't fail the API request if email fails
      });

    res.status(201).json({
      message: 'Executor designated successfully. Notification email sent.',
      executor
    });
  } catch (err) {
    console.error('Add executor error:', err);
    res.status(500).json({ error: 'Failed to add executor' });
  }
};

// Get all executors
const getAllExecutors = async (req, res) => {
  try {
    const userId = req.user.id;

    const executors = await getExecutorsByUserId(userId);

    res.json({
      message: 'Executors retrieved successfully',
      count: executors.length,
      executors
    });
  } catch (err) {
    console.error('Get executors error:', err);
    res.status(500).json({ error: 'Failed to retrieve executors' });
  }
};

// Get single executor
const getExecutor = async (req, res) => {
  try {
    const { executorId } = req.params;
    const userId = req.user.id;

    const executor = await getExecutorById(executorId, userId);

    if (!executor) {
      return res.status(404).json({ error: 'Executor not found' });
    }

    res.json({
      message: 'Executor retrieved successfully',
      executor
    });
  } catch (err) {
    console.error('Get executor error:', err);
    res.status(500).json({ error: 'Failed to retrieve executor' });
  }
};

// Update executor details
const updateExecutorInfo = async (req, res) => {
  try {
    const { executorId } = req.params;
    const userId = req.user.id;
    const { executorName, permissions, isActive } = req.body;

    const executor = await updateExecutor(executorId, userId, executorName || '', permissions || 'view', isActive !== undefined ? isActive : true);

    if (!executor) {
      return res.status(404).json({ error: 'Executor not found' });
    }

    res.json({
      message: 'Executor updated successfully',
      executor
    });
  } catch (err) {
    console.error('Update executor error:', err);
    res.status(500).json({ error: 'Failed to update executor' });
  }
};

// Approve/Deny/Deactivate executor
const setExecutorStatus = async (req, res) => {
  try {
    const { executorId } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    if (!['approved', 'denied', 'deactivated'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved, denied, or deactivated' });
    }

    const executor = await updateExecutorStatus(executorId, userId, status);

    if (!executor) {
      return res.status(404).json({ error: 'Executor not found' });
    }

    res.json({
      message: `Executor ${status} successfully`,
      executor
    });
  } catch (err) {
    console.error('Update executor status error:', err);
    res.status(500).json({ error: 'Failed to update executor status' });
  }
};

// Remove executor
const removeExecutorFromVault = async (req, res) => {
  try {
    const { executorId } = req.params;
    const userId = req.user.id;

    const executor = await removeExecutor(executorId, userId);

    if (!executor) {
      return res.status(404).json({ error: 'Executor not found' });
    }

    res.json({
      message: 'Executor removed successfully',
      executorId: executor.id
    });
  } catch (err) {
    console.error('Remove executor error:', err);
    res.status(500).json({ error: 'Failed to remove executor' });
  }
};

module.exports = {
  addNewExecutor,
  getAllExecutors,
  getExecutor,
  updateExecutorInfo,
  setExecutorStatus,
  removeExecutorFromVault
};
