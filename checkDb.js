const mongoose = require('mongoose');
require('dotenv').config();

const checkDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected!');
    
    // Find all LINE donations
    const Donation = require('./server/models/Donation');
    const donations = await Donation.find({ lineUserId: { $exists: true, $ne: '' } }).sort({ createdAt: -1 });
    console.log(`Found ${donations.length} LINE donations:`);
    donations.forEach(d => {
      console.log(`- ID: ${d._id}, Donor: ${d.donorName}, Amount: ${d.amount}, Channel: ${d.channel}, Status: ${d.status}, Note: ${d.note}, CreatedAt: ${d.createdAt}`);
    });

    const allCount = await Donation.countDocuments();
    console.log(`Total donations in database: ${allCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDatabase();
