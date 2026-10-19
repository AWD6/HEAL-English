# ตั้งค่า AI Translator สำหรับมือถือ

## อัปโหลดเว็บ

ไฟล์ `translator-config.js` ใส่ URL `/exec` ที่ตรวจแล้วไว้ให้เรียบร้อย คัดลอกไฟล์และโฟลเดอร์ทั้งหมดจากชุดนี้ไปไว้ที่ root ของ GitHub repository โดยให้ `index.html` อยู่ที่ root และเก็บ `interpreter-stt.js`, `assets/` และ `vendor/` ไว้ตามตำแหน่งเดิม ใช้เว็บผ่าน HTTPS และอนุญาตไมโครโฟน

## รู้จำเสียงพม่า

การฟังพม่าใช้ Google Cloud Speech-to-Text (`my-MM`) ผ่าน Apps Script เพราะความรองรับของ speech engine ใน browser แตกต่างกัน โปรดทำตามขั้นตอนใน [SPEECH_TO_TEXT_SETUP.md](SPEECH_TO_TEXT_SETUP.md) ก่อนใช้พม่า โดยต้องตั้ง API key ใน Script Properties และ deploy `Code.gs` รุ่นใหม่ ไม่มีช่องรับเสียงสำรองหรือ dictation ผ่านแป้นพิมพ์

ภาษาไทย อังกฤษ และจีนยังใช้ Speech Recognition ที่ browser มีให้ ระบบเลือกภาษาที่กำลังฟังได้ด้วยปุ่ม **สลับภาษาที่ฟังเอง** และเริ่มแปล/อ่านออกเสียงหลังจบประโยค
