const express = require('express');
const router = express.Router();
const { getDonorProfiles, upsertDonorProfile, deleteDonorProfile } = require('../controllers/donorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// ทุกเส้นทางต้องได้รับการตรวจสอบสิทธิ์และอนุญาตสำหรับแอดมินหรือเจ้าหน้าที่
router.use(protect);
router.use(authorize('admin', 'staff'));

router.route('/profiles')
  .get(getDonorProfiles)
  .post(upsertDonorProfile);

router.route('/profiles/:id')
  .delete(deleteDonorProfile);

module.exports = router;
