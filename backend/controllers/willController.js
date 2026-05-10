const { createWill, getWillsByUserId, getWillById, updateWill, publishWill, deleteWill, getPublishedWillsByExecutor, assignWillToExecutors, removeExecutorFromWill } = require('../models/willModel');

// Create new will
const createNewWill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, content } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Will title is required' });
    }

    const will = await createWill(userId, title, description || '', content || '');

    res.status(201).json({
      message: 'Digital will created successfully',
      will
    });
  } catch (err) {
    console.error('Create will error:', err);
    res.status(500).json({ error: 'Failed to create will' });
  }
};

// Get all wills
const getAllWills = async (req, res) => {
  try {
    const userId = req.user.id;

    const wills = await getWillsByUserId(userId);

    res.json({
      message: 'Wills retrieved successfully',
      count: wills.length,
      wills
    });
  } catch (err) {
    console.error('Get wills error:', err);
    res.status(500).json({ error: 'Failed to retrieve wills' });
  }
};

// Get single will
const getWill = async (req, res) => {
  try {
    const { willId } = req.params;
    const userId = req.user.id;

    const will = await getWillById(willId, userId);

    if (!will) {
      return res.status(404).json({ error: 'Will not found' });
    }

    res.json({
      message: 'Will retrieved successfully',
      will
    });
  } catch (err) {
    console.error('Get will error:', err);
    res.status(500).json({ error: 'Failed to retrieve will' });
  }
};

// Update will (only draft wills can be updated)
const updateWillContent = async (req, res) => {
  try {
    const { willId } = req.params;
    const userId = req.user.id;
    const { title, description, content } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Will title is required' });
    }

    const will = await updateWill(willId, userId, title, description || '', content || '');

    if (!will) {
      return res.status(404).json({ error: 'Will not found' });
    }

    res.json({
      message: 'Will updated successfully',
      will
    });
  } catch (err) {
    console.error('Update will error:', err);
    res.status(500).json({ error: 'Failed to update will' });
  }
};

// Publish/Finalize will
const publishTheWill = async (req, res) => {
  try {
    const { willId } = req.params;
    const userId = req.user.id;
    const { effectiveDate } = req.body;

    const will = await publishWill(willId, userId, effectiveDate || null);

    if (!will) {
      return res.status(404).json({ error: 'Will not found or already published' });
    }

    res.json({
      message: 'Will published successfully',
      will
    });
  } catch (err) {
    console.error('Publish will error:', err);
    res.status(500).json({ error: 'Failed to publish will' });
  }
};

// Delete will
const removeWill = async (req, res) => {
  try {
    const { willId } = req.params;
    const userId = req.user.id;

    const will = await deleteWill(willId, userId);

    if (!will) {
      return res.status(404).json({ error: 'Will not found' });
    }

    res.json({
      message: 'Will deleted successfully',
      willId: will.id
    });
  } catch (err) {
    console.error('Delete will error:', err);
    res.status(500).json({ error: 'Failed to delete will' });
  }
};

// Assign will to multiple executors
const assignToExecutors = async (req, res) => {
  try {
    const { willId } = req.params;
    const userId = req.user.id;
    const { executorIds } = req.body;

    if (!Array.isArray(executorIds) || executorIds.length === 0) {
      return res.status(400).json({ error: 'At least one executor ID is required' });
    }

    const result = await assignWillToExecutors(willId, userId, executorIds);

    res.json({
      message: 'Will assigned to executors successfully',
      result
    });
  } catch (err) {
    console.error('Assign to executors error:', err);
    res.status(500).json({ error: 'Failed to assign will to executors', details: err.message });
  }
};

// Remove executor from will
const removeFromExecutor = async (req, res) => {
  try {
    const { willId, executorId } = req.params;
    const userId = req.user.id;

    const result = await removeExecutorFromWill(willId, userId, parseInt(executorId));

    if (!result) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({
      message: 'Executor removed from will successfully',
      result
    });
  } catch (err) {
    console.error('Remove from executor error:', err);
    res.status(500).json({ error: 'Failed to remove executor from will', details: err.message });
  }
};

module.exports = {
  createNewWill,
  getAllWills,
  getWill,
  updateWillContent,
  publishTheWill,
  removeWill,
  assignToExecutors,
  removeFromExecutor
};
