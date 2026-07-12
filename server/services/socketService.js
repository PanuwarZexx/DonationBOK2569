// Socket.IO Service — จัดการ Real-time events

let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });

    // ส่ง connection confirmation
    socket.emit('connected', { message: 'เชื่อมต่อ Real-time สำเร็จ', socketId: socket.id });
  });
};

// ส่ง event ไปทุก client
const emitNewDonation = (donation) => {
  if (ioInstance) ioInstance.emit('new_donation', donation);
};

const emitDonationUpdated = (donation) => {
  if (ioInstance) ioInstance.emit('donation_updated', donation);
};

const emitStatsUpdate = (stats) => {
  if (ioInstance) ioInstance.emit('stats_updated', stats);
};

module.exports = { initSocket, emitNewDonation, emitDonationUpdated, emitStatsUpdate };
