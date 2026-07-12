const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { uploadSlip } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'uploads');
    require('fs').mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `slip-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  cb(ext && mime ? null : new Error('รองรับเฉพาะไฟล์รูปภาพ'), ext && mime);
}});

router.post('/', protect, authorize('admin', 'staff'), upload.single('slip'), uploadSlip);
module.exports = router;
