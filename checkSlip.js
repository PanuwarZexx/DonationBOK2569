const mongoose = require('mongoose');
require('dotenv').config();

const checkSlipImage = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Donation = require('./server/models/Donation');
    const d = await Donation.findById('6a53824f9ce3a441aa6b8d01');
    if (d) {
      console.log('Donation found!');
      console.log('slipImage:', d.slipImage);
    } else {
      console.log('Donation not found');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkSlipImage();
