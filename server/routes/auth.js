const router = require('express').Router();
const { login, register, getMe, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { authLimiter } = require('../middleware/rateLimiter');
const { loginValidation, userValidation } = require('../middleware/validator');

router.post('/login', authLimiter, loginValidation, login);
router.post('/register', protect, authorize('admin'), userValidation, register);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);

module.exports = router;
