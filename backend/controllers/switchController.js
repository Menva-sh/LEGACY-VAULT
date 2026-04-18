const { createSwitch, getSwitchesByUserId, getSwitchById, updateSwitch, triggerSwitch, pingSwitch, toggleSwitchStatus, deleteSwitch } = require('../models/switchModel');

// Create new switch
const createNewSwitch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { triggerType, triggerValue, actionType, description } = req.body;

    if (!triggerType || !triggerValue || !actionType) {
      return res.status(400).json({ error: 'triggerType, triggerValue, and actionType are required' });
    }

    const switchRecord = await createSwitch(userId, triggerType, triggerValue, actionType, description || '');

    res.status(201).json({
      message: 'Dead man\'s switch created successfully',
      switch: switchRecord
    });
  } catch (err) {
    console.error('Create switch error:', err);
    res.status(500).json({ error: 'Failed to create switch' });
  }
};

// Get all switches
const getAllSwitches = async (req, res) => {
  try {
    const userId = req.user.id;

    const switches = await getSwitchesByUserId(userId);

    res.json({
      message: 'Switches retrieved successfully',
      count: switches.length,
      switches
    });
  } catch (err) {
    console.error('Get switches error:', err);
    res.status(500).json({ error: 'Failed to retrieve switches' });
  }
};

// Get single switch
const getSwitch = async (req, res) => {
  try {
    const { switchId } = req.params;
    const userId = req.user.id;

    const switchRecord = await getSwitchById(switchId, userId);

    if (!switchRecord) {
      return res.status(404).json({ error: 'Switch not found' });
    }

    res.json({
      message: 'Switch retrieved successfully',
      switch: switchRecord
    });
  } catch (err) {
    console.error('Get switch error:', err);
    res.status(500).json({ error: 'Failed to retrieve switch' });
  }
};

// Update switch configuration
const updateSwitchConfig = async (req, res) => {
  try {
    const { switchId } = req.params;
    const userId = req.user.id;
    const { triggerValue, actionType, description } = req.body;

    const switchRecord = await updateSwitch(switchId, userId, triggerValue || 0, actionType || '', description || '');

    if (!switchRecord) {
      return res.status(404).json({ error: 'Switch not found' });
    }

    res.json({
      message: 'Switch updated successfully',
      switch: switchRecord
    });
  } catch (err) {
    console.error('Update switch error:', err);
    res.status(500).json({ error: 'Failed to update switch' });
  }
};

// Ping switch (reset inactivity timer)
const pingTheSwitch = async (req, res) => {
  try {
    const { switchId } = req.params;
    const userId = req.user.id;

    const switchRecord = await pingSwitch(switchId, userId);

    if (!switchRecord) {
      return res.status(404).json({ error: 'Switch not found or inactive' });
    }

    res.json({
      message: 'Switch pinged successfully',
      switch: switchRecord
    });
  } catch (err) {
    console.error('Ping switch error:', err);
    res.status(500).json({ error: 'Failed to ping switch' });
  }
};

// Manually trigger switch
const manuallyTriggerSwitch = async (req, res) => {
  try {
    const { switchId } = req.params;
    const userId = req.user.id;

    const switchRecord = await triggerSwitch(switchId, userId);

    if (!switchRecord) {
      return res.status(404).json({ error: 'Switch not found or inactive' });
    }

    res.json({
      message: 'Switch triggered successfully',
      switch: switchRecord
    });
  } catch (err) {
    console.error('Trigger switch error:', err);
    res.status(500).json({ error: 'Failed to trigger switch' });
  }
};

// Toggle switch active/inactive
const toggleSwitch = async (req, res) => {
  try {
    const { switchId } = req.params;
    const userId = req.user.id;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive is required and must be boolean' });
    }

    const switchRecord = await toggleSwitchStatus(switchId, userId, isActive);

    if (!switchRecord) {
      return res.status(404).json({ error: 'Switch not found' });
    }

    res.json({
      message: `Switch ${isActive ? 'activated' : 'deactivated'} successfully`,
      switch: switchRecord
    });
  } catch (err) {
    console.error('Toggle switch error:', err);
    res.status(500).json({ error: 'Failed to toggle switch' });
  }
};

// Delete switch
const removeSwitch = async (req, res) => {
  try {
    const { switchId } = req.params;
    const userId = req.user.id;

    const switchRecord = await deleteSwitch(switchId, userId);

    if (!switchRecord) {
      return res.status(404).json({ error: 'Switch not found' });
    }

    res.json({
      message: 'Switch deleted successfully',
      switchId: switchRecord.id
    });
  } catch (err) {
    console.error('Delete switch error:', err);
    res.status(500).json({ error: 'Failed to delete switch' });
  }
};

module.exports = {
  createNewSwitch,
  getAllSwitches,
  getSwitch,
  updateSwitchConfig,
  pingTheSwitch,
  manuallyTriggerSwitch,
  toggleSwitch,
  removeSwitch
};
