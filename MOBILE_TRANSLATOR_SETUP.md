# เปิดใช้ AI Translator บน GitHub Pages และมือถือ

หน้าเว็บ GitHub Pages ไม่มี server-side proxy ให้ `/translate` หรือ `/google-tts` ดังนั้นการเรียก Google จาก Safari/บางเครือข่ายอาจถูกบล็อกโดย CORS หรือ autoplay policy ได้ ZIP นี้มี Cloudflare Worker ที่ทำ proxy ให้ทั้งข้อความแปลและเสียง

## ตั้งค่า Worker (ครั้งเดียว)

1. สร้าง Cloudflare Worker ใหม่จาก Dashboard > Workers & Pages.
2. วางเนื้อหา `translator-worker.js` ใน Worker แล้ว Deploy.
3. คัดลอก URL ของ Worker (ตัวอย่าง `https://ชื่อ-worker.ชื่อบัญชี.workers.dev`).
4. เปิด `translator-config.js` และกำหนด `window.HEAL_TRANSLATOR_API_BASE` เป็น URL นั้น โดยไม่มี `/` ปิดท้าย จากนั้น commit/push ไฟล์เว็บขึ้น GitHub Pages.
5. เปิดหน้าเว็บผ่าน HTTPS บน iPhone/Android และอนุญาต Microphone. แตะ “เริ่มล่าม” ใหม่ทุกครั้งหลัง reload เพื่อให้เบราว์เซอร์อนุญาตเสียงพูดออก.

Worker ไม่เก็บข้อความและไม่ต้องใช้ API key; ข้อความจะถูกส่งต่อไป Google Translate ตามการทำงานของแอป

## ไฟล์ที่นำไปใช้

นำไฟล์ที่อยู่ใน ZIP ไปวางทับตาม path เดิมใน repository โดย `translator-worker.js` เป็น source สำหรับ deploy แยกใน Cloudflare (ไม่ต้องวางใน root เพื่อให้ GitHub Pages รัน)
