const axios = require('axios');

// OCR Service — อ่านข้อมูลจากสลิปด้วย Google Cloud Vision API
const processSlipImage = async (imageInput) => {
  try {
    if (!process.env.GOOGLE_CLOUD_API_KEY) {
      return { success: false, message: 'ยังไม่ได้ตั้งค่า Google Cloud API Key' };
    }
    
    let imagePayload = {};
    if (imageInput.startsWith('data:')) {
      // ดึงเฉพาะส่วนของ base64 content ออกมา
      const base64Content = imageInput.split(',')[1];
      imagePayload = { content: base64Content };
    } else {
      imagePayload = { source: { imageUri: imageInput } };
    }

    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
      {
        requests: [{
          image: imagePayload,
          features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
        }]
      }
    );
    const text = response.data.responses[0]?.fullTextAnnotation?.text || '';
    return { success: true, data: parseSlipText(text), rawText: text };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Parse ข้อความจากสลิปธนาคารไทย
const parseSlipText = (text) => {
  const result = { senderName: '', bankName: '', time: '', date: '', amount: 0, reference: '' };
  // จับจำนวนเงิน
  const amountMatch = text.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2}))\s*(?:บาท|THB|baht)/i)
    || text.match(/(?:จำนวน|amount)[:\s]*(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/i);
  if (amountMatch) result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  // จับเวลา
  const timeMatch = text.match(/(\d{1,2}[:.]\d{2}(?:[:.]\d{2})?)\s*(?:น\.|hrs|AM|PM)?/i);
  if (timeMatch) result.time = timeMatch[1];
  // จับวันที่
  const dateMatch = text.match(/(\d{1,2})\s*[/\-\.]\s*(\d{1,2})\s*[/\-\.]\s*(\d{2,4})/);
  if (dateMatch) result.date = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
  // จับ Reference
  const refMatch = text.match(/(?:ref|อ้างอิง|เลขที่|trans)[.\s:#]*([A-Z0-9]{6,20})/i);
  if (refMatch) result.reference = refMatch[1];
  // จับชื่อธนาคาร
  const banks = ['กสิกร', 'ไทยพาณิชย์', 'กรุงไทย', 'กรุงเทพ', 'ทหารไทยธนชาต', 'ออมสิน', 'กรุงศรี', 'ธ.ก.ส.', 'KBANK', 'SCB', 'KTB', 'BBL', 'TTB', 'GSB', 'BAY', 'BAAC'];
  for (const bank of banks) {
    if (text.includes(bank)) { result.bankName = bank; break; }
  }
  return result;
};

module.exports = { processSlipImage, parseSlipText };
