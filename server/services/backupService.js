const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const createBackup = async () => {
  const collections = ['users', 'donations', 'certificates', 'settings', 'logs', 'banks', 'notifications', 'receipts'];
  const backupDir = path.join(__dirname, '..', '..', 'backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.join(backupDir, `backup-${timestamp}`);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const col of collections) {
    try {
      const data = await mongoose.connection.db.collection(col).find({}).toArray();
      fs.writeFileSync(path.join(dir, `${col}.json`), JSON.stringify(data, null, 2));
    } catch (e) { /* collection may not exist */ }
  }
  console.log(`✅ Backup created: ${dir}`);
  return dir;
};

module.exports = { createBackup };
