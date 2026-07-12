const router = require('express').Router();
const c = require('../controllers/logController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
router.use(protect, authorize('admin'));
router.get('/', c.getLogs);
router.delete('/', c.clearLogs);
module.exports = router;
