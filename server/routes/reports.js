const router = require('express').Router();
const c = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
router.get('/excel', protect, authorize('admin', 'staff'), c.exportExcel);
router.get('/csv', protect, authorize('admin', 'staff'), c.exportCSV);
router.get('/daily', protect, authorize('admin', 'staff'), c.getDailyReport);
router.get('/monthly', protect, authorize('admin', 'staff'), c.getMonthlyReport);
module.exports = router;
