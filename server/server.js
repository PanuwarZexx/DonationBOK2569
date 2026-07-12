const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./services/socketService');

const PORT = process.env.PORT || 3000;

// ===== Connect to MongoDB =====
connectDB();

// ===== Create HTTP Server =====
const server = http.createServer(app);

// ===== Initialize Socket.IO =====
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ===== Setup Socket Events =====
initSocket(io);

// ===== Make io accessible to routes =====
app.set('io', io);

// ===== Start Server =====
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║  🙏 Donation Realtime System - BOK2569                  ║
  ║  📡 Server running on port ${PORT}                        ║
  ║  🌐 http://localhost:${PORT}                              ║
  ║  📺 TV Mode: http://localhost:${PORT}/tv                  ║
  ║  🔧 Environment: ${process.env.NODE_ENV || 'development'}                       ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});

// ===== Daily Backup Cron (midnight) =====
const cron = require('node-cron');
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('🔄 Running daily backup...');
    const { createBackup } = require('./services/backupService');
    await createBackup();
    console.log('✅ Daily backup completed');
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  }
}, { timezone: 'Asia/Bangkok' });

// ===== Handle Unhandled Rejections =====
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
