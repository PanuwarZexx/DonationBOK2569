const router = require('express').Router();
const c = require('../controllers/donationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { donationValidation } = require('../middleware/validator');
const { requestLogger } = require('../middleware/logger');

router.get('/latest', c.getLatestDonations);
router.get('/stats', c.getDonationStats);
router.get('/', protect, authorize('admin', 'staff'), c.getDonations);
router.get('/:id', protect, authorize('admin', 'staff'), c.getDonation);
router.post('/', protect, authorize('admin', 'staff'), requestLogger, donationValidation, c.createDonation);
router.put('/:id', protect, authorize('admin', 'staff'), requestLogger, c.updateDonation);
router.put('/:id/verify', protect, authorize('admin', 'staff'), requestLogger, c.verifyDonation);
router.put('/:id/cancel', protect, authorize('admin', 'staff'), requestLogger, c.cancelDonation);
router.delete('/:id', protect, authorize('admin'), requestLogger, c.deleteDonation);

module.exports = router;
