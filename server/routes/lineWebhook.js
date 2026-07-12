const router = require('express').Router();
const { handleWebhook } = require('../controllers/lineWebhookController');
router.post('/', handleWebhook);
module.exports = router;
