require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Setting = require('../models/Setting');
const Bank = require('../models/Bank');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // สร้าง Admin
    const adminExists = await User.findOne({ username: process.env.ADMIN_USERNAME || 'admin' });
    if (!adminExists) {
      await User.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin1234',
        fullName: process.env.ADMIN_FULLNAME || 'ผู้ดูแลระบบ',
        role: 'admin'
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin already exists');
    }

    // สร้าง Settings
    const settingsExists = await Setting.findOne();
    if (!settingsExists) {
      await Setting.create({
        goalAmount: parseInt(process.env.DONATION_GOAL) || 500000,
        promptPayId: process.env.PROMPTPAY_ID || '',
        schoolName: 'โรงเรียนบ้านบกหนองทันน้ำ',
        year: '2569',
        projectName: 'ผ้าป่าสามัคคีเพื่อการศึกษา',
        announcementText: 'ร่วมบุญผ้าป่าสามัคคีเพื่อการศึกษา โรงเรียนบ้านบกหนองทันน้ำ ประจำปี 2569'
      });
      console.log('✅ Default settings created');
    }

    // สร้างรายชื่อธนาคาร
    const bankCount = await Bank.countDocuments();
    if (bankCount === 0) {
      await Bank.insertMany([
        { bankCode: 'KBANK', bankName: 'Kasikorn Bank', bankNameThai: 'ธนาคารกสิกรไทย', color: '#138f2d' },
        { bankCode: 'SCB', bankName: 'Siam Commercial Bank', bankNameThai: 'ธนาคารไทยพาณิชย์', color: '#4e2a82' },
        { bankCode: 'KTB', bankName: 'Krungthai Bank', bankNameThai: 'ธนาคารกรุงไทย', color: '#1ba5e1' },
        { bankCode: 'BBL', bankName: 'Bangkok Bank', bankNameThai: 'ธนาคารกรุงเทพ', color: '#1e4598' },
        { bankCode: 'TTB', bankName: 'TMBThanachart Bank', bankNameThai: 'ธนาคารทหารไทยธนชาต', color: '#fc4f1f' },
        { bankCode: 'GSB', bankName: 'Government Savings Bank', bankNameThai: 'ธนาคารออมสิน', color: '#eb198d' },
        { bankCode: 'BAY', bankName: 'Bank of Ayudhya', bankNameThai: 'ธนาคารกรุงศรีอยุธยา', color: '#fec43b' },
        { bankCode: 'BAAC', bankName: 'BAAC', bankNameThai: 'ธ.ก.ส.', color: '#4b9b1d' }
      ]);
      console.log('✅ Thai banks created');
    }

    console.log('\n🎉 Seed completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
