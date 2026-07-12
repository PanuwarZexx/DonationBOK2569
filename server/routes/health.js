const router = require('express').Router();
router.get('/', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: Math.floor(process.uptime()) + 's', version: '1.0.0' });
});
module.exports = router;
