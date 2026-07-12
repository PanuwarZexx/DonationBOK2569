# 🙏 ระบบแจ้งยอดบริจาคผ้าป่าสามัคคี
## โรงเรียนบ้านบกหนองทันน้ำ ประจำปี 2569

ระบบแจ้งยอดบริจาคแบบ Real-time พร้อมระบบรับสลิปผ่าน LINE Official Account

### 🚀 Features
- แสดงยอดบริจาคแบบ Real-time ผ่าน Socket.IO
- รับสลิปโอนเงินผ่าน LINE Official Account
- ประกาศเสียงขอบคุณผู้บริจาคอัตโนมัติ (TTS)
- หน้าจอ TV Mode สำหรับแสดงผลบนจอขนาดใหญ่
- ระบบออกใบอนุโมทนาบัตรอัตโนมัติ
- Dashboard สำหรับผู้ดูแลระบบ

### 🛠 Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5, Socket.IO Client
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **APIs:** LINE Messaging API, Google Cloud Vision (OCR)

### 📦 Installation
```bash
npm install
cp .env.example .env
# แก้ไขค่าตัวแปรใน .env
npm run dev
```

### 🌐 Deploy to Render.com
1. Fork/Push this repo to GitHub
2. Create a new Web Service on Render.com
3. Connect your GitHub repo
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`
6. Add environment variables from `.env.example`

### 📱 LINE Official Account
- LINE ID: @805fzihe
