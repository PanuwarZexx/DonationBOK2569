const router = require('express').Router();
const c = require('../controllers/settingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
router.get('/public', c.getPublicSettings);
router.get('/', protect, authorize('admin'), c.getSettings);
router.put('/', protect, authorize('admin'), c.updateSettings);
module.exports = router;
