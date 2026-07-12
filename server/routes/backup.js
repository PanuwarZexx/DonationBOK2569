const router = require('express').Router();
const c = require('../controllers/backupController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
router.use(protect, authorize('admin'));
router.post('/create', c.createBackup);
router.post('/restore', c.restoreBackup);
router.get('/list', c.getBackupList);
module.exports = router;
