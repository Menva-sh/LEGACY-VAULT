const express = require('express');
const { verifyToken } = require('../backend/middleware/authMiddleware');
const { createNewSwitch, getAllSwitches, getSwitch, updateSwitchConfig, pingTheSwitch, manuallyTriggerSwitch, toggleSwitch, removeSwitch } = require('../backend/controllers/switchController');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// POST /switches - Create new switch
router.post('/', createNewSwitch);

// GET /switches - Get all switches
router.get('/', getAllSwitches);

// GET /switches/:switchId - Get single switch
router.get('/:switchId', getSwitch);

// PUT /switches/:switchId - Update switch
router.put('/:switchId', updateSwitchConfig);

// POST /switches/:switchId/ping - Ping switch
router.post('/:switchId/ping', pingTheSwitch);

// POST /switches/:switchId/trigger - Manually trigger switch
router.post('/:switchId/trigger', manuallyTriggerSwitch);

// PATCH /switches/:switchId/toggle - Toggle active/inactive
router.patch('/:switchId/toggle', toggleSwitch);

// DELETE /switches/:switchId - Delete switch
router.delete('/:switchId', removeSwitch);

module.exports = router;
