// LINE Service — ส่งข้อความแจ้งเตือนผ่าน LINE
const axios = require('axios');

const sendPushMessage = async (userId, messages) => {
  try {
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) return;
    await axios.post('https://api.line.me/v2/bot/message/push', {
      to: userId, messages: Array.isArray(messages) ? messages : [{ type: 'text', text: messages }]
    }, { headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('LINE Push Error:', error.response?.data || error.message);
  }
};

const sendBroadcast = async (messages) => {
  try {
    if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) return;
    await axios.post('https://api.line.me/v2/bot/message/broadcast', {
      messages: Array.isArray(messages) ? messages : [{ type: 'text', text: messages }]
    }, { headers: { Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('LINE Broadcast Error:', error.response?.data || error.message);
  }
};

const notifyNewDonation = async (donation) => {
  const msg = `🙏 บริจาคใหม่!\n👤 ${donation.donorName}\n💰 ${donation.amount.toLocaleString()} บาท\n📌 ${donation.channel === 'transfer' ? 'โอน' : 'เงินสด'}\n⏰ ${new Date().toLocaleTimeString('th-TH')}`;
  await sendBroadcast(msg);
};

const notifyWaitingSlip = async (amount, time) => {
  const msg = `⚠️ พบยอดเงินเข้า\n💰 ${amount.toLocaleString()} บาท\n⏰ เวลา ${time}\n❌ ยังไม่มีสลิป\n📋 กรุณาตรวจสอบ`;
  await sendBroadcast(msg);
};

const notifyDuplicateSlip = async (reference) => {
  const msg = `🚨 พบสลิปซ้ำ!\n📋 Ref: ${reference}\n❌ รายการนี้อาจเป็นสลิปที่ใช้แล้ว`;
  await sendBroadcast(msg);
};

module.exports = { sendPushMessage, sendBroadcast, notifyNewDonation, notifyWaitingSlip, notifyDuplicateSlip };
