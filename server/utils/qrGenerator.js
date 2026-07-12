const QRCode = require('qrcode');

const generateQR = async (data) => {
  return await QRCode.toDataURL(data, { width: 300, margin: 2 });
};

const generatePromptPayQR = async (promptPayId, amount) => {
  // PromptPay QR format (simplified)
  const payload = `promptpay://${promptPayId}${amount ? `?amount=${amount}` : ''}`;
  return await QRCode.toDataURL(payload, { width: 300, margin: 2, color: { dark: '#1a1a3e', light: '#ffffff' } });
};

module.exports = { generateQR, generatePromptPayQR };
