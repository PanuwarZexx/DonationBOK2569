const Log = require('../models/Log');

const requestLogger = async (req, res, next) => {
  try {
    if (req.method !== 'GET' && req.user) {
      await Log.create({
        userId: req.user?._id,
        username: req.user?.username || 'anonymous',
        action: `${req.method} ${req.originalUrl}`,
        details: JSON.stringify(req.body).substring(0, 500),
        ip: req.ip || req.connection.remoteAddress,
        browser: (req.headers['user-agent'] || '').substring(0, 200)
      });
    }
  } catch (err) {
    console.error('Logger error:', err.message);
  }
  next();
};

module.exports = { requestLogger };
