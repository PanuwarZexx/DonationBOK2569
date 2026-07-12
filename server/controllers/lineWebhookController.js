const fs = require('fs');
const path = require('path');
const Donation = require('../models/Donation');
const Setting = require('../models/Setting');
const ocrService = require('../services/ocrService');
const slipVerifier = require('../services/slipVerifier');
const { emitNewDonation, emitStatsUpdate } = require('../services/socketService');
const { replyMessage } = require('../services/lineService');

// Helper สำหรับดึงข้อมูลสถิติล่าสุดส่งผ่าน Socket
const updateStatsSocket = async () => {
  try {
    const [totalAgg, settings] = await Promise.all([
      Donation.aggregate([
        { $match: { status: { $in: ['verified', 'cash'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Setting.findOne()
    ]);
    const totalAmount = totalAgg[0]?.total || 0;
    const goalAmount = settings?.goalAmount || 500000;
    emitStatsUpdate({ totalAmount, goalAmount });
  } catch (error) {
    console.error('Error updating stats socket:', error.message);
  }
};

// @desc    LINE Webhook handler
// @route   POST /api/webhook/line
exports.handleWebhook = async (req, res) => {
  try {
    const events = req.body.events || [];
    for (const event of events) {
      if (event.type === 'message') {
        const lineUserId = event.source.userId;

        // ===== 1. รับข้อความภาพ (สลิปโอนเงิน) =====
        if (event.message.type === 'image') {
          const messageId = event.message.id;

          // ดาวน์โหลดข้อมูลรูปภาพจาก LINE API
          let imageBuffer;
          try {
            const axios = require('axios');
            const response = await axios({
              method: 'GET',
              url: `https://api-data.line.me/v2/bot/message/${messageId}/content`,
              headers: {
                Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
              },
              responseType: 'arraybuffer'
            });
            imageBuffer = response.data;
          } catch (err) {
            console.error('Error downloading LINE image:', err.message);
            await replyMessage(event.replyToken, {
              type: 'text',
              text: '❌ ไม่สามารถดาวน์โหลดรูปภาพสลิปได้ชั่วคราว กรุณาส่งใหม่อีกครั้งครับ'
            });
            continue;
          }

          // บันทึกไฟล์รูปภาพลงโฟลเดอร์ของเซิร์ฟเวอร์
          const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const filename = `line_${messageId}.jpg`;
          const localPath = path.join(uploadDir, filename);
          fs.writeFileSync(localPath, imageBuffer);

          let imageUrl = `${process.env.FRONTEND_URL || 'https://donationbok2569.onrender.com'}/uploads/${filename}`;

          // อัปโหลดเข้า Cloudinary (หากตั้งค่าไว้)
          if (process.env.CLOUDINARY_CLOUD_NAME) {
            try {
              const cloudinary = require('../config/cloudinary');
              const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  { folder: 'donation-slips' },
                  (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                  }
                );
                stream.end(imageBuffer);
              });
              imageUrl = uploadResult.secure_url;
            } catch (err) {
              console.error('Cloudinary upload error, fallback to local URL:', err.message);
            }
          }

          // ประมวลผลภาพด้วย OCR
          const ocrResult = await ocrService.processSlipImage(imageUrl);

          if (ocrResult.success && ocrResult.data && ocrResult.data.amount) {
            const ocrData = ocrResult.data;

            // ตรวจสอบสลิปซ้ำ
            const verifyResult = await slipVerifier.verifySlip(ocrData);
            if (verifyResult.isDuplicate) {
              await replyMessage(event.replyToken, {
                type: 'text',
                text: `🚨 ขออภัยครับ! สลิปโอนเงินนี้เคยถูกส่งเข้าระบบแล้ว หรือพบยอดซ้ำในช่วงเวลาใกล้เคียงกัน กรุณาตรวจสอบสลิปอีกครั้งครับ`
              });
              continue;
            }

            // บันทึกการบริจาค (อนุมัติอัตโนมัติหากสแกนสำเร็จ)
            const donation = await Donation.create({
              donorName: ocrData.senderName || 'ผู้บริจาคผ่าน LINE',
              amount: ocrData.amount,
              channel: 'transfer',
              status: 'verified',
              bankName: ocrData.bankName || '',
              reference: ocrData.reference || '',
              slipImage: imageUrl,
              ocrData: {
                ...ocrData,
                rawText: ocrResult.rawText
              },
              lineUserId: lineUserId,
              note: 'ส่งสลิปผ่าน LINE (ตรวจสอบอัตโนมัติด้วย OCR)'
            });

            // ส่งข้อมูลแจ้งเตือนและสถิติผ่าน Socket
            emitNewDonation(donation);
            await updateStatsSocket();

            // ตอบกลับผู้ใช้ใน LINE
            await replyMessage(event.replyToken, {
              type: 'text',
              text: `ได้รับข้อมูลสลิปโอนเงินเรียบร้อยแล้วครับ! 🙏\n\n👤 ผู้โอน: ${donation.donorName}\n💵 ยอดเงิน: ${donation.amount.toLocaleString()} บาท\n🏦 ธนาคาร: ${donation.bankName}\n\nขออนุโมทนาบุญด้วยครับ ✨`
            });

          } else {
            // กรณี OCR ค้นหายอดเงินไม่เจอ หรือไม่ได้ตั้งค่า Vision API Key
            const donation = await Donation.create({
              donorName: 'รอตรวจสอบ (LINE)',
              amount: 1, // ขั้นต่ำตาม Schema ของฐานข้อมูล
              channel: 'transfer',
              status: 'pending_review',
              slipImage: imageUrl,
              lineUserId: lineUserId,
              note: 'ส่งสลิปผ่าน LINE - รอตรวจสอบข้อมูลแมนนวล'
            });

            await replyMessage(event.replyToken, {
              type: 'text',
              text: `ได้รับรูปภาพสลิปเรียบร้อยแล้วครับ! 🙏\n\n⚠️ ระบบไม่สามารถดึงยอดเงินอัตโนมัติได้ เจ้าหน้าที่จะทำการตรวจสอบและอัปเดตยอดเงินให้ท่านในระบบหลังบ้าน ขออภัยในความไม่สะดวกครับ`
            });
          }

        // ===== 2. รับข้อความตัวอักษร (เงินสด / เช็คยอด) =====
        } else if (event.message.type === 'text') {
          const text = event.message.text.trim();

          // ตรวจจับแพตเทิร์นแจ้งยอดเงินสด: "เงินสด [ชื่อผู้บริจาค] [จำนวนเงิน]" หรือ "บริจาคเงินสด [ชื่อผู้บริจาค] [จำนวนเงิน]"
          const cashMatch = text.match(/^(?:บริจาค)?เงินสด\s+(.+)\s+(\d+(?:,\d{3})*(?:\.\d{1,2})?)$/i);

          if (cashMatch) {
            const donorName = cashMatch[1].trim();
            const amountVal = parseFloat(cashMatch[2].replace(/,/g, ''));

            if (amountVal > 0) {
              const donation = await Donation.create({
                donorName,
                amount: amountVal,
                channel: 'cash',
                status: 'cash',
                lineUserId: lineUserId,
                note: 'แจ้งยอดเงินสดผ่าน LINE'
              });

              // ส่งอัปเดตผ่าน Socket
              emitNewDonation(donation);
              await updateStatsSocket();

              // ตอบกลับใน LINE
              await replyMessage(event.replyToken, {
                type: 'text',
                text: `ได้รับข้อมูลบริจาคเงินสดเรียบร้อยแล้วครับ! 🙏\n\n👤 ผู้บริจาค: ${donorName}\n💵 จำนวนเงิน: ${amountVal.toLocaleString()} บาท\n\nขออนุโมทนาบุญด้วยครับ ✨`
              });
            } else {
              await replyMessage(event.replyToken, {
                type: 'text',
                text: `❌ จำนวนเงินต้องมากกว่า 0 บาทครับ`
              });
            }

          // ตรวจจับแพตเทิร์นตรวจสอบยอด: "ยอดรวม" หรือ "ยอดบริจาค" หรือ "เช็คยอด"
          } else if (['ยอดรวม', 'ยอดบริจาค', 'เช็คยอด'].includes(text)) {
            const [totalAgg, countAgg] = await Promise.all([
              Donation.aggregate([
                { $match: { status: { $in: ['verified', 'cash'] } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
              ]),
              Donation.countDocuments({ status: { $in: ['verified', 'cash'] } })
            ]);

            const totalAmount = totalAgg[0]?.total || 0;
            await replyMessage(event.replyToken, {
              type: 'text',
              text: `📊 ยอดบริจาครวมขณะนี้:\n💰 ${totalAmount.toLocaleString()} บาท\n👥 จำนวนผู้บริจาค: ${countAgg} ราย\n\nขออนุโมทนาบุญกับทุกๆ ท่านด้วยครับ 🙏`
            });

          // กรณีพิมพ์คำสั่งอื่น
          } else {
            await replyMessage(event.replyToken, {
              type: 'text',
              text: `ยินดีต้อนรับสู่ระบบผ้าป่าสามัคคีเพื่อการศึกษา โรงเรียนบ้านบกหนองทันน้ำ 2569 ครับ! 🙏\n\n📌 วิธีการแจ้งยอดบริจาค:\n\n1. 💵 **แจ้งบริจาคเงินสด:** พิมพ์คำว่า 'เงินสด [ชื่อผู้บริจาค] [ยอดเงิน]'\n   *ตัวอย่าง: เงินสด นายสมชาย ใจดี 500*\n\n2. 📱 **ส่งสลิปโอนเงิน:** สามารถกดแนบและส่งรูปสลิปโอนเงินธนาคาร เข้ามาในห้องแชทนี้ได้เลยครับ`
            });
          }
        }
      }
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('LINE Webhook Error:', error);
    res.status(200).json({ success: true }); // ส่ง 200 กลับไลน์เสมอ เพื่อป้องกัน LINE พยายามส่งซ้ำเมื่อเกิด error
  }
};

