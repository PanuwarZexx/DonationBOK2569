const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// @desc    สร้าง Backup
exports.createBackup = async (req, res) => {
  try {
    const collections = ['users', 'donations', 'certificates', 'settings', 'logs', 'banks', 'notifications', 'receipts'];
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dir = path.join(backupDir, `backup-${timestamp}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    for (const col of collections) {
      try {
        const data = await mongoose.connection.db.collection(col).find({}).toArray();
        fs.writeFileSync(path.join(dir, `${col}.json`), JSON.stringify(data, null, 2));
      } catch (e) { /* collection may not exist yet */ }
    }
    const msg = `Backup สำเร็จ: ${dir}`;
    if (res) res.json({ success: true, message: msg, path: dir });
    return msg;
  } catch (error) {
    if (res) res.status(500).json({ success: false, message: error.message });
    throw error;
  }
};

// @desc    รายการ Backup
exports.getBackupList = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    if (!fs.existsSync(backupDir)) return res.json({ success: true, data: [] });
    const dirs = fs.readdirSync(backupDir).filter(f => f.startsWith('backup-')).sort().reverse();
    res.json({ success: true, data: dirs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore Backup
exports.restoreBackup = async (req, res) => {
  try {
    const { backupName } = req.body;
    const dir = path.join(__dirname, '..', '..', 'backups', backupName);
    if (!fs.existsSync(dir)) return res.status(404).json({ success: false, message: 'ไม่พบ Backup' });
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const colName = file.replace('.json', '');
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
      if (data.length > 0) {
        const col = mongoose.connection.db.collection(colName);
        await col.deleteMany({});
        await col.insertMany(data);
      }
    }
    res.json({ success: true, message: 'Restore สำเร็จ' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
