const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/olap/rollup', analyticsController.getRollup);
router.get('/olap/drilldown', analyticsController.getDrilldown);
router.get('/olap/slice', analyticsController.getSlice);
router.get('/olap/dice', analyticsController.getDice);
router.get('/olap/pivot', analyticsController.getPivot);
router.get('/revenue', analyticsController.getRevenue);
router.get('/hourly', analyticsController.getHourly);
router.get('/data-mining', analyticsController.getDataMiningResults);

module.exports = router;
