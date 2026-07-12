require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// ===== Security =====
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());

// ===== Body Parser =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== Rate Limiter =====
app.use('/api/', generalLimiter);

// ===== Static Files =====
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/manifest.json', express.static(path.join(__dirname, '..', 'manifest.json')));
app.use('/sw.js', express.static(path.join(__dirname, '..', 'sw.js')));

// ===== API Routes =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/search', require('./routes/search'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/users', require('./routes/users'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/webhook/line', require('./routes/lineWebhook'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/health', require('./routes/health'));

// ===== SPA Fallback =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});
app.get('/tv', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'tv.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});
app.get('/admin/*', (req, res) => {
  const page = req.params[0] || 'dashboard';
  const filePath = path.join(__dirname, '..', 'public', `${page}.html`);
  res.sendFile(filePath, (err) => {
    if (err) res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
  });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

module.exports = app;
