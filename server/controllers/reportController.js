const Donation = require('../models/Donation');
const ExcelJS = require('exceljs');
const moment = require('moment-timezone');

// @desc    Export Excel
// @route   GET /api/reports/excel
exports.exportExcel = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const donations = await Donation.find(filter).sort({ createdAt: -1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('รายการบริจาค');
    sheet.columns = [
      { header: 'ลำดับ', key: 'no', width: 8 },
      { header: 'ชื่อผู้บริจาค', key: 'donorName', width: 25 },
      { header: 'จำนวนเงิน (บาท)', key: 'amount', width: 18 },
      { header: 'ช่องทาง', key: 'channel', width: 12 },
      { header: 'สถานะ', key: 'status', width: 15 },
      { header: 'วันที่', key: 'date', width: 18 },
      { header: 'หมู่บ้าน', key: 'village', width: 15 },
      { header: 'ตำบล', key: 'subDistrict', width: 15 },
      { header: 'ประเภท', key: 'category', width: 12 },
      { header: 'หมายเหตุ', key: 'note', width: 20 }
    ];
    // Style header
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD700' } };
    donations.forEach((d, i) => {
      sheet.addRow({
        no: i + 1, donorName: d.donorName, amount: d.amount,
        channel: d.channel === 'transfer' ? 'โอน' : d.channel === 'cash' ? 'เงินสด' : 'เช็ค',
        status: getStatusThai(d.status),
        date: moment(d.createdAt).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm'),
        village: d.village, subDistrict: d.subDistrict,
        category: getCategoryThai(d.category), note: d.note
      });
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=donations_${moment().format('YYYYMMDD')}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export CSV
// @route   GET /api/reports/csv
exports.exportCSV = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const donations = await Donation.find(filter).sort({ createdAt: -1 });
    let csv = '\uFEFF' + 'ลำดับ,ชื่อผู้บริจาค,จำนวนเงิน,ช่องทาง,สถานะ,วันที่,หมู่บ้าน,ตำบล,ประเภท,หมายเหตุ\n';
    donations.forEach((d, i) => {
      csv += `${i + 1},"${d.donorName}",${d.amount},${d.channel},${d.status},${moment(d.createdAt).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm')},"${d.village}","${d.subDistrict}",${d.category},"${d.note}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=donations_${moment().format('YYYYMMDD')}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    รายงานรายวัน
// @route   GET /api/reports/daily
exports.getDailyReport = async (req, res) => {
  try {
    const data = await Donation.aggregate([
      { $match: { status: { $in: ['verified', 'cash'] } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Bangkok' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } }, { $limit: 30 }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    รายงานรายเดือน
// @route   GET /api/reports/monthly
exports.getMonthlyReport = async (req, res) => {
  try {
    const data = await Donation.aggregate([
      { $match: { status: { $in: ['verified', 'cash'] } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Bangkok' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } }, { $limit: 12 }
    ]);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function buildFilter(query) {
  const filter = { status: { $in: ['verified', 'cash'] } };
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filter.createdAt.$lte = new Date(query.endDate + 'T23:59:59');
  }
  if (query.channel) filter.channel = query.channel;
  if (query.category) filter.category = query.category;
  return filter;
}

function getStatusThai(s) {
  const map = { waiting_slip: 'รอสลิป', pending_review: 'รอตรวจสอบ', verified: 'ยืนยันแล้ว', cash: 'เงินสด', cancel: 'ยกเลิก' };
  return map[s] || s;
}
function getCategoryThai(c) {
  const map = { alumni: 'ศิษย์เก่า', parent: 'ผู้ปกครอง', company: 'บริษัท', general: 'ทั่วไป', other: 'อื่นๆ' };
  return map[c] || c;
}
