const router = require('express').Router();
const c = require('../controllers/dashboardController');
router.get('/summary', c.getSummary);
router.get('/chart', c.getChartData);
router.get('/top10', c.getTop10);
router.get('/progress', c.getProgress);
module.exports = router;
