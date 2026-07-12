const Donation = require('../models/Donation');

// @desc    LINE Webhook handler
// @route   POST /api/webhook/line
exports.handleWebhook = async (req, res) => {
  try {
    const events = req.body.events || [];
    for (const event of events) {
      if (event.type === 'message') {
        if (event.message.type === 'image') {
          // รับรูปสลิป - สร้างรายการรอตรวจสอบ
          const donation = await Donation.create({
            donorName: 'รอตรวจสอบ (LINE)',
            amount: 0,
            channel: 'transfer',
            status: 'waiting_slip',
            lineUserId: event.source.userId,
            note: 'ส่งสลิปผ่าน LINE - รอ OCR'
          });
          console.log('📱 New slip from LINE:', donation._id);
          // TODO: OCR processing + Cloudinary upload
        } else if (event.message.type === 'text') {
          console.log('💬 LINE message:', event.message.text);
          // TODO: Reply with current total or help
        }
      }
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('LINE Webhook Error:', error);
    res.status(200).json({ success: true }); // Always return 200 to LINE
  }
};
