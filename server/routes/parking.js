const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.post('/entry', parkingController.entry);
router.post('/exit', parkingController.exit);
router.get('/active', parkingController.getActiveParkings);
router.get('/history', parkingController.getHistory);

module.exports = router;
