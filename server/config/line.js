const line = require('@line/bot-sdk');
require('dotenv').config();

// ตั้งค่า LINE Messaging API
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// สร้าง LINE client สำหรับส่งข้อความ
const lineClient = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

// Middleware สำหรับ verify LINE webhook signature
const lineMiddleware = line.middleware(lineConfig);

module.exports = { lineConfig, lineClient, lineMiddleware };
