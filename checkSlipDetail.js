const mongoose = require('mongoose');
require('dotenv').config();

const checkAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Donation = require('./server/models/Donation');
    const donations = await Donation.find().sort({ createdAt: -1 });
    console.log(donations);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkAll();
