const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');

router.get('/', slotController.getAllSlots);
router.get('/floors', slotController.getFloors);
router.get('/available', slotController.getAvailableSlots);

module.exports = router;
