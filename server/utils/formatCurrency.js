const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
};

const formatThaiBaht = (amount) => `${formatCurrency(amount)} บาท`;

const numberToThaiText = (num) => {
  const digits = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  if (num === 0) return 'ศูนย์บาทถ้วน';
  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  let result = '';
  const str = intPart.toString();
  for (let i = 0; i < str.length; i++) {
    const d = parseInt(str[i]);
    const pos = str.length - i - 1;
    if (d === 0) continue;
    if (pos === 1 && d === 1) result += 'สิบ';
    else if (pos === 1 && d === 2) result += 'ยี่สิบ';
    else if (pos === 0 && d === 1 && str.length > 1) result += 'เอ็ด';
    else result += digits[d] + positions[pos];
  }
  result += 'บาท';
  if (decPart > 0) {
    const decStr = decPart.toString().padStart(2, '0');
    for (let i = 0; i < decStr.length; i++) {
      const d = parseInt(decStr[i]);
      const pos = decStr.length - i - 1;
      if (d === 0) continue;
      if (pos === 1 && d === 1) result += 'สิบ';
      else if (pos === 1 && d === 2) result += 'ยี่สิบ';
      else if (pos === 0 && d === 1 && i > 0) result += 'เอ็ด';
      else result += digits[d] + positions[pos];
    }
    result += 'สตางค์';
  } else {
    result += 'ถ้วน';
  }
  return result;
};

module.exports = { formatCurrency, formatThaiBaht, numberToThaiText };
