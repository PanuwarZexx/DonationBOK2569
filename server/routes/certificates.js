const router = require('express').Router();
const c = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
router.get('/verify/:number', c.verifyCertificate);
router.get('/', protect, authorize('admin', 'staff'), c.getCertificates);
router.get('/:id', protect, authorize('admin', 'staff'), c.getCertificate);
router.post('/', protect, authorize('admin', 'staff'), c.createCertificate);
module.exports = router;
