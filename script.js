/* ============================================================
   HEAL English v7 — script.js
   Quiz-mode Role Play + Phrase Card Selector
   (Audited multilingual phrases, Burmese readiness, Thai phonetics for EN/ZH)
   ============================================================ */

const STORAGE_KEY = 'heal_english_v6';
const MULTILINGUAL_MIGRATION_KEY = 'heal_multilingual_seed_audited_v1';
const CHINESE_THAI_PHONETIC_MIGRATION_KEY = 'heal_chinese_thai_phonetic_v4';
const GOOGLE_SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzLHwNoll-8zkQayEf091n9msEnpR6YmS69aWdZP866ejKT-9GSPSUiFoscgCOntK2D/exec';
/* ═══ DEPARTMENTS ════════════════════════════════════════════ */
const DEPT_GROUPS = [
  { group: 'หน่วยที่ 1', items: ['OPD 1', 'OPD 10', 'Telemedicine'] },
  { group: 'หน่วยที่ 2', items: ['OPD 3', 'OPD 4'] },
  { group: 'หน่วยที่ 3', items: ['OPD 6', 'OPD 7', 'Retina'] },
  { group: 'หน่วยที่ 4', items: ['OPD 9', 'OPD 21', 'PCU', 'OPD เฉพาะทางนอกเวลา'] },
  { group: 'หน่วยที่ 5', items: ['OPD 22', 'OPD 23', 'OPD 26'] },
  { group: 'หน่วยที่ 6', items: ['OPD 101', 'รังสีรักษา'] },
  { group: 'หน่วยที่ 7', items: ['EID complex'] },
  { group: 'หน่วยที่ 8', items: ['OPD 27', 'OPD 28', 'OPD 29'] },
  { group: 'หน่วยผ่าตัดเล็ก', items: ['OR Minor ชั้น 3', 'OR Minor ชั้น 10', 'OPD 2'] },
  { group: 'ฉุกเฉิน', items: ['Triage', 'ER', 'OPD นอกเวลา'] },
  { group: 'สังเกตอาการ', items: ['หอผู้ป่วยสังเกตอาการ'] },
  { group: 'เคมีบำบัด', items: ['ห้องให้ยาเคมีบำบัด', 'OPD 24', 'OPD 110', 'EKG', 'ศูนย์สุขใจ'] },
  { group: 'บริการแพทย์ฉุกเฉิน', items: ['EMS', 'Refer', 'Injection Room', 'Dressing Room', 'CSC'] },
  { group: 'อื่นๆ', items: ['อื่นๆ'] },
];
const DEPARTMENTS = DEPT_GROUPS.flatMap(g => g.items);

const defaultScenarios = [
  {
    id: 'greeting', labelEn: 'Greeting', labelTh: 'การทักทาย', icon: '👋',
    phrases: [
      { id:'g1', en:'Hello, welcome to our hospital.', th:'สวัสดีค่ะ ยินดีต้อนรับสู่โรงพยาบาลค่ะ', zh:'您好，欢迎来到我们医院。', phonetic_en:'เฮลโล เวลคัม ทู เอาเออร์ ฮอสพิเทิล', phonetic_zh:'หนีห่าว ฮวนอิ๋ง ไหล เต้า หว่อ เหมิน อี้ย่วน', context:'First contact with patient at entrance or reception', contextTh:'ใช้เมื่อต้อนรับผู้ป่วยที่ทางเข้าหรือเคาน์เตอร์' },
      { id:'g2', en:'How can I help you today?', th:'วันนี้มีอะไรให้ช่วยไหมคะ?', zh:'我今天能帮您什么？', phonetic_en:'เฮา แคน ไอ เฮลป์ ยู ทูเดย์', phonetic_zh:'หว่อ จินเทียน เหนิง ปาง หนิน เสินเมอะ', context:'Opening a patient encounter', contextTh:'ใช้เปิดการสนทนาเพื่อสอบถามความต้องการ' },
      { id:'g3', en:'Please wait here for a moment.', th:'กรุณารอสักครู่ตรงนี้ค่ะ', zh:'请在这里稍等片刻。', phonetic_en:'พลีส เวท เฮียร์ ฟอร์ อะ โมเมินท์', phonetic_zh:'ฉิ่ง จ้าย เจ้อ หลี่ เซาเติ่ง เพี่ยนเค่อ', context:'Asking patient to wait', contextTh:'ใช้ขอให้ผู้ป่วยรอ' },
      { id:'g4', en:'Good morning! How are you feeling today?', th:'สวัสดีตอนเช้าค่ะ วันนี้รู้สึกเป็นอย่างไรบ้างคะ?', zh:'早上好！今天感觉怎么样？', phonetic_en:'กุด มอร์นิ่ง เฮา อาร์ ยู ฟีลิ่ง ทูเดย์', phonetic_zh:'จ้าวซ่างห่าว จินเทียน กั่นเจวี๋ย เจิ่นเมอะย่าง', context:'Morning greeting when visiting a patient', contextTh:'ใช้ทักทายตอนเช้าในหอผู้ป่วย' },
      { id:'g5', en:'Are you here for a check-up?', th:'คุณมาตรวจสุขภาพไหมคะ?', zh:'您是来体检的吗？', phonetic_en:'อาร์ ยู เฮียร์ ฟอร์ อะ เช็คอัพ', phonetic_zh:'หนิน ซื่อ ไหล ถี่เจี่ยน เตอ มะ', context:'Confirming purpose of visit', contextTh:'ใช้ยืนยันวัตถุประสงค์การมาโรงพยาบาล' },
      { id:'g6', en:'Sorry for the delay.', th:'ขอโทษที่ต้องรอนานนะคะ', zh:'抱歉让您久等了。', phonetic_en:'ซอร์รี่ ฟอร์ เดอะ ดีเลย์', phonetic_zh:'เป้าเชี่ยน ร่าง หนิน จิ่ว เติ่ง เลอะ', context:'Apologizing for wait time', contextTh:'ใช้ขอโทษที่ต้องรอนาน' },
      { id:'g7', en:'Please follow me.', th:'กรุณาตามมาด้วยค่ะ', zh:'请跟我来。', phonetic_en:'พลีส ฟอลโล มี', phonetic_zh:'ฉิ่ง เกิน หว่อ ไหล', context:'Leading patient to a room', contextTh:'ใช้นำผู้ป่วยไปยังห้องตรวจ' },
      { id:'g8', en:'Have you checked your blood pressure, weight and height?', th:'คุณวัดความดันโลหิต ชั่งน้ำหนัก วัดส่วนสูงหรือยังคะ?', zh:'您量过血压、体重和身高了吗？', phonetic_en:'แฮฟ ยู เช็กต์ ยอร์ บลัด เพรชเชอร์ เวท แอนด์ ไฮท์', phonetic_zh:'หนิน เหลียง กั้ว เสวี่ยยา ถี่จ้ง เหอ เซินเกา เลอะ มะ', context:'Confirming vital sign pre-checks', contextTh:'ใช้ยืนยันการตรวจสัญญาณชีพ' }
    ]
  },
  {
    id: 'registration', labelEn: 'Registration', labelTh: 'การลงทะเบียน', icon: '📋',
    phrases: [
      { id:'r1', en:'May I have your full name, please?', th:'ขอทราบชื่อ-นามสกุลด้วยค่ะ', zh:'请问您的全名是什么？', phonetic_en:'เมย์ ไอ แฮฟ ยอร์ ฟูล เนม พลีส', phonetic_zh:'ฉิ่งเวิ่น หนิน เตอ เฉวียนหมิง ซื่อ เสินเมอะ', context:'Collecting patient identity at registration', contextTh:'ใช้เก็บข้อมูลตัวตนผู้ป่วย' },
      { id:'r2', en:'Do you have an appointment today?', th:'ได้นัดไว้หรือเปล่าคะ?', zh:'您今天有预约吗？', phonetic_en:'ดู ยู แฮฟ แอน อะพอยต์เมินท์ ทูเดย์', phonetic_zh:'หนิน จินเทียน โหย่ว อวี้เยวีย มะ', context:'Checking prior appointment', contextTh:'ใช้ตรวจสอบว่ามีนัดล่วงหน้าหรือไม่' },
      { id:'r3', en:'Please fill in this form.', th:'กรุณากรอกแบบฟอร์มนี้ด้วยค่ะ', zh:'请填写这张表格。', phonetic_en:'พลีส ฟิล อิน ดิส ฟอร์ม', phonetic_zh:'ฉิ่ง เถียนเสี่ย เจ้อ จาง เปี่ยวเก๋อ', context:'Handing patient registration form', contextTh:'ใช้ขณะมอบแบบฟอร์มลงทะเบียน' },
      { id:'r4', en:'Can I see your passport or ID card?', th:'ขอดูหนังสือเดินทางหรือบัตรประชาชนได้ไหมคะ?', zh:'我可以看一下您的护照或身份证吗？', phonetic_en:'แคน ไอ ซี ยอร์ พาสปอร์ท ออร์ ไอดี การ์ด', phonetic_zh:'หว่อ เขออี่ คั่น อี๋เซี่ย หนิน เตอ ฮู่จ้าว ฮั่ว เซินเฟิ่นเจิ้ง มะ', context:'Verifying identity of foreign patients', contextTh:'ใช้ยืนยันตัวตนผู้ป่วยต่างชาติ' },
      { id:'r5', en:'Please take a seat.', th:'กรุณานั่งรอได้เลยค่ะ', zh:'请坐下稍等。', phonetic_en:'พลีส เทค อะ ซีท', phonetic_zh:'ฉิ่ง จั้ว เซี่ย เชา เติ่ง', context:'Asking patient to sit and wait', contextTh:'ใช้ขอให้ผู้ป่วยนั่งรอ' },
      { id:'r6', en:'The nurse will call you soon.', th:'พยาบาลจะเรียกคุณในอีกไม่นานค่ะ', zh:'护士很快就会叫您。', phonetic_en:'เดอะ เนิร์ส วิล คอล ยู ซูน', phonetic_zh:'ฮู่ซือ เหิ่น ไคว้ จิ้ว ฮุ่ย เจี้ยว หนิน เลอ', context:'Reassuring patient their turn is coming', contextTh:'ใช้ให้ผู้ป่วยมั่นใจว่าจะได้รับการเรียก' },
      { id:'r7', en:'The screen will show your queue number.', th:'หน้าจอจะแสดงหมายเลขคิวของคุณค่ะ', zh:'屏幕上会显示您的排队号码。', phonetic_en:'เดอะ สกรีน วิล โชว์ ยอร์ คิว นัมเบอร์', phonetic_zh:'ผิงมู่ ซ่าง ฮุ่ย เสี่ยนซื่อ หนิน เตอ ไผตุ้ย ห้าวหม่า', context:'Directing patient to watch the queue screen', contextTh:'ใช้บอกให้ผู้ป่วยดูหน้าจอแสดงคิว' },
      { id:'r8', en:'The doctor will see you shortly.', th:'คุณหมอจะพบคุณในอีกสักครู่ค่ะ', zh:'医生很快就会见您。', phonetic_en:'เดอะ ด็อกเตอร์ วิล ซี ยู ชอร์ทลี', phonetic_zh:'อี้เซิง เหิ่น ไคว่ จิ้ว ฮุ่ย เจี้ยน หนิน', context:'Informing patient doctor will be with them soon', contextTh:'ใช้แจ้งว่าแพทย์จะพบในไม่ช้า' },
      { id:'r9', en:'Could you repeat that, please?', th:'ช่วยพูดซ้ำอีกครั้งได้ไหมคะ?', zh:'请您再说一遍好吗？', phonetic_en:'คุด ยู รีพีท แดท พลีส', phonetic_zh:'ฉิ่ง หนิน จ้าย ซัว อี๋เปี้ยน ห่าว มะ', context:'Asking patient to repeat', contextTh:'ใช้ขอให้ผู้ป่วยพูดซ้ำ' },
      { id:'r10', en:'What is your phone number?', th:'เบอร์โทรศัพท์ของคุณคือเบอร์อะไรคะ?', zh:'您的电话号码是多少？', phonetic_en:'วอท อิซ ยอร์ โฟน นัมเบอร์', phonetic_zh:'หนิน เตอะ เตี้ยนฮว่า ห้าวหม่า ซื่อ ตัวเส่า', context:'Collecting contact number', contextTh:'ใช้เก็บเบอร์โทรในระเบียนผู้ป่วย' },
      { id:'r11', en:'When did the symptoms start?', th:'อาการเริ่มต้นเมื่อไหร่คะ?', zh:'症状是什么时候开始的？', phonetic_en:'เวน ดิด เดอะ ซิมทัมส์ สตาร์ท', phonetic_zh:'เจิ้งจ้วง ซื่อ เสินเมอะสือโฮ่ว ไคสื่อ เตอ', context:'Asking onset of symptoms', contextTh:'ใช้สอบถามจุดเริ่มต้นของอาการ' },
      { id:'r12', en:'Where does it hurt?', th:'เจ็บที่ไหนคะ?', zh:'哪里疼？', phonetic_en:'แวร์ ดัซ อิท เฮิร์ท', phonetic_zh:'หนาหลี่ เถิง', context:'Locating area of pain', contextTh:'ใช้ระบุตำแหน่งที่เจ็บปวด' },
      { id:'r13', en:'How severe is the pain? On a scale of 1 to 10.', th:'ปวดมากแค่ไหนคะ? จากคะแนน 1 ถึง 10', zh:'疼痛有多严重？从1到10分。', phonetic_en:'เฮา ซีเวียร์ อิซ เดอะ เปน ออน อะ สเกล ออฟ วัน ทู เทน', phonetic_zh:'เถิงท่ง โหย่ว ตัว หยานจ้ง ฉง อี เต้า สือ เฟิน', context:'Assessing pain intensity', contextTh:'ใช้วัดระดับความเจ็บปวด' },
      { id:'r14', en:'Do you have a fever?', th:'คุณมีไข้ไหมคะ?', zh:'您发烧吗？', phonetic_en:'ดู ยู แฮฟ อะ ฟีเวอร์', phonetic_zh:'หนิน ฟาเชา มะ', context:'Checking for fever', contextTh:'ใช้ตรวจสอบอาการมีไข้' },
      { id:'r15', en:'Are you currently taking any medication?', th:'ตอนนี้คุณกำลังทานยาอะไรอยู่ไหมคะ?', zh:'您目前在服用任何药物吗？', phonetic_en:'อาร์ ยู เคอร์เรินท์ลี เทคคิ่ง เอนี เมดิเคชัน', phonetic_zh:'หนิน มู่เฉียน จ้าย ฝูย่ง เริ่นเหอ เย่าอู้ มะ', context:'Checking current medications', contextTh:'ใช้ตรวจสอบยาที่ผู้ป่วยทานอยู่' },
      { id:'r16', en:'Do you have any chronic diseases?', th:'คุณมีโรคประจำตัวไหมคะ?', zh:'您有任何慢性病吗？', phonetic_en:'ดู ยู แฮฟ เอนี โครนิก ดิซีซิส', phonetic_zh:'หนิน โหย่ว เริ่นเหอ ม่านซิ่งปิ้ง มะ', context:'Screening for chronic conditions', contextTh:'ใช้คัดกรองโรคประจำตัว' },
      { id:'r19', en:'Please sign here.', th:'กรุณาเซ็นชื่อตรงนี้ด้วยค่ะ', zh:'请在这里签名。', phonetic_en:'พลีส ไซน์ เฮียร์', phonetic_zh:'ฉิ่ง จ้าย เจ้อ หลี่ เชียนหมิง', context:'Requesting patient signature', contextTh:'ใช้ขอลายเซ็นผู้ป่วย' },
      { id:'r20', en:'We need to check your vital signs first.', th:'เราต้องตรวจสัญญาณชีพก่อนนะคะ', zh:'我们需要先检查您的生命体征。', phonetic_en:'วี นีด ทู เช็ก ยอร์ ไวทัล ไซน์ส เฟิร์สท์', phonetic_zh:'หว่อเหมิน ซูเย่า เซียน เจี่ยนฉา หนิน เตอ เซิงมิ่ง ถี่เจิง', context:'Informing about vital sign check', contextTh:'ใช้แจ้งว่าต้องตรวจสัญญาณชีพก่อน' }
    ]
  },
  {
    id: 'direction', labelEn: 'Direction', labelTh: 'การบอกทาง', icon: '🗺️',
    phrases: [
      { id:'d1', en:'Please register at the Medical Records Room, Number 19, 1st floor, Chalerm Phra Baramee Building.', th:'ลงทะเบียนที่ห้องเวชระเบียน หมายเลข 19 ชั้น 1 อาคารเฉลิมพระบารมีค่ะ', zh:'请在 Chalerm Phra Baramee 大楼一楼19号病历室登记。', phonetic_en:'พลีส เรจิสเตอร์ แอท เดอะ เมดิเคิล เรคคอร์ดส รูม นัมเบอร์ ไนน์ทีน เฟิร์สต์ ฟลอร์ เฉลิมพระบารมี บิลดิ้ง', phonetic_zh:'ฉิ่ง จ้าย Chalerm Phra Baramee ต้าโหลว อีโหลว สือจิ่ว ห้าว ปิ้งลี่ซื่อ เติงจี้', context:'Directing to registration', contextTh:'บอกทางไปลงทะเบียน' },
      { id:'d2', en:'Please contact customer service centre, 1st floor, Chalerm Phra Baramee Building.', th:'กรุณาติดต่อ customer service centre ชั้น 1 อาคารเฉลิมพระบารมีค่ะ', zh:'请联系 Chalerm Phra Baramee 大楼一楼的客户服务中心。', phonetic_en:'พลีส คอนแทค คัสตอมเมอร์ เซอร์วิส เซนเทอร์ เฟิร์สต์ ฟลอร์ เฉลิมพระบารมี บิลดิ้ง', phonetic_zh:'ฉิ่ง เหลียนซี่ Chalerm Phra Baramee ต้าโหลว อีโหลว เตอ เค่อฮู่ ฝูอู้ จงซิน', context:'Directing to customer service', contextTh:'บอกทางไปศูนย์บริการลูกค้า' },
      { id:'d3', en:'The laboratory room number 11 is on the first floor of Chalerm Phra Baramee Building.', th:'ห้องปฏิบัติการหมายเลข 11 อยู่ที่ชั้น 1 อาคารเฉลิมพระบารมีค่ะ', zh:'11号化验室在 Chalerm Phra Baramee 大楼一楼。', phonetic_en:'เดอะ แล็บโบระทอรี รูม นัมเบอร์ อิเลฟเวิน อิซ ออน เดอะ เฟิร์สต์ ฟลอร์ ออฟ เฉลิมพระบารมี บิลดิ้ง', phonetic_zh:'สืออี ห้าว ฮว่าเยี่ยนซื่อ จ้าย Chalerm Phra Baramee ต้าโหลว อีโหลว', context:'Directing to lab', contextTh:'บอกทางไปห้องแล็บ' },
      { id:'d4', en:'X-ray is at room number 33 on the first floor of Boonsom Martin Building.', th:'เอกซ์เรย์ที่ห้องหมายเลข 33 ชั้น 1 อาคารบุญสม มาร์ตินค่ะ', zh:'X光室在 Boonsom Martin 大楼一楼33号房。', phonetic_en:'เอกซ์เรย์ อิซ แอท รูม นัมเบอร์ เทอร์ตี้ ทรี ออน เดอะ เฟิร์สต์ ฟลอร์ ออฟ บุญสม มาร์ติน บิลดิ้ง', phonetic_zh:'เอกซ์กวงซื่อ จ้าย Boonsom Martin ต้าโหลว อีโหลว ซานสือซาน ห้าว ฝาง', context:'Directing to X-ray', contextTh:'บอกทางไปห้องเอกซ์เรย์' },
      { id:'d5', en:'The pharmacy number 30 is on the first floor of Chalerm Phra Baramee Building.', th:'ห้องยาหมายเลข 30 อยู่ที่ชั้น 1 อาคารเฉลิมพระบารมีค่ะ', zh:'30号药房在 Chalerm Phra Baramee 大楼一楼。', phonetic_en:'เดอะ ฟาร์มาซี นัมเบอร์ เทอร์ตี้ อิซ ออน เดอะ เฟิร์สต์ ฟลอร์ ออฟ เฉลิมพระบารมี บิลดิ้ง', phonetic_zh:'ซานสือ ห้าว เย่าฝาง จ้าย Chalerm Phra Baramee ต้าโหลว อีโหลว', context:'Directing to pharmacy', contextTh:'บอกทางไปห้องยา' },
      { id:'d6', en:'Please follow the signs.', th:'กรุณาเดินตามป้ายบอกทางค่ะ', zh:'请随指示牌走。', phonetic_en:'พลีส ฟอลโล เดอะ ไซน์ส', phonetic_zh:'ฉิ่ง สุย จื่อซื่อไผ โจ่ว', context:'General direction', contextTh:'บอกให้เดินตามป้าย' },
      { id:'d7', en:'Please contact cashier number 1 on the first floor of Sujinno Building.', th:'กรุณาติดต่อแคชเชียร์หมายเลข 1 ชั้น 1 อาคารสุจินโณค่ะ', zh:'请联系 Sujinno 大楼一楼1号收银台。', phonetic_en:'พลีส คอนแทค แคชเชียร์ นัมเบอร์ วัน ออน เดอะ เฟิร์สต์ ฟลอร์ ออฟ สุจินโณ บิลดิ้ง', phonetic_zh:'ฉิ่ง เหลียนซี่ Sujinno ต้าโหลว อีโหลว อี ห้าว โซ่วอิ๋นถาย', context:'Directing to cashier 1', contextTh:'บอกทางไปแคชเชียร์ 1 อาคารสุจินโณ' },
      { id:'d8', en:'Please contact cashier number 2 on the first floor of Chalerm Phra Baramee Building.', th:'กรุณาติดต่อแคชเชียร์หมายเลข 2 ชั้น 1 อาคารเฉลิมพระบารมีค่ะ', zh:'请联系 Chalerm Phra Baramee 大楼一楼2号收银台。', phonetic_en:'พลีส คอนแทค แคชเชียร์ นัมเบอร์ ทู ออน เดอะ เฟิร์สต์ ฟลอร์ ออฟ เฉลิมพระบารมี บิลดิ้ง', phonetic_zh:'ฉิ่ง เหลียนซี่ Chalerm Phra Baramee ต้าโหลว อีโหลว เอ้อร์ ห้าว โซ่วอิ๋นถาย', context:'Directing to cashier 2', contextTh:'บอกทางไปแคชเชียร์ 2 อาคารเฉลิมพระบารมี' },
      { id:'d9', en:'Please contact cashier number 3 on the first floor of Sriphat Building.', th:'กรุณาติดต่อแคชเชียร์หมายเลข 3 ชั้น 1 อาคารศรีพัฒน์ค่ะ', zh:'请联系 Sriphat 大楼一楼3号收银台。', phonetic_en:'พลีส คอนแทค แคชเชียร์ นัมเบอร์ ทรี ออน เดอะ เฟิร์สต์ ฟลอร์ ออฟ ศรีพัฒน์ บิลดิ้ง', phonetic_zh:'ฉิ่ง เหลียนซี่ Sriphat ต้าโหลว อีโหลว ซาน ห้าว โซ่วอิ๋นถาย', context:'Directing to cashier 3', contextTh:'บอกทางไปแคชเชียร์ 3 อาคารศรีพัฒน์' },
      { id:'d10', en:'Please contact the ECG room, number 110, on the first floor of Boonsom Martin Building.', th:'กรุณาติดต่อตรวจคลื่นไฟฟ้าหัวใจที่ห้องหมายเลข 110 ชั้น 1 อาคารบุญสม มาร์ตินค่ะ', zh:'请到 Boonsom Martin 大楼一楼110号房进行心电图检查。', phonetic_en:'พลีส คอนแทค เดอะ อีซีจี รูม นัมเบอร์ วัน เทน ออน เดอะ เฟิร์สต์ ฟลอร์ ออฟ บุญสม มาร์ติน บิลดิ้ง', phonetic_zh:'ฉิ่ง ต้าว Boonsom Martin ต้าโหลว อีโหลว อีอีหลิง ห้าว ฝาง จิ้นสิง ซินเตี้ยนถู เจี่ยนฉา', context:'Directing to ECG room', contextTh:'บอกทางไปตรวจคลื่นไฟฟ้าหัวใจ' },
      { id:'d11', en:'Please get your radiology appointment form at the Radiology Department on the second floor of Sriphat Building.', th:'กรุณารับใบนัดตรวจทางรังสีที่ห้องรังสี ชั้น 2 อาคารศรีพัฒน์ค่ะ', zh:'请到诗帕大楼二楼放射科领取您的检查预约单。', phonetic_en:'พลีส เก็ต ยัวร์ เรดิโอโลจี อะพอยต์เมนต์ ฟอร์ม แอท เดอะ เรดิโอโลจี ดีพาร์ตเมนต์ ออน เดอะ เซคเคินด์ ฟลอร์ ออฟ ศรีพัฒน์ บิลดิ้ง', phonetic_zh:'ฉิ่ง เต้า ชือพ่า ต้าโหลว เอ้อร์ โหลว ฟั่งเซ่อเคอ หลิ่งชวี่ หนิน เตอะ เจี่ยนฉา ยวี่เยว ตาน', context:'Directing to Radiology department', contextTh:'บอกทางไปรับใบนัดตรวจทางรังสี' },
      { id:'d12', en:'The pharmacy number 16 is on the first floor of Sriphat Building.', th:'ห้องยาหมายเลข 16 อยู่ที่ชั้น 1 อาคารศรีพัฒน์ค่ะ', zh:'16号药房在 Sriphat 大楼一楼。', phonetic_en:'เดอะ ฟาร์มาซี นัมเบอร์ ซิกซ์ทีน อิซ ออน เดอะ เฟิร์สต์ ฟลอร์ ออฟ ศรีพัฒน์ บิลดิ้ง', phonetic_zh:'สือลิ่ว ห้าว เย่าฝาง จ้าย Sriphat ต้าโหลว อีโหลว', context:'Directing to pharmacy 16', contextTh:'บอกทางไปห้องยา 16 อาคารศรีพัฒน์' },
      { id:'d13', en:'The pediatrics pharmacy is on the sixth floor of Sriphat Building.', th:'ห้องยากุมารเวชศาสตร์อยู่ที่ชั้น 6 อาคารศรีพัฒน์ค่ะ', zh:'儿科药房在 Sriphat 大楼六楼。', phonetic_en:'เดอะ พีเดียทริกส์ ฟาร์มาซี อิซ ออน เดอะ ซิกซ์ท ฟลอร์ ออฟ ศรีพัฒน์ บิลดิ้ง', phonetic_zh:'เอ๋อร์เคอ เย่าฝาง จ้าย Sriphat ต้าโหลว ลิ่วโหลว', context:'Directing to pediatrics pharmacy', contextTh:'บอกทางไปห้องยากุมารเวชศาสตร์' }
    ]
  },
  {
    id: 'care', labelEn: 'During Care', labelTh: 'ระหว่างดูแล', icon: '🩺',
    phrases: [
      { id:'c1', en:'Please lie down.', th:'กรุณานอนลงด้วยค่ะ', zh:'请躺下。', phonetic_en:'พลีส ไลย์ ดาวน์', phonetic_zh:'ฉิ่ง ถ่าง เซี่ย', context:'Asking patient to lie down', contextTh:'ขอให้ผู้ป่วยนอนลง' },
      { id:'c2', en:'Please sit still.', th:'กรุณานั่งนิ่งๆ ด้วยค่ะ', zh:'请坐好，不要动。', phonetic_en:'พลีส ซิท สทิล', phonetic_zh:'ฉิ่ง จั้ว ห่าว ปู๋เย่า ต้ง', context:'Asking patient to sit still', contextTh:'ขอให้ผู้ป่วยนั่งนิ่งๆ' },
      { id:'c3', en:'Please roll up your sleeve.', th:'กรุณาพับแขนเสื้อขึ้นด้วยค่ะ', zh:'请卷起袖子。', phonetic_en:'พลีส โรล อัพ ยอร์ สลีฟ', phonetic_zh:'ฉิ่ง จ่วน ฉี่ ซิ่วจึ', context:'Before blood pressure or injection', contextTh:'ขอให้พับแขนเสื้อ' },
      { id:'c4', en:'Please take a deep breath.', th:'กรุณาหายใจลึกๆ ค่ะ', zh:'请深呼吸。', phonetic_en:'พลีส เทค อะ ดีพ เบรธ', phonetic_zh:'ฉิ่ง เซิน ฮูซี', context:'During lung exam', contextTh:'ขอให้หายใจลึกๆ' },
      { id:'c5', en:'Please do not move.', th:'กรุณาอย่าขยับนะคะ', zh:'请不要动。', phonetic_en:'พลีส ดู นอท มูฟ', phonetic_zh:'ฉิ่ง ปู๋เย่า ต้ง', context:'During procedure', contextTh:'ขอให้ไม่ขยับ' },
      { id:'c6', en:'I am going to check your blood pressure.', th:'ฉันกำลังจะวัดความดันโลหิตของคุณค่ะ', zh:'我要为您量血压。', phonetic_en:'ไอ แอม โกอิ้ง ทู เช็ก ยอร์ บลัด เพรชเชอร์', phonetic_zh:'หว่อ เย่า เว่ย หนิน เหลียง เสวี่ยยา', context:'Before BP check', contextTh:'บอกว่าจะวัดความดัน' },
      { id:'c7', en:'This may feel a little uncomfortable.', th:'อาจจะรู้สึกไม่สบายนิดหน่อยนะคะ', zh:'这可能会有点不舒服。', phonetic_en:'ดิส เมย์ ฟีล อะ ลิทเทิล อันคัมฟอร์ทาเบิล', phonetic_zh:'เจ้อ เข่อเหนิง ฮุ่ย โหย่ว เตี่ยน ปู้ ซูฝู', context:'Warning before procedure', contextTh:'บอกว่าอาจไม่สบายตัวนิดหน่อย' },
      { id:'c8', en:'Tell me if you feel dizzy.', th:'ถ้าคุณรู้สึกเวียนหัว บอกฉันได้เลยนะคะ', zh:'如果您感到头晕，请告诉我。', phonetic_en:'เทล มี อิฟ ยู ฟีล ดิซซี่', phonetic_zh:'หรูกั่ว หนิน กั่นเต้า โถวยุน ฉิ่ง เก้าซู่ หว่อ', context:'Checking for dizziness', contextTh:'บอกให้แจ้งถ้าเวียนหัว' },
      { id:'c9', en:'Please wait for the test results.', th:'กรุณารอผลการตรวจสักครู่นะคะ', zh:'请等待检查结果。', phonetic_en:'พลีส เวท ฟอร์ เดอะ เทสท์ รีซัลทส์', phonetic_zh:'ฉิ่ง เติ่งไต้ เจี่ยนฉา เจี๋ยกั่ว', context:'Waiting for results', contextTh:'ขอให้รอผลตรวจ' },
      { id:'c10', en:'If you feel worse, please return immediately.', th:'หากคุณรู้สึกแย่ลง กรุณากลับมาพบแพทย์ทันทีนะคะ', zh:'如果您感觉情况恶化，请立即回来就诊。', phonetic_en:'อิฟ ยู ฟีล เวิร์ส พลีส รีเทิร์น อิมมีเดียทลี', phonetic_zh:'หรูกั่ว หนิน กั่นเจวี๋ย ฉิงควง เอ้อฮว่า ฉิ่ง ลี่จี๋ หุยไหล จิ้วเจิ่น', context:'Follow-up instruction', contextTh:'บอกให้กลับมาถ้าอาการแย่ลง' },
      { id:'c11', en:'Do you have any questions?', th:'คุณมีคำถามอะไรไหมคะ?', zh:'您有什么问题吗？', phonetic_en:'ดู ยู แฮฟ เอนี เควสชันส์', phonetic_zh:'หนิน โหย่ว เสินเมอะ เวริ่นถี มะ', context:'Closing encounter', contextTh:'ถามว่ามีคำถามไหม' }
    ]
  }
];

const DEFAULT_CHINESE_PHONETICS = Object.freeze(Object.fromEntries(
  defaultScenarios.flatMap(s => s.phrases.map(p => [p.id, p.phonetic_zh]))
));
const PREBUILT_MY_AUDIO_BY_TEXT = Object.freeze(Object.fromEntries(
  defaultScenarios.flatMap(s => s.phrases.flatMap(p => {
    const text=window.HEAL_AUDITED_TRANSLATIONS?.[p.id]?.my || p.my;
    return text ? [[text, `assets/audio/my/${p.id}.wav`]] : [];
  }))
));

/* ── Quiz rounds per scenario (6 questions each) ────────────── */
const quizRounds = {
  greeting: [
    {
      aiMsg: { en: "Hello! Excuse me, I just arrived and I don't feel well at all. Can someone help me please?", th: "สวัสดีค่ะ ขอโทษนะคะ เพิ่งมาถึงและรู้สึกไม่สบายมากเลย มีใครช่วยได้ไหมคะ?" },
      options: [
        { text: "Hello, welcome to our hospital! How can I help you today?", correct: true },
        { text: "Please lie down on the examination bed.", correct: false, hint: "ผู้ป่วยเพิ่งเดินมาถึง ยังไม่ถึงเวลาตรวจ ควรทักทายและถามความต้องการก่อนเสมอ" },
        { text: "The pharmacy is on the 1st floor.", correct: false, hint: "ยังไม่รู้ว่าผู้ป่วยต้องการอะไร ควรต้อนรับและถามก่อน ไม่ใช่บอกทางเลย" },
        { text: "Do you have any allergies?", correct: false, hint: "คำถามเรื่องแพ้ยาเหมาะกับขั้นตอนลงทะเบียน ไม่ใช่ตอนแรกพบ" }
      ]
    },
    {
      aiMsg: { en: "Thank you so much! I've been feeling very weak and dizzy since this morning. I think I might have a fever too.", th: "ขอบคุณมากเลยค่ะ รู้สึกอ่อนเพลียและเวียนหัวมาตั้งแต่เช้า คิดว่าอาจมีไข้ด้วยค่ะ" },
      options: [
        { text: "I'm sorry to hear that. Are you here for a check-up? Please follow me to register.", correct: true },
        { text: "Please take a deep breath.", correct: false, hint: "ยังไม่ถึงขั้นตอนตรวจร่างกาย ควรนำผู้ป่วยไปลงทะเบียนก่อน" },
        { text: "What is your phone number?", correct: false, hint: "การเก็บข้อมูลติดต่อเป็นขั้นตอนลงทะเบียน ตอนนี้ควรถามถึงอาการและแนะนำขั้นตอนต่อไป" },
        { text: "Please wait for the test results.", correct: false, hint: "ยังไม่มีการตรวจใดๆ เกิดขึ้น ควรนำผู้ป่วยไปลงทะเบียนก่อน" }
      ]
    },
    {
      aiMsg: { en: "Yes, I think I need to see a doctor. Can I register now? I'm not sure what to do.", th: "ใช่ค่ะ คิดว่าต้องพบแพทย์ค่ะ ขอลงทะเบียนได้เลยไหมคะ ไม่แน่ใจว่าต้องทำอะไร" },
      options: [
        { text: "Of course! Please wait here for a moment. I'll help you with registration right away.", correct: true },
        { text: "Take this medicine twice a day after meals.", correct: false, hint: "ยังไม่ได้รับการตรวจหรือวินิจฉัย ไม่ควรสั่งยาก่อนพบแพทย์" },
        { text: "Please roll up your sleeve.", correct: false, hint: "ยังไม่ถึงขั้นตอนตรวจร่างกาย ควรช่วยผู้ป่วยลงทะเบียนก่อน" },
        { text: "Good morning! How are you feeling today?", correct: false, hint: "ทักทายแล้วในตอนต้น ตอนนี้ควรดำเนินการขั้นตอนต่อไป คือพาไปลงทะเบียน" }
      ]
    },
    {
      aiMsg: { en: "I received a message from my doctor to come in today.", th: "ฉันได้รับข้อความจากคุณหมอให้เข้ามาวันนี้ค่ะ" },
      options: [
        { text: "Are you here for a check-up?", correct: true },
        { text: "Please wait for the test results.", correct: false, hint: "ยังไม่ได้รับการตรวจเลย ควรถามวัตถุประสงค์ของการมาก่อน" },
        { text: "Sorry for the delay.", correct: false, hint: "ผู้ป่วยเพิ่งมาถึง ยังไม่ได้รอนาน" },
        { text: "Please follow me.", correct: false, hint: "ควรยืนยันวัตถุประสงค์หรือนัดหมายก่อนพานำทางไป" }
      ]
    },
    {
      aiMsg: { en: "Yes, just a regular check-up.", th: "ใช่ค่ะ มาตรวจสุขภาพทั่วไปค่ะ" },
      options: [
        { text: "Have you checked your blood pressure, weight and height?", correct: true },
        { text: "Please roll up your sleeve.", correct: false, hint: "ควรถามถึงขั้นตอนพื้นฐาน(ชั่งน้ำหนัก วัดความดัน) ก่อนที่จะเริ่มตรวจ" },
        { text: "Good morning! How are you feeling today?", correct: false, hint: "ทักทายไปแล้ว ควรดำเนินการตามขั้นตอนตรวจสุขภาพ" },
        { text: "Are you currently taking any medication?", correct: false, hint: "การซักประวัติยาจะอยู่ในขั้นตอนลงทะเบียนหลัก ตอนนี้ควรให้คัดกรองเบื้องต้นก่อน" }
      ]
    },
    {
      aiMsg: { en: "I have done that at the front station already. What should I do next?", th: "ทำมาจากจุดด้านหน้าเรียบร้อยแล้วค่ะ ต้องทำอะไรต่อคะ?" },
      options: [
        { text: "Please wait here for a moment. The nurse will call you soon.", correct: true },
        { text: "How severe is the pain?", correct: false, hint: "ผู้ป่วยมาตรวจสุขภาพทั่วไป ไม่ได้แจ้งว่ามีอาการปวด" },
        { text: "Tell me if you feel dizzy.", correct: false, hint: "ไม่ได้ทำหัตถการใดๆ จึงไม่ต้องเตือนเรื่องเวียนหัว" },
        { text: "Hello, welcome to our hospital.", correct: false, hint: "อยู่ในขั้นตอนรอตรวจแล้ว ไม่ต้องกล่าวต้อนรับซ้ำ" }
      ]
    }
  ],

  registration: [
    {
      aiMsg: { en: "Hello, I need to register. I've been having chest tightness and difficulty breathing since this afternoon.", th: "สวัสดีครับ ผมต้องการลงทะเบียนครับ มีอาการแน่นหน้าอกและหายใจลำบากมาตั้งแต่บ่ายๆ ครับ" },
      options: [
        { text: "May I have your full name, please?", correct: true },
        { text: "Please lie down on the bed.", correct: false, hint: "ขั้นตอนแรกของการลงทะเบียนคือการเก็บข้อมูลส่วนตัวผู้ป่วยก่อน" },
        { text: "The pharmacy is on the 1st floor.", correct: false, hint: "ผู้ป่วยยังไม่ได้รับการตรวจและได้รับยา ควรเริ่มกระบวนการลงทะเบียนก่อน" },
        { text: "Please follow me to the X-ray room.", correct: false, hint: "ยังไม่ได้ลงทะเบียน ควรเก็บข้อมูลผู้ป่วยก่อนส่งไปตรวจใดๆ" }
      ]
    },
    {
      aiMsg: { en: "My name is James Wilson. W-I-L-S-O-N. I don't have an appointment today, I came in suddenly.", zh: "我叫王伟。今天没有预约，是突然不舒服才来的。", thZh: "ผมชื่อหวังเหว่ยครับ วันนี้ไม่มีนัดครับ มาเพราะรู้สึกไม่สบายกะทันหันครับ", th: "ผมชื่อ เจมส์ วิลสัน ครับ W-I-L-S-O-N ครับ ไม่มีนัดล่วงหน้าครับ มาเองเพราะอยู่ๆ ก็รู้สึกไม่สบาย" },
      options: [
        { text: "Can I see your passport or ID card, please?", correct: true },
        { text: "Please take a deep breath in and hold.", correct: false, hint: "ยังอยู่ในขั้นตอนเก็บข้อมูล ยังไม่ถึงเวลาตรวจร่างกาย" },
        { text: "Please follow the signs to the laboratory.", correct: false, hint: "ยังไม่ได้ยืนยันตัวตนผู้ป่วย ควรขอเอกสารยืนยันตัวตนก่อน" },
        { text: "Please sit still.", correct: false, hint: "ยังอยู่ในขั้นตอนเก็บข้อมูล ควรขอหนังสือเดินทางหรือบัตรประจำตัวก่อน" }
      ]
    },
    {
      aiMsg: { en: "Here is my passport. Number AB123456. I'm also on blood pressure medication called Lisinopril, 10mg daily.", th: "นี่คือหนังสือเดินทางครับ หมายเลข AB123456 ครับ แล้วก็ทานยาความดัน Lisinopril 10mg ต่อวันด้วยครับ" },
      options: [
        { text: "Thank you. Do you have any allergies to medication?", correct: true },
        { text: "Please do not move during the scan.", correct: false, hint: "ยังไม่ถึงขั้นตอนสแกน ควรสอบถามประวัติการแพ้ยาให้ครบก่อน" },
        { text: "Please go straight ahead and turn left.", correct: false, hint: "ยังอยู่ที่เคาน์เตอร์ลงทะเบียน ควรสอบถามประวัติการแพ้ยาให้ครบก่อน" },
        { text: "Good morning! Welcome to our hospital.", correct: false, hint: "ทักทายแล้วในตอนต้น ตอนนี้ควรสอบถามประวัติการแพ้ยาเพื่อความปลอดภัย" }
      ]
    },
    {
      aiMsg: { en: "No allergies. But I have been feeling very hot since last night.", th: "ไม่แพ้ยาครับ แต่รู้สึกตัวร้อนมากตั้งแต่เมื่อคืน" },
      options: [
        { text: "Do you have a fever?", correct: true },
        { text: "Please sign here.", correct: false, hint: "ผู้ป่วยกำลังบอกอาการ ควรซักถามอาการต่อ ไม่ใช่ตัดบทให้เซ็นชื่อ" },
        { text: "What is your phone number?", correct: false, hint: "ตอนนี้ควรโฟกัสที่อาการที่ผู้ป่วยเพิ่งแจ้งมาก่อน" },
        { text: "Please sit still.", correct: false, hint: "กำลังซักประวัติ ไม่ได้ทำหัตถการ" }
      ]
    },
    {
      aiMsg: { en: "Yes, I measured it at home and it was 38.5 degrees. It also hurts when I swallow.", th: "ใช่ครับ วัดที่บ้านได้ 38.5 องศา แล้วก็เจ็บเวลาคอเวลากลืนด้วยครับ" },
      options: [
        { text: "How severe is the pain? On a scale of 1 to 10.", correct: true },
        { text: "Where does it hurt?", correct: false, hint: "ผู้ป่วยบอกตำแหน่งแล้ว (เจ็บคอ) ควรถามระดับความปวด" },
        { text: "The screen will show your queue number.", correct: false, hint: "ยังซักประวัติไม่เสร็จ" },
        { text: "Could you repeat that, please?", correct: false, hint: "ประโยคนี้ใช้เมื่อฟังไม่ทัน แต่ผู้ป่วยแจ้งอาการชัดเจนแล้ว" }
      ]
    },
    {
      aiMsg: { en: "About a 6, I think. That's all my symptoms.", th: "ประมาณระดับ 6 ครับ อาการมีเท่านี้ครับ" },
      options: [
        { text: "Please take a seat. The nurse will call you soon.", correct: true },
        { text: "Please fill in this form.", correct: false, hint: "ซักประวัติเสร็จแล้ว ไม่ต้องกรอกแบบฟอร์มอีก" },
        { text: "When did the symptoms start?", correct: false, hint: "ผู้ป่วยบอกไปแล้วในตอนต้น (ตั้งแต่บ่ายๆ / เมื่อคืน)" },
        { text: "We need to check your vital signs first.", correct: false, hint: "ขั้นตอนต่อไปคือการรอเรียกคิวตรวจ" }
      ]
    }
  ],

  direction: [
    {
      aiMsg: { en: "Excuse me! I'm completely lost. I need to register first. Where should I go?", th: "ขอโทษนะคะ! หลงทางเลยค่ะ ต้องการลงทะเบียนก่อนค่ะ ต้องไปที่ไหนคะ?" },
      options: [
        { text: "Please register at the Medical Records Room, number 19, 1st floor, Chalerm Phra Baramee Building.", correct: true },
        { text: "Please lie down on the examination bed.", correct: false, hint: "ผู้ป่วยถามทางไปลงทะเบียน ไม่ใช่ขั้นตอนตรวจร่างกาย" },
        { text: "I am going to check your blood pressure now.", correct: false, hint: "ผู้ป่วยแค่ต้องการทราบว่าห้องลงทะเบียนอยู่ที่ไหน ควรบอกทางก่อน" },
        { text: "Do you have an appointment today?", correct: false, hint: "ผู้ป่วยถามทางอย่างชัดเจน ควรบอกทางไปลงทะเบียนทันที" }
      ]
    },
    {
      aiMsg: { en: "Room 19 on the first floor! Got it, thank you! After registration the doctor ordered blood tests. Where is the lab?", th: "ห้อง 19 ชั้น 1 ค่ะ เข้าใจแล้วค่ะ ขอบคุณค่ะ! หลังจากลงทะเบียนแล้วคุณหมอสั่งตรวจเลือดด้วย ห้องแล็บอยู่ที่ไหนคะ?" },
      options: [
        { text: "The laboratory, room number 11, is on the first floor of Chalerm Phra Baramee Building.", correct: true },
        { text: "Please fill in this form first.", correct: false, hint: "ผู้ป่วยลงทะเบียนแล้ว กำลังถามทางไปแล็บ ควรบอกตำแหน่งห้องแล็บ" },
        { text: "Please do not move.", correct: false, hint: "ผู้ป่วยถามทาง ไม่ใช่กำลังทำหัตถการ ควรบอกตำแหน่งห้องแล็บ" },
        { text: "Sorry for the delay.", correct: false, hint: "ไม่มีการรอนาน ผู้ป่วยถามทางไปแล็บ ควรบอกตำแหน่งห้องแล็บทันที" }
      ]
    },
    {
      aiMsg: { en: "Room 11! Perfect! After the blood test, I need to pick up medicine. Where is the pharmacy?", th: "ห้อง 11 ค่ะ! เยี่ยมเลยค่ะ! หลังเจาะเลือดแล้ว ต้องไปรับยาด้วยค่ะ ห้องยาอยู่ที่ไหนคะ?" },
      options: [
        { text: "The pharmacy, number 30, is on the 1st floor. Please follow the signs.", correct: true },
        { text: "Please wait for the test results first.", correct: false, hint: "ผู้ป่วยถามทางไปห้องยา ซึ่งเป็นขั้นตอนถัดไปที่ถูกต้อง ควรบอกตำแหน่ง" },
        { text: "Please sit still.", correct: false, hint: "ผู้ป่วยถามทางอย่างชัดเจน ควรบอกตำแหน่งห้องยาและแนะนำให้เดินตามป้าย" },
        { text: "Good morning! How are you feeling today?", correct: false, hint: "ทักทายไปแล้ว ตอนนี้ควรบอกทางไปห้องยาตามที่ผู้ป่วยถาม" }
      ]
    },
    {
      aiMsg: { en: "Oh, I also need to ask about my insurance coverage and pay some fees.", th: "อ้อ ฉันต้องสอบถามเรื่องประกันและจ่ายค่าธรรมเนียมด้วยค่ะ" },
      options: [
        { text: "Please contact customer service centre, 1st floor, Chalerm Phra Baramee Building.", correct: true },
        { text: "X-ray is at room number 33.", correct: false, hint: "ผู้ป่วยถามหาจุดบริการลูกค้า/การเงิน ไม่ใช่ห้องเอกซ์เรย์" },
        { text: "Please follow me.", correct: false, hint: "ในสถานการณ์นี้ควรบอกทางให้ผู้ป่วยเดินไปเองตามป้ายบอกทาง" },
        { text: "Do you have an appointment today?", correct: false, hint: "ผู้ป่วยตรวจเสร็จแล้ว แค่ต้องการติดต่อธุระเรื่องเงิน/ประกัน" }
      ]
    },
    {
      aiMsg: { en: "Thank you. And my doctor said I need a chest X-ray too. Is it in this building?", th: "ขอบคุณค่ะ แล้วคุณหมอบอกว่าต้องเอกซ์เรย์ปอดด้วย อยู่ในตึกนี้ไหมคะ?" },
      options: [
        { text: "X-ray is at room number 33 on the first floor of Boonsom Martin Building.", correct: true },
        { text: "The pharmacy number 30 is on the first floor.", correct: false, hint: "ผู้ป่วยถามหาห้องเอกซ์เรย์ ไม่ใช่ห้องยา" },
        { text: "Please lie down.", correct: false, hint: "ยังไม่ได้อยู่ที่ห้องตรวจ" },
        { text: "Please register at the Medical Records Room.", correct: false, hint: "ผู้ป่วยมีประวัติและพบแพทย์แล้ว" }
      ]
    },
    {
      aiMsg: { en: "Boonsom Martin Building... I'm not sure how to get there.", th: "อาคารบุญสม มาร์ติน... ไม่แน่ใจว่าต้องเดินไปทางไหนค่ะ" },
      options: [
        { text: "Please follow the signs.", correct: true },
        { text: "Please sit still.", correct: false, hint: "ผู้ป่วยกำลังจะเดินไปแผนกอื่น" },
        { text: "The laboratory room number 11 is on the first floor.", correct: false, hint: "ไม่ได้ถามหาห้องแล็บ" },
        { text: "Sorry for the delay.", correct: false, hint: "ไม่ได้มีเหตุการณ์ให้รอคอย" }
      ]
    }
  ],

  care: [
    {
      aiMsg: { en: "Hello, I'm a bit nervous. The doctor said I need some tests done. What do I need to do first?", th: "สวัสดีค่ะ หนูกลัวนิดหน่อยค่ะ คุณหมอบอกว่าต้องทำการตรวจบางอย่าง ต้องทำอะไรก่อนคะ?" },
      options: [
        { text: "Please lie down on the bed. I'll check your blood pressure first.", correct: true },
        { text: "Please register at room 19 on the 1st floor.", correct: false, hint: "ผู้ป่วยผ่านการลงทะเบียนแล้วและพร้อมรับการดูแล ควรเริ่มขั้นตอนตรวจสัญญาณชีพ" },
        { text: "The pharmacy is on the 1st floor.", correct: false, hint: "ยังไม่ถึงขั้นตอนรับยา ควรเริ่มการตรวจร่างกายก่อน" },
        { text: "Do you have an appointment today?", correct: false, hint: "ผู้ป่วยลงทะเบียนและพบแพทย์แล้ว ตอนนี้ควรเริ่มขั้นตอนดูแลที่แพทย์สั่ง" }
      ]
    },
    {
      aiMsg: { en: "Okay, I'm lying down. What's next? Should I do anything special?", th: "โอเคค่ะ นอนลงแล้วค่ะ ขั้นตอนต่อไปคืออะไรคะ? ต้องทำอะไรเป็นพิเศษไหมคะ?" },
      options: [
        { text: "Please roll up your sleeve. I am going to check your blood pressure.", correct: true },
        { text: "Please go straight and turn left to the X-ray room.", correct: false, hint: "ผู้ป่วยนอนรอการตรวจอยู่แล้ว ไม่ใช่เวลาส่งไปห้อง X-ray ควรตรวจสัญญาณชีพก่อน" },
        { text: "May I have your full name, please?", correct: false, hint: "ได้เก็บข้อมูลผู้ป่วยแล้วในขั้นตอนลงทะเบียน ตอนนี้ควรดำเนินการตรวจ" },
        { text: "Please fill in this form.", correct: false, hint: "ผ่านขั้นตอนกรอกฟอร์มแล้ว ตอนนี้ผู้ป่วยนอนรอการตรวจ ควรสั่งให้พับแขนเสื้อ" }
      ]
    },
    {
      aiMsg: { en: "I feel a little dizzy after the blood test. And my arm feels a bit sore.", th: "รู้สึกเวียนหัวนิดหน่อยหลังเจาะเลือดค่ะ แล้วแขนก็เจ็บนิดหน่อยด้วยค่ะ" },
      options: [
        { text: "Tell me if you feel more dizzy. Please sit still and wait for a moment.", correct: true },
        { text: "Please follow the signs to the pharmacy on the 1st floor.", correct: false, hint: "ผู้ป่วยกำลังรู้สึกเวียนหัว ควรดูแลอาการก่อนส่งไปรับยา" },
        { text: "Hello, welcome to our hospital!", correct: false, hint: "ทักทายผู้ป่วยแล้ว ตอนนี้ผู้ป่วยมีอาการ ควรดูแลและสังเกตอาการเวียนหัว" },
        { text: "Please fill in this registration form.", correct: false, hint: "ผู้ป่วยลงทะเบียนแล้วและกำลังมีอาการ ควรประเมินและดูแลอาการก่อน" }
      ]
    },
    {
      aiMsg: { en: "Okay, I'm waiting. The doctor is going to examine my chest now, right?", th: "โอเคค่ะ รออยู่ค่ะ คุณหมอกำลังจะตรวจหน้าอกฉันใช่ไหมคะ?" },
      options: [
        { text: "Please take a deep breath.", correct: true },
        { text: "Please roll up your sleeve.", correct: false, hint: "ตรวจหน้าอกและปอด ต้องให้หายใจลึกๆ ไม่ใช่พับแขนเสื้อ" },
        { text: "I am going to check your blood pressure.", correct: false, hint: "วัดความดันไปแล้ว ตอนนี้หมอกำลังจะตรวจหน้าอก" },
        { text: "Tell me if you feel dizzy.", correct: false, hint: "ยังไม่ได้เริ่มตรวจ" }
      ]
    },
    {
      aiMsg: { en: "Like this? *inhales heavily* Is there anything else I need to do during the ultrasound?", th: "แบบนี้ใช่ไหมคะ? *สูดลมหายใจ* มีอะไรที่ต้องทำอีกไหมคะระหว่างอัลตราซาวนด์?" },
      options: [
        { text: "Please do not move.", correct: true },
        { text: "Please sit still.", correct: false, hint: "ผู้ป่วยนอนอยู่แล้ว จึงสั่งให้ห้ามขยับตัว ไม่ใช่ให้นั่งนิ่งๆ" },
        { text: "If you feel worse, please return immediately.", correct: false, hint: "นี่คือคำแนะนำตอนจะกลับบ้าน ไม่ใช่ระหว่างทำหัตถการ" },
        { text: "Do you have any questions?", correct: false, hint: "กำลังทำหัตถการ ไม่ใช่ช่วงท้ายของการตรวจ" }
      ]
    },
    {
      aiMsg: { en: "The examination is done. Thank you. Will I get the results today?", th: "ตรวจเสร็จแล้ว ขอบคุณค่ะ จะได้ผลตรวจวันนี้เลยไหมคะ?" },
      options: [
        { text: "Please wait for the test results. Do you have any questions?", correct: true },
        { text: "Please lie down.", correct: false, hint: "ตรวจเสร็จแล้ว" },
        { text: "This may feel a little uncomfortable.", correct: false, hint: "การตรวจเสร็จสิ้นแล้ว" },
        { text: "I am going to check your blood pressure.", correct: false, hint: "ทำไปตั้งแต่เริ่มแล้ว" }
      ]
    },
    {
      aiMsg: { en: "I feel dizzy after the blood test. What should I do?", zh: "抽血后我感到头晕。我该怎么办？", th: "รู้สึกเวียนหัวหลังเจาะเลือดค่ะ ควรทำอย่างไรดีคะ?" },
      options: [
        { text: "Tell me if you feel dizzy.", correct: true },
        { text: "Please follow me to the pharmacy.", correct: false, hint: "ผู้ป่วยมีอาการเวียนหัว ควรประเมินและดูแลอาการก่อน ไม่ควรพาไปห้องยา" },
        { text: "Please fill in this form.", correct: false, hint: "ผู้ป่วยกำลังมีอาการ ควรดูแลความปลอดภัยก่อนกรอกเอกสาร" },
        { text: "The screen will show your queue number.", correct: false, hint: "ไม่ใช่คำตอบสำหรับอาการเวียนหัวหลังเจาะเลือด" }
      ]
    },
    {
      aiMsg: { en: "The examination is finished. Can I go home now?", zh: "检查结束了。我现在可以回家吗？", th: "ตรวจเสร็จแล้ว ตอนนี้กลับบ้านได้เลยไหมคะ?" },
      options: [
        { text: "Please wait for the test results. Do you have any questions?", correct: true },
        { text: "Please roll up your sleeve.", correct: false, hint: "การตรวจเสร็จแล้ว ไม่ควรเริ่มขั้นตอนเดิมซ้ำ" },
        { text: "Please do not move.", correct: false, hint: "ไม่อยู่ระหว่างหัตถการแล้ว ควรแจ้งให้รอผลตรวจและสอบถามข้อสงสัย" },
        { text: "Please register at the Medical Records Room.", correct: false, hint: "ผู้ป่วยผ่านขั้นตอนลงทะเบียนแล้ว ควรแจ้งขั้นตอนหลังตรวจ" }
      ]
    },
    {
      aiMsg: { en: "Thank you. I understand the instructions.", zh: "谢谢。我明白这些说明了。", th: "ขอบคุณค่ะ เข้าใจคำแนะนำแล้วค่ะ" },
      options: [
        { text: "If you feel worse, please return immediately.", correct: true },
        { text: "What is your phone number?", correct: false, hint: "ควรปิดการสนทนาด้วยคำแนะนำด้านความปลอดภัย ไม่ใช่ถามข้อมูลซ้ำ" },
        { text: "Good morning! How are you feeling today?", correct: false, hint: "เป็นการทักทายซ้ำ ไม่ใช่คำแนะนำก่อนกลับบ้าน" },
        { text: "Please take a deep breath.", correct: false, hint: "ไม่มีขั้นตอนตรวจต่อแล้ว ควรให้คำแนะนำเมื่ออาการแย่ลง" }
      ]
    }
  ]
};

/* ── Role Play scenario meta ────────────────────────────────── */
const rolePlayMeta = {
  greeting:     { badge: '👋 การทักทาย · ต้อนรับผู้ป่วย',     hint: 'ฝึกทักทายและรับมือผู้ป่วยที่เพิ่งมาถึง ตอบให้ถูกสถานการณ์ ทักทายก่อน ถามอาการ แล้วนำไปลงทะเบียน' },
  registration: { badge: '📋 การลงทะเบียน · เก็บข้อมูลผู้ป่วย', hint: 'ฝึกถามข้อมูลส่วนตัวตามลำดับ ชื่อ → บัตร/หนังสือเดินทาง → ประวัติแพ้ยา → โรคประจำตัว' },
  direction:    { badge: '🗺️ การบอกทาง · นำผู้ป่วย',            hint: 'ฝึกบอกตำแหน่งห้องต่างๆ ระบุชั้นและหมายเลขห้องให้ชัดเจน บอกทางเป็นลำดับขั้นตอน' },
  care:         { badge: '🩺 ระหว่างดูแล · ให้คำสั่งผู้ป่วย',   hint: 'ฝึกออกคำสั่งตามขั้นตอน นอนลง → พับแขนเสื้อ → หายใจลึก → อย่าขยับ และดูแลอาการขณะตรวจ' }
};

/* ── State ───────────────────────────────────────────────────── */
let scenarios = [];
let activeScenarioId = 'greeting';
let chatScenarioId = 'greeting';
let practiceTarget = { text: '', lang: 'en' };
let selectedPracticeId = null;
let selectedPracticeLang = 'en';
let isRecording = false;
let isAddModalRecording = false;
let isMyanmarPhraseRecording = false;
let recRef = null;
let translateDebounce = null;
let modalAutoTimer = null;
let editingId = null;

let quizRoundIndex = 0;
let quizDisplayLang = 'en';
let quizScore = 0;
let quizAnswered = false;
let currentQuizOpts = [];

let speechRate = 0.75;
let currentGoogleAudio = null;
let interpreterPrimedAudio = null;
let speechNoticeTimer = null;
let currentRoom = '';
let roomChangeOnly = false;
let interpreterActive = false;
let interpreterBusy = false;
let interpreterSessionToken = 0;
let interpreterNextLang = 'th';
let interpreterRecognition = null;
let interpreterRestartTimer = null;
const myTranslationTasks = new Map();
const translationMemory = new Map();
const translationTasks = new Map();

/* ── Init ───────────────────────────────────────────────────── */
function init() {
  currentRoom = localStorage.getItem('heal_english_active_room_v1') || '';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      scenarios = parsed.scenarios || defaultScenarios;
      activeScenarioId = parsed.activeScenarioId || 'greeting';
      chatScenarioId = parsed.chatScenarioId || activeScenarioId;
    } catch (e) { scenarios = defaultScenarios; }
  } else {
    scenarios = JSON.parse(JSON.stringify(defaultScenarios));
  }

  if (hydratePhraseData()) save();

  renderScenarios();
  renderPhrases();
  renderPracticeCards();
  renderChatScenarioSelect();
  initQuiz();
  renderQuickPhrases();
  ensureAllMyanmarTranslations();
  openRoomGate(true);
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ scenarios, activeScenarioId, chatScenarioId }));
}

function hydratePhraseData() {
  const translations=window.HEAL_AUDITED_TRANSLATIONS || {};
  const hasCurated=Object.keys(translations).length>0;
  const refreshCurated=hasCurated && localStorage.getItem(MULTILINGUAL_MIGRATION_KEY)!=='1';
  const migrateChineseReadings=localStorage.getItem(CHINESE_THAI_PHONETIC_MIGRATION_KEY)!=='1';
  let changed=false;
  scenarios.forEach(s=>s.phrases.forEach(p=>{
    const curated=translations[p.id];
    if (refreshCurated && curated) {
      ['en','zh','phonetic_en','my'].forEach(field=>{
        if (curated[field] && p[field]!==curated[field]) { p[field]=curated[field]; changed=true; }
      });
    }
    if (!p.my && curated?.my) { p.my=curated.my; changed=true; }
    if (!p.phonetic_en && p.en) { p.phonetic_en=genPhonetics(p.en); changed=true; }
    if (p.zh && (migrateChineseReadings || !p.phonetic_zh)) {
      const thaiReading=DEFAULT_CHINESE_PHONETICS[p.id] || genPhoneticsZh(p.zh);
      if (p.phonetic_zh!==thaiReading) { p.phonetic_zh=thaiReading; changed=true; }
    }
  }));
  if (refreshCurated) localStorage.setItem(MULTILINGUAL_MIGRATION_KEY,'1');
  if (migrateChineseReadings) localStorage.setItem(CHINESE_THAI_PHONETIC_MIGRATION_KEY,'1');
  return changed;
}

function currentScenario() {
  return scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
}

/* ── Scenario Grid ──────────────────────────────────────────── */
function renderScenarios() {
  document.getElementById('scenarioGrid').innerHTML = scenarios.map(s => `
    <button class="btn-scenario ${s.id === activeScenarioId ? 'active' : ''}" onclick="selectScenario('${s.id}')">
      ${s.id === activeScenarioId ? '<div class="active-dot"></div>' : ''}
      <span class="s-icon">${s.icon}</span>
      <span class="s-en">${esc(s.labelEn)}</span>
      <span class="s-th">${esc(s.labelTh)}</span>
    </button>`).join('');
}

function selectScenario(id) {
  activeScenarioId = id;
  practiceTarget = { text: '', lang: 'en' };
  selectedPracticeId = null;
  renderScenarios();
  renderPhrases();
  renderPracticeCards();
  renderQuickPhrases();
  ensureMyanmarTranslations(activeScenarioId);
  save();
}

/* ── Phrases ────────────────────────────────────────────────── */
function renderPhrases() {
  const s = currentScenario();
  document.getElementById('phraseTitle').textContent = s.labelEn + ' Phrases';
  document.getElementById('phraseCount').textContent = `${s.phrases.length} ประโยค · ${s.labelTh}`;
  const list = document.getElementById('phraseList');
  if (!s.phrases.length) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📝</div>
      <div class="empty-text">ยังไม่มีประโยคในสถานการณ์นี้</div>
      <button class="btn-empty-add" onclick="openAddModal()"><i class="fas fa-plus"></i> เพิ่มประโยคแรก</button>
    </div>`;
    return;
  }
  list.innerHTML = s.phrases.map(p => `
    <div class="phrase-card" id="phrase-${p.id}">
      <div class="phrase-main">
        <div class="phrase-texts">
          <div class="phrase-row">
            <span class="badge-mini th">TH</span>
            <div class="phrase-col"><div class="phrase-th-text">${esc(p.th)}</div></div>
          </div>
          <div class="phrase-row">
            <span class="badge-mini en">EN</span>
            <div class="phrase-col">
              <div class="phrase-en-text">${esc(p.en)}</div>
              ${p.phonetic_en ? `<span class="phrase-phonetic">${esc(p.phonetic_en)}</span>` : ''}
            </div>
          </div>
          <div class="phrase-row">
            <span class="badge-mini zh">中</span>
            <div class="phrase-col">
              <div class="phrase-zh-text">${esc(p.zh)}</div>
              ${p.phonetic_zh ? `<span class="phrase-phonetic">${esc(p.phonetic_zh)}</span>` : ''}
            </div>
          </div>
          <div class="phrase-row">
            <span class="badge-mini my">MY</span>
            <div class="phrase-col"><div class="phrase-my-text">${p.my ? esc(p.my) : '<span class="my-pending">กำลังเตรียมคำแปลภาษาเมียนมาร์…</span>'}</div></div>
          </div>
        </div>
        <div class="phrase-actions">
          <button class="btn-icon blue" onclick="speakText('${ea(p.en)}','en')"><i class="fas fa-volume-up"></i></button>
          <button class="btn-icon yellow" onclick="speakText('${ea(p.zh)}','zh')">中</button>
          <button class="btn-icon purple" ${p.my ? '' : 'disabled'} title="ฟังภาษาเมียนมาร์" onclick="speakText('${ea(p.my || '')}','my')"><i class="fas fa-volume-up"></i></button>
          <button class="btn-icon green" onclick="openEditModal('${ea(p.id)}')"><i class="fas fa-pen"></i></button>
          <button class="btn-icon red" onclick="openDeleteModal('${ea(p.id)}')"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="card-speed-row">
        <span class="card-speed-label"><i class="fas fa-tachometer-alt"></i> ความเร็ว</span>
        <button class="card-speed-btn ${speechRate===0.6?'active':''}" data-speed="slow" onclick="setSpeechRate(0.6,'slow')">🐢 ช้ามาก</button>
        <button class="card-speed-btn ${speechRate===0.75?'active':''}" data-speed="normal" onclick="setSpeechRate(0.75,'normal')">🎵 ช้า</button>
        <button class="card-speed-btn ${speechRate===0.9?'active':''}" data-speed="fast" onclick="setSpeechRate(0.9,'fast')">⚡ ปกติ</button>
      </div>
      ${(p.context || p.contextTh) ? `
      <button class="phrase-context-toggle" onclick="toggleCtx('${p.id}')">
        <span><i class="fas fa-info-circle"></i> เมื่อไรใช้ประโยคนี้</span>
        <i class="fas fa-chevron-down" id="ctx-icon-${p.id}" style="transition:transform 0.2s"></i>
      </button>
      <div class="phrase-context-body" id="ctx-${p.id}">
        ${p.contextTh ? `<div class="ctx-line">🇹🇭 <strong>ไทย:</strong> ${esc(p.contextTh)}</div>` : ''}
        ${p.context ? `<div class="ctx-line">🇬🇧 <strong>EN:</strong> ${esc(p.context)}</div>` : ''}
      </div>` : ''}
      </div>`).join('');
  ensureMyanmarTranslations(activeScenarioId);
}

async function ensurePhraseMyanmar(phrase) {
  if (phrase.my) return phrase.my;
  const key = phrase.id;
  if (myTranslationTasks.has(key)) return myTranslationTasks.get(key);
  const task = gTranslate(phrase.th, 'th', 'my').then(text => {
    phrase.my = text;
    save();
    return text;
  }).finally(() => myTranslationTasks.delete(key));
  myTranslationTasks.set(key, task);
  return task;
}

async function ensureMyanmarTranslations(scenarioId) {
  const scenario = scenarios.find(s => s.id === scenarioId);
  if (!scenario) return;
  const pending = scenario.phrases.filter(p => p.th && !p.my);
  if (!pending.length) return;
  let index = 0;
  const workers = Array.from({length: Math.min(3, pending.length)}, async () => {
    while (index < pending.length) {
      const phrase = pending[index++];
      try { await ensurePhraseMyanmar(phrase); } catch (e) { /* keep manual editing available if translation is unavailable */ }
    }
  });
  await Promise.all(workers);
  if (activeScenarioId === scenarioId) { renderPhrases(); renderPracticeCards(); renderQuickPhrases(); }
}

async function ensureAllMyanmarTranslations() {
  const pending=scenarios.flatMap(s=>s.phrases.filter(p=>p.th && !p.my));
  if (!pending.length) return;
  let index=0;
  const workers=Array.from({length:Math.min(3,pending.length)},async()=>{
    while(index<pending.length) {
      const phrase=pending[index++];
      try { await ensurePhraseMyanmar(phrase); } catch(e) { /* retry when this phrase is next opened */ }
    }
  });
  await Promise.all(workers);
  renderPhrases(); renderPracticeCards(); renderQuickPhrases();
}

function toggleCtx(id) {
  const body = document.getElementById('ctx-' + id);
  const icon = document.getElementById('ctx-icon-' + id);
  if (!body) return;
  const open = body.classList.toggle('open');
  if (icon) icon.style.transform = open ? 'rotate(180deg)' : '';
}

/* ── Practice — Phrase Card Selector ───────────────────────── */
function renderPracticeCards() {
  const list = document.getElementById('practiceCardList');
  if (!list) return;
  let html = '';
  scenarios.forEach(s => {
    if (!s.phrases.length) return;
    html += `<div class="practice-group-header">${s.icon} ${esc(s.labelEn)} · ${esc(s.labelTh)}</div>`;
    s.phrases.forEach(p => {
      const enSel = selectedPracticeId === p.id && selectedPracticeLang === 'en';
      const zhSel = selectedPracticeId === p.id && selectedPracticeLang === 'zh';
      html += `
        <div class="practice-phrase-item ${enSel ? 'selected' : ''}" data-pid="${esc(p.id)}" data-lang="en">
          <div class="ppi-icon">${enSel ? '<i class="fas fa-check" style="color:#fff"></i>' : '<i class="fas fa-volume-up" style="color:var(--primary)"></i>'}</div>
          <div class="ppi-texts">
            <div class="ppi-th">${esc(p.th)}</div>
            <div class="ppi-en">${esc(p.en)}</div>
            ${p.phonetic_en ? `<div class="q-phonetic-en">${esc(p.phonetic_en)}</div>` : ''}
          </div>
          <span class="ppi-lang en">EN</span>
        </div>
        <div class="practice-phrase-item ${zhSel ? 'selected' : ''}" data-pid="${esc(p.id)}" data-lang="zh">
          <div class="ppi-icon">${zhSel ? '<i class="fas fa-check" style="color:#fff"></i>' : '<span style="font-size:12px;color:var(--primary)">中</span>'}</div>
          <div class="ppi-texts">
            <div class="ppi-th">${esc(p.th)}</div>
            <div class="ppi-en">${esc(p.zh)}</div>
            ${p.phonetic_zh ? `<div class="q-phonetic-zh">${esc(p.phonetic_zh)}</div>` : ''}
          </div>
          <span class="ppi-lang zh">中</span>
        </div>
        `;
    });
  });
  list.innerHTML = html || '<div style="padding:16px;color:var(--text-hint);font-size:13px;text-align:center">ยังไม่มีประโยค</div>';

  list.onclick = function(e) {
    const item = e.target.closest('.practice-phrase-item');
    if (!item) return;
    const pid = item.dataset.pid;
    const lang = item.dataset.lang;
    let foundPhrase = null;
    for (const s of scenarios) {
      foundPhrase = s.phrases.find(p => p.id === pid);
      if (foundPhrase) break;
    }
    if (!foundPhrase) return;
    const text = lang === 'en' ? foundPhrase.en : foundPhrase.zh;
    selectPracticeCard(lang, text, pid);
  };
}

function selectPracticeCard(lang, text, id) {
  selectedPracticeId = id;
  selectedPracticeLang = lang;
  practiceTarget = { text, lang };
  renderPracticeCards();

  let foundPhrase = null;
  for (const s of scenarios) {
    const p = s.phrases.find(p => p.id === id);
    if (p) { foundPhrase = p; break; }
  }

  const tb = document.getElementById('targetBox');
  tb.style.display = 'flex';
  document.getElementById('targetThaiMeaning').textContent = foundPhrase ? (foundPhrase.th || '') : '';
  document.getElementById('targetText').textContent = text;
  const pe = document.getElementById('targetPhonetic');
  const phoneticKey = ({en:'phonetic_en', zh:'phonetic_zh'})[lang];
  if (foundPhrase && foundPhrase[phoneticKey]) {
    pe.textContent = foundPhrase[phoneticKey]; pe.style.display = 'block';
  } else { pe.style.display = 'none'; }
  document.getElementById('scoreBox').style.display = 'none';
  document.getElementById('recResult').style.display = 'none';
  document.getElementById('recPlaceholder').style.display = '';

  speakText(text, lang);
}

/* ── Add / Edit Modal ─────────────────────────────────────── */
function openAddModal() {
  editingId = null;
  clearModalFields();
  document.getElementById('modalTitle').textContent = 'เพิ่มประโยคใหม่';
  document.getElementById('modalSub').textContent = 'พิมพ์ภาษาไทย · AI แปลให้อัตโนมัติทันที';
  document.getElementById('btnConfirmAdd').innerHTML = '<i class="fas fa-plus"></i> เพิ่มประโยค';
  document.getElementById('addModal').classList.add('open');
}

function openEditModal(id) {
  const s = currentScenario();
  const phrase = s.phrases.find(p => p.id === id);
  if (!phrase) return;
  editingId = id;
  clearModalFields();
  document.getElementById('modalTitle').textContent = 'แก้ไขประโยค';
  document.getElementById('modalSub').textContent = 'แก้ไขข้อมูลแล้วกดบันทึก';
  document.getElementById('btnConfirmAdd').innerHTML = '<i class="fas fa-save"></i> บันทึก';
  document.getElementById('f-th').value = phrase.th || '';
  document.getElementById('f-en').value = phrase.en || '';
  document.getElementById('f-phonetic-en').value = phrase.phonetic_en || '';
  document.getElementById('f-zh').value = phrase.zh || '';
  document.getElementById('f-phonetic-zh').value = phrase.phonetic_zh || '';
  document.getElementById('f-my').value = phrase.my || '';
  document.getElementById('f-ctx-th').value = phrase.contextTh || '';
  document.getElementById('f-ctx-en').value = phrase.context || '';
  document.getElementById('addModal').classList.add('open');
}

function clearModalFields() {
  ['f-th','f-en','f-phonetic-en','f-zh','f-phonetic-zh','f-my','f-ctx-th','f-ctx-en'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('error'); }
  });
  ['err-th','err-en','err-zh','err-my'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '';
  });
  const prev = document.getElementById('autoPreview');
  if (prev) prev.classList.remove('visible');
  if (modalAutoTimer) { clearTimeout(modalAutoTimer); modalAutoTimer = null; }
}

function closeAddModal() {
  document.getElementById('addModal').classList.remove('open');
  if (modalAutoTimer) { clearTimeout(modalAutoTimer); modalAutoTimer = null; }
}

function onModalThaiInput() {
  const th = document.getElementById('f-th').value.trim();
  if (modalAutoTimer) clearTimeout(modalAutoTimer);
  if (!th) { const p = document.getElementById('autoPreview'); if (p) p.classList.remove('visible'); return; }
  const prev = document.getElementById('autoPreview');
  if (prev) {
    prev.classList.add('visible');
    document.getElementById('autoPreviewContent').innerHTML =
      '<div class="auto-preview-loading"><div class="translate-spinner"></div> กำลังแปล...</div>';
  }
  modalAutoTimer = setTimeout(() => doAutoTranslate(th), 700);
}

async function doAutoTranslate(th) {
  try {
    const [en, zh, my] = await Promise.all([gTranslate(th,'th','en'), gTranslate(th,'th','zh-CN'), gTranslate(th,'th','my')]);
    
    // ใช้ฟังก์ชันเดาคำอ่านที่อัปเกรดแล้ว
    const phonEn = genPhonetics(en);
    const phonZh = genPhoneticsZh(zh);
    const ctx = analyzeCtx(th, en);
    
    const fEn = document.getElementById('f-en'), fZh = document.getElementById('f-zh'), fMy = document.getElementById('f-my');
    const fPhEn = document.getElementById('f-phonetic-en'), fPhZh = document.getElementById('f-phonetic-zh');
    const fCtxTh = document.getElementById('f-ctx-th'), fCtxEn = document.getElementById('f-ctx-en');
    
    if (fEn) fEn.value = en;
    if (fZh) fZh.value = zh;
    if (fMy) fMy.value = my;
    if (fPhEn) fPhEn.value = phonEn;
    if (fPhZh) fPhZh.value = phonZh;
    if (fCtxTh) fCtxTh.value = ctx.th;
    if (fCtxEn) fCtxEn.value = ctx.en;

    document.getElementById('autoPreviewContent').innerHTML = `
      <div class="auto-preview-row">
        <div class="auto-preview-label">🇹🇭 ไทย · ประโยคต้นฉบับ</div>
        <div class="auto-preview-text" onclick="speakText('${ea(th)}','th')" style="cursor:pointer">
          <i class="fas fa-volume-up" style="color:var(--primary);margin-right:4px"></i> ${esc(th)}
        </div>
      </div>
      <div class="auto-preview-row">
        <div class="auto-preview-label">🇬🇧 English</div>
        <div class="auto-preview-text" onclick="speakText('${ea(en)}','en')" style="cursor:pointer">
          <i class="fas fa-volume-up" style="color:var(--primary);margin-right:4px"></i> ${esc(en)}
        </div>
        ${phonEn ? `<span class="auto-preview-phonetic">${esc(phonEn)}</span>` : ''}
      </div>
      <div class="auto-preview-row">
        <div class="auto-preview-label">🇨🇳 中文</div>
        <div class="auto-preview-text" onclick="speakText('${ea(zh)}','zh')" style="cursor:pointer">
          <i class="fas fa-volume-up" style="color:var(--primary);margin-right:4px"></i> ${esc(zh)}
        </div>
        ${phonZh ? `<span class="auto-preview-phonetic">${esc(phonZh)}</span>` : ''}
      </div>
      <div class="auto-preview-row">
        <div class="auto-preview-label">🇲🇲 မြန်မာ · ภาษาเมียนมาร์</div>
        <div class="auto-preview-text" onclick="speakText('${ea(my)}','my')" style="cursor:pointer">
          <i class="fas fa-volume-up" style="color:var(--primary);margin-right:4px"></i> ${esc(my)}
        </div>
      </div>
      <div class="auto-preview-row">
        <div class="auto-preview-label" style="color:var(--primary)">📌 บริบท</div>
        <div class="auto-preview-text" style="font-size:12px;color:var(--primary-dark)">${esc(ctx.th)}</div>
      </div>`;
  } catch (e) {
    document.getElementById('autoPreviewContent').innerHTML =
      '<div style="font-size:12px;color:#ef4444">ไม่สามารถแปลอัตโนมัติได้ กรุณากรอกเอง</div>';
  }
}

async function submitAddPhrase() {
  const th = document.getElementById('f-th').value.trim();
  if (!th) { setErr('err-th','f-th','กรุณากรอกประโยคภาษาไทย'); return; }
  
  const btn = document.getElementById('btnConfirmAdd');
  btn.disabled = true;

  if (modalAutoTimer) {
    clearTimeout(modalAutoTimer);
    modalAutoTimer = null;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังแปลภาษา...';
    await doAutoTranslate(th);
  }

  let en = document.getElementById('f-en').value.trim();
  let zh = document.getElementById('f-zh').value.trim();
  let my = document.getElementById('f-my').value.trim();
  let phonEn = document.getElementById('f-phonetic-en').value.trim();
  let phonZh = document.getElementById('f-phonetic-zh').value.trim();
  let ctxTh = document.getElementById('f-ctx-th').value.trim();
  let ctxEn = document.getElementById('f-ctx-en').value.trim();
  
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังบันทึก...';
  
  if (!en || !zh || !my) {
    try {
      const [enR, zhR, myR] = await Promise.all([
        en ? Promise.resolve(en) : gTranslate(th,'th','en'),
        zh ? Promise.resolve(zh) : gTranslate(th,'th','zh-CN'),
        my ? Promise.resolve(my) : gTranslate(th,'th','my')
      ]);
      en = enR; zh = zhR; my = myR;
      if (!phonEn) phonEn = genPhonetics(en);
      if (!phonZh) phonZh = genPhoneticsZh(zh);
      if (!ctxTh || !ctxEn) { const c = analyzeCtx(th,en); ctxTh = ctxTh || c.th; ctxEn = ctxEn || c.en; }
    } catch (e) {}
  }
  if (en && !phonEn) phonEn=genPhonetics(en);
  if (zh && !phonZh) phonZh=genPhoneticsZh(zh);
  
  const isEdit = !!editingId;
  btn.innerHTML = isEdit ? '<i class="fas fa-save"></i> บันทึก' : '<i class="fas fa-plus"></i> เพิ่มประโยค';
  btn.disabled = false;
  
  if (!en) { setErr('err-en','f-en','ไม่สามารถแปลได้ กรุณากรอกเอง'); return; }
  if (!zh) { setErr('err-zh','f-zh','ไม่สามารถแปลได้ กรุณากรอกเอง'); return; }
  if (!my) { setErr('err-my','f-my','ไม่สามารถแปลได้ กรุณากรอกภาษาเมียนมาร์เอง'); return; }
  
  const s = currentScenario();
  if (isEdit) {
    const idx = s.phrases.findIndex(p => p.id === editingId);
    if (idx !== -1) s.phrases[idx] = { ...s.phrases[idx], en, th, zh, my, phonetic_en:phonEn, phonetic_zh:phonZh, context:ctxEn, contextTh:ctxTh };
  } else {
    s.phrases.push({ id:'c_'+Date.now(), en, th, zh, my, phonetic_en:phonEn, phonetic_zh:phonZh, context:ctxEn, contextTh:ctxTh });
  }
  save(); closeAddModal(); renderPhrases(); renderPracticeCards(); renderQuickPhrases();
}

function setErr(errId, inputId, msg) {
  const e = document.getElementById(errId); if (e) e.textContent = msg;
  const i = document.getElementById(inputId); if (i) i.classList.add('error');
}

function toggleAddModalMic() {
  const btn = document.getElementById('addModalMicBtn');
  if (isAddModalRecording) { recRef && recRef.stop(); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert('Browser ไม่รองรับ กรุณาใช้ Chrome'); return; }
  const rec = new SR(); rec.lang = 'th-TH'; recRef = rec;
  rec.onstart = () => { isAddModalRecording = true; btn.classList.add('recording'); btn.innerHTML = '<i class="fas fa-stop"></i>'; };
  rec.onresult = (e) => { document.getElementById('f-th').value = e.results[0][0].transcript; onModalThaiInput(); };
  rec.onend = () => { isAddModalRecording = false; btn.classList.remove('recording'); btn.innerHTML = '<i class="fas fa-microphone"></i>'; };
  rec.start();
}

function toggleMyanmarPhraseMic() {
  const btn = document.getElementById('myPhraseMicBtn');
  if (isMyanmarPhraseRecording) { recRef && recRef.stop(); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { document.getElementById('err-my').textContent = 'เบราว์เซอร์นี้ไม่รองรับการรับเสียง กรุณาพิมพ์ภาษาเมียนมาร์'; return; }
  const rec = new SR(); rec.lang = 'my-MM'; rec.continuous = false; rec.interimResults = false; recRef = rec;
  rec.onstart = () => { isMyanmarPhraseRecording = true; btn.classList.add('recording'); btn.innerHTML = '<i class="fas fa-stop"></i>'; };
  rec.onresult = e => { const field=document.getElementById('f-my'); field.value=e.results[0][0].transcript; field.classList.remove('error'); document.getElementById('err-my').textContent=''; };
  rec.onerror = e => { document.getElementById('err-my').textContent = e.error==='language-not-supported' ? 'อุปกรณ์ไม่รองรับการรู้จำเสียงเมียนมาร์ กรุณาพิมพ์แทน' : 'รับเสียงไม่ได้ กรุณาลองอีกครั้งหรือพิมพ์แทน'; };
  rec.onend = () => { isMyanmarPhraseRecording = false; btn.classList.remove('recording'); btn.innerHTML = '<i class="fas fa-microphone"></i>'; };
  rec.start();
}

/* ── Delete Modal ─────────────────────────────────────────── */
let deleteTargetId = null;
function openDeleteModal(id) {
  const s = currentScenario(), phrase = s.phrases.find(p => p.id === id);
  if (!phrase) return;
  deleteTargetId = id;
  document.getElementById('deletePhrasePreview').innerHTML =
    `<strong>${esc(phrase.en)}</strong><br><span style="font-size:12px;color:var(--text-sub)">${esc(phrase.th)}</span>`;
  document.getElementById('deleteModal').classList.add('open');
}
function closeDeleteModal() { document.getElementById('deleteModal').classList.remove('open'); deleteTargetId = null; }
function doDelete() {
  if (!deleteTargetId) return;
  const s = currentScenario();
  s.phrases = s.phrases.filter(p => p.id !== deleteTargetId);
  save(); closeDeleteModal(); renderPhrases(); renderPracticeCards(); renderQuickPhrases();
}

/* ── Google Translate ─────────────────────────────────────── */
function findPreparedTranslation(source, sl, tl) {
  if (typeof scenarios === 'undefined' || !Array.isArray(scenarios)) return '';
  const fields={th:'th',en:'en',zh:'zh','zh-CN':'zh',my:'my'};
  const sourceField=fields[sl], targetField=fields[tl];
  if (!sourceField || !targetField) return '';
  const normalize=value=>String(value || '').normalize('NFKC').trim().replace(/\s+/g,' ').replace(/[.!?။၊。！？,，、;；:：]+$/u,'').toLocaleLowerCase();
  const needle=normalize(source);
  if (!needle) return '';
  for (const scenario of scenarios) {
    for (const phrase of scenario.phrases || []) {
      if (phrase[targetField] && normalize(phrase[sourceField])===needle) return String(phrase[targetField]).trim();
    }
  }
  return '';
}
async function gTranslate(text, sl, tl) {
  const source=String(text || '').trim();
  if (!source) return '';
  // Google uses zh-CN for simplified Chinese; keep the UI code consistent.
  sl = sl === 'zh' ? 'zh-CN' : sl;
  tl = tl === 'zh' ? 'zh-CN' : tl;
  if (sl===tl) return source;
  const key=`${sl}\u0000${tl}\u0000${source}`;
  const prepared=findPreparedTranslation(source,sl,tl);
  if (prepared) { translationMemory.set(key,prepared); return prepared; }
  if (translationMemory.has(key)) return translationMemory.get(key);
  if (translationTasks.has(key)) return translationTasks.get(key);
  const task=(async()=>{
    const query=`sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(source)}`;
    // The two public Google hosts are equivalent, but one can be temporarily
    // unavailable or rate-limited from a particular GitHub Pages region.
    // Safari blocks cross-origin fetches to Google's translate endpoint.
    // Use the same-origin server proxy first; static GitHub Pages will skip
    // the 404 proxy and retain the direct fallback for browsers that allow it.
    const configuredApi=String(window.HEAL_TRANSLATOR_API_BASE || '').replace(/\/+$/,'');
    const apiOrigin=configuredApi || location.origin;
    const localEndpoint=/^https?:$/.test(location.protocol)
      ? `${apiOrigin}/translate?${query}` : '';
    const endpoints=[
      ...(localEndpoint ? [localEndpoint] : []),
      `https://translate.googleapis.com/translate_a/single?client=gtx&${query}`,
      `https://translate.google.com/translate_a/single?client=gtx&${query}`
    ];
    let lastError;
    for (let attempt=0;attempt<3;attempt++) {
      const url=endpoints[attempt % endpoints.length];
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),4000);
      try {
        const res=await fetch(url,{signal:controller.signal,cache:'no-store'});
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        const data=await res.json();
        const translated=Array.isArray(data?.[0]) ? data[0].map(row=>row?.[0] || '').join('').trim() : '';
        if(!translated) throw new Error('Empty translation response');
        translationMemory.set(key,translated);
        if(translationMemory.size>250) translationMemory.delete(translationMemory.keys().next().value);
        return translated;
      } catch(error) {
        lastError=error;
        if(attempt<2) await new Promise(resolve=>setTimeout(resolve,180));
      } finally { clearTimeout(timeout); }
    }
    throw new Error(`Translation unavailable (${lastError?.message || 'network'})`);
  })();
  translationTasks.set(key,task);
  try { return await task; } finally { translationTasks.delete(key); }
}

/* ── Phonetics (อัปเกรดระบบเดาคำอ่าน) ───────────────────────── */
function genPhonetics(en) {
  if (!en) return '';
  // เพิ่มคลังศัพท์พื้นฐานและศัพท์แพทย์ที่ใช้บ่อย
  const map = {
    'i':'ไอ', 'you':'ยู', 'he':'ฮี', 'she':'ชี', 'it':'อิท', 'we':'วี', 'they':'เดย์',
    'am':'แอม', 'is':'อิซ', 'are':'อาร์', 'was':'วอส', 'were':'เวิร์', 'be':'บี', 'been':'บีน',
    'do':'ดู', 'does':'ดาส', 'did':'ดิด', 'have':'แฮฟ', 'has':'แฮส', 'had':'แฮด',
    'can':'แคน', 'could':'คูด', 'will':'วิล', 'would':'วูด', 'shall':'แชล', 'should':'ชูด', 'may':'เมย์', 'might':'ไมท์', 'must':'มัสต์',
    'what':'วอท', 'where':'แวร์', 'when':'เวน', 'why':'วาย', 'who':'ฮู', 'how':'เฮา', 'which':'วิช', 'whose':'ฮูส',
    
    'come':'คัม', 'go':'โก', 'went':'เวนท์', 'gone':'กอน', 'want':'วอนท์', 'need':'นีด', 'take':'เทค', 'bring':'บริง',
    'see':'ซี', 'look':'ลุค', 'watch':'วอทช์', 'make':'เมค', 'use':'ยูส', 'find':'ไฟนด์', 'give':'กิฟ', 'tell':'เทล',
    'work':'เวิร์ค', 'call':'คอล', 'try':'ไทร', 'ask':'อาสค์', 'feel':'ฟีล', 'leave':'ลีฟ', 'put':'พุท', 'mean':'มีน',
    
    'good':'กุด', 'bad':'แบด', 'wrong':'รอง', 'right':'ไรท์', 'true':'ทรู', 'false':'ฟอลส์', 'new':'นิว', 'old':'โอลด์',
    'high':'ไฮ', 'low':'โลว์', 'big':'บิ๊ก', 'small':'สมอล', 'large':'ลาร์จ', 'long':'ลอง', 'short':'ชอร์ท', 'hot':'ฮอท',
    'cold':'โคลด์', 'warm':'วอร์ม', 'cool':'คูล', 'fast':'ฟาสต์', 'slow':'สโลว์', 'early':'เออร์ลี', 'late':'เลท', 'easy':'อีซี',
    'hard':'ฮาร์ด', 'difficult':'ดิฟฟิคัลท์', 'sure':'ชัวร์', 'clear':'เคลียร์', 'free':'ฟรี', 'full':'ฟูล', 'empty':'เอมป์ที',
    
    'hospital':'ฮอสพิเทิล', 'doctor':'ด็อกเตอร์', 'nurse':'เนิร์ส', 'patient':'เพเชียนท์', 'clinic':'คลินิก', 'room':'รูม',
    'blood':'บลัด', 'pressure':'เพรชเชอร์', 'weight':'เวท', 'height':'ไฮท์', 'temperature':'เทมเพอเรเจอร์', 'pain':'เปน',
    'fever':'ฟีเวอร์', 'cough':'คอฟ', 'dizzy':'ดิซซี่', 'medicine':'เมดิซิน', 'pill':'พิล', 'pharmacy':'ฟาร์มาซี',
    'symptom':'ซิมทัม', 'allergy':'อะเลอร์จี', 'allergies':'อะเลอร์จีส', 'disease':'ดิซีส', 'illness':'อิลเนส', 'health':'เฮลธ์',
    'body':'บอดี้', 'head':'เฮด', 'eye':'อาย', 'ear':'เอียร์', 'nose':'โนส', 'mouth':'เมาท์', 'tooth':'ทูธ', 'teeth':'ทีธ',
    'throat':'โธรท', 'neck':'เนค', 'shoulder':'โชลเดอร์', 'arm':'อาร์ม', 'hand':'แฮนด์', 'finger':'ฟิงเกอร์', 'chest':'เชสท์',
    'heart':'ฮาร์ท', 'stomach':'สโตมัค', 'back':'แบ็ค', 'leg':'เลก', 'knee':'นี', 'foot':'ฟุท', 'feet':'ฟีท', 'toe':'โท',
    'skin':'สกิน', 'bone':'โบน', 'muscle':'มัสเซิล', 'brain':'เบรน', 'urine':'ยูรีน', 'stool':'สทูล',
    'test':'เทสท์', 'result':'รีซัลท์', 'xray':'เอ็กซเรย์', 'scan':'สแกน', 'surgery':'เซอร์เจอรี่', 'operation':'โอเปอเรชัน',
    'injection':'อินเจคชัน', 'vaccine':'วัคซีน', 'prescription':'พรีสคริปชัน', 'appointment':'อะพอยต์เมินท์', 'queue':'คิว',
    'number':'นัมเบอร์', 'sign':'ไซน์', 'passport':'พาสปอร์ท', 'card':'การ์ด', 'insurance':'อินชัวรันส์', 'payment':'เพย์เมนท์',
    
    'hello':'เฮลโล', 'hi':'ไฮ', 'welcome':'เวลคัม', 'today':'ทูเดย์', 'tomorrow':'ทูมอร์โรว์', 'yesterday':'เยสเทอร์เดย์',
    'morning':'มอร์นิ่ง', 'afternoon':'อาฟเตอร์นูน', 'evening':'อีฟวนิ่ง', 'night':'ไนท์',
    'this':'ดิส', 'that':'แดท', 'these':'ดีซ', 'those':'โดซ', 'here':'เฮียร์', 'there':'แดร์',
    'in':'อิน', 'on':'ออน', 'at':'แอท', 'by':'บาย', 'with':'วิธ', 'about':'อะเบาท์', 'from':'ฟรอม', 'to':'ทู',
    'of':'ออฟ', 'and':'แอนด์', 'or':'ออร์', 'but':'บัท', 'if':'อิฟ', 'because':'บีคอส', 'for':'ฟอร์', 'a':'อะ', 'an':'แอน', 'the':'เดอะ',
    'yes':'เยส', 'no':'โน', 'not':'นอท', 'ok':'โอเค', 'okay':'โอเค', 'thank':'แธงค์', 'thanks':'แธงส์', 'sorry':'ซอร์รี่', 'please':'พลีส',
    // คำที่ใช้ใน Role Play ทุกโหมด — ไม่ปล่อยคำอังกฤษดิบในคำอ่าน
    'follow':'ฟอลโลว', 'your':'ยัวร์', 'me':'มี', 'my':'มาย', 'name':'เนม', 'james':'เจมส์', 'wilson':'วิลสัน',
    'excuse':'เอ็กซ์คิวซ', 'just':'จัสท์', 'arrived':'อะไรวด์', 'dont':'โดนท์', 'feel':'ฟีล', 'well':'เวล', 'at':'แอท', 'all':'ออล', 'someone':'ซัมวัน', 'help':'เฮลป์', 'so':'โซ', 'much':'มัช',
    'very':'เวรี', 'weak':'วีค', 'since':'ซินซ์', 'think':'ธิงค์', 'might':'ไมท์', 'too':'ทู', 'regular':'เรกิวเลอร์', 'checkup':'เช็คอัพ', 'check':'เช็ค', 'please':'พลีส',
    'received':'รีซีฟด์', 'message':'เมสเสจ', 'doctor':'ด็อกเตอร์', 'come':'คัม', 'need':'นีด', 'register':'เรจิสเตอร์', 'sure':'ชัวร์', 'what':'วอท', 'should':'ชูด', 'next':'เน็กซ์ท',
    'of':'ออฟ', 'course':'คอร์ส', 'wait':'เวท', 'moment':'โมเมนท์', 'help':'เฮลป์', 'right':'ไรท์', 'away':'อะเวย์', 'medicine':'เมดิซิน', 'twice':'ทไวซ์', 'day':'เดย์', 'after':'อาฟเทอร์', 'meals':'มีลส์',
    'roll':'โรล', 'up':'อัพ', 'sleeve':'สลีฟ', 'good':'กุด', 'how':'เฮา', 'feeling':'ฟีลลิง', 'already':'ออลเรดดี', 'front':'ฟรอนท์', 'station':'สเทชัน', 'done':'ดัน', 'tell':'เทล', 'if':'อิฟ', 'more':'มอร์', 'dizzy':'ดิซซี',
    'lying':'ไลอิง', 'down':'ดาวน์', 'special':'สเปเชิล', 'during':'ดิวริง', 'ultrasound':'อัลทราซาวนด์', 'anything':'เอนนีธิง', 'examination':'เอ็กแซมมิเนชัน', 'finished':'ฟินนิชท์', 'home':'โฮม', 'understand':'อันเดอร์สแทนด์', 'instructions':'อินสทรัคชันส์',
    'chest':'เชสท์', 'tightness':'ไทท์เนส', 'difficulty':'ดิฟฟิคัลที', 'breathing':'บรีธิง', 'afternoon':'อาฟเตอร์นูน', 'passport':'พาสปอร์ต', 'number':'นัมเบอร์', 'daily':'เดลี', 'called':'คอลด์', 'hot':'ฮอท', 'last':'ลาสท์', 'night':'ไนท์', 'measured':'เมเชิร์ด', 'degrees':'ดีกรีส์', 'hurts':'เฮิร์ทส์', 'swallow':'สวอลโลว์', 'about':'อะเบาท์', 'six':'ซิกซ์', 'symptoms':'ซิมทัมส์', 'lost':'ลอสท์', 'first':'เฟิร์สท์', 'where':'แวร์', 'room':'รูม', 'floor':'ฟลอร์', 'got':'กอท', 'understand':'อันเดอร์สแทนด์', 'blood':'บลัด', 'lab':'แลบ', 'pick':'พิค', 'ask':'อาสค์', 'coverage':'คัฟเวอเรจ', 'pay':'เพย์', 'fees':'ฟีส์', 'said':'เซด', 'also':'ออลโซ', 'building':'บิลดิง', 'nervous':'เนอร์เวิส', 'tests':'เทสท์ส', 'done':'ดัน', 'arm':'อาร์ม', 'sore':'ซอร์', 'examine':'เอ็กแซมมิน', 'inhales':'อินเฮลส์', 'heavily':'เฮฟวิลี', 'results':'รีซัลท์ส', 'today':'ทูเดย์', 'im':'ไอม์', 'ive':'ไอฟ์', 'ill':'ไอล์', 'came':'เคม', 'ahead':'อะเฮด', 'bed':'เบด', 'breath':'เบรธ', 'breathe':'บรีธ', 'checked':'เช็คท์', 'completely':'คอมพลีทลี', 'contact':'คอนแทคท์', 'currently':'เคอร์เรนท์ลี', 'deep':'ดีพ', 'feels':'ฟีลส์', 'going':'โกอิง', 'having':'แฮฟวิง', 'hear':'เฮียร์', 'hold':'โฮลด์', 'hurt':'เฮิร์ท', 'immediately':'อิมมีเดียทลี', 'laboratory':'แลบอระทอรี', 'left':'เลฟท์', 'lie':'ไล', 'little':'ลิทเทิล', 'medical':'เมดิคัล', 'medication':'เมดิเคชัน', 'move':'มูฟ', 'now':'นาว', 'ordered':'ออร์เดิร์ด', 'our':'เอาเออร์', 'perfect':'เพอร์เฟ็คท์', 'questions':'เควสชันส์', 'records':'เรคคอร์ดส์', 'registration':'เรจิสเทรชัน', 'return':'รีเทิร์น', 'scale':'สเกล', 'screen':'สกรีน', 'seat':'ซีท', 'severe':'ซิเวียร์', 'signs':'ไซน์ส', 'sit':'ซิท', 'still':'สติล', 'straight':'สเทรท', 'suddenly':'ซัดเดนลี', 'taking':'เทคคิง', 'uncomfortable':'อันคัมฟอร์เทเบิล', 'vital':'ไวทัล', 'waiting':'เวททิง', 'worse':'เวิร์ส', 'soon':'ซูน', 'customer':'คัสโตเมอร์', 'service':'เซอร์วิส', 'centre':'เซ็นเทอร์', 'center':'เซ็นเทอร์'
  };
  
  const w = en.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(' ').filter(Boolean);
  return w.map(word => {
    // 1. ถ้าคำนั้นมีในดิกชันนารี แปลงให้เลย
    if (map[word]) return map[word];
    
    // 2. ถ้าไม่มี คาดเดาคำอ่านจากคำลงท้าย (Suffix) แทน เพื่อไม่ให้ว่างเปล่า
    let guessed = word;
    if (word.endsWith('tion')) guessed = guessed.replace('tion', 'ชัน');
    else if (word.endsWith('sion')) guessed = guessed.replace('sion', 'ชัน');
    else if (word.endsWith('ing')) guessed = guessed.replace('ing', 'อิง');
    else if (word.endsWith('ly')) guessed = guessed.replace('ly', 'ลี');
    else if (word.endsWith('ment')) guessed = guessed.replace('ment', 'เมินท์');
    else if (word.endsWith('ness')) guessed = guessed.replace('ness', 'เนส');
    else if (word.endsWith('able')) guessed = guessed.replace('able', 'เอเบิล');
    else if (word.endsWith('ful')) guessed = guessed.replace('ful', 'ฟูล');
    else if (word.endsWith('less')) guessed = guessed.replace('less', 'เลส');
    
    // 3. ป้องกันปัญหาคำหาย ถ้าไม่มีทางเลือก ให้ส่งกลับเป็นตัวอักษรภาษาอังกฤษ
    return guessed;
  }).join(' ');
}

// แปลงพยางค์ Pinyin เป็นเสียงใกล้เคียงด้วยอักษรไทย
function pinyinTokenToThai(raw) {
  const toneChars={'ǖ':'ü','ǘ':'ü','ǚ':'ü','ǜ':'ü'};
  let token=[...String(raw).toLowerCase()].map(ch=>toneChars[ch]||ch).join('').replace(/ü/g,'v');
  token=token.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/v/g,'ü');
  const common={ni:'หนี่',nin:'หนิน',hao:'ห่าว',qing:'ฉิ่ง',wen:'เวิ่น',wo:'หว่อ',jin:'จิน',tian:'เทียน',neng:'เหนิง',bang:'ปาง',shen:'เสิน',me:'เมอะ',zai:'จ้าย',zhe:'เจ้อ',li:'หลี่',you:'โหย่ว',xie:'เซี่ย',xiexie:'เซี่ยเซี่ย',yisheng:'อี้เซิง',yiyuan:'อี้ย่วน',hushi:'ฮู่ซื่อ',zhong:'จง',guo:'กั๋ว'};
  if (common[token]) return common[token];
  const special={zhi:'จือ',chi:'ชือ',shi:'ซื่อ',ri:'ยื่อ',zi:'จือ',ci:'ชื่อ',si:'ซือ',yi:'อี',ya:'ยา',ye:'เย',yao:'เยา',yan:'เยียน',yin:'อิน',yang:'หยาง',ying:'อิง',yong:'ยง',yu:'อวี',yue:'เยว',yuan:'เยวียน',yun:'ยวิน',wu:'อู',wa:'วา',wo:'หว่อ',wai:'ไหว',wei:'เวย',wan:'วาน',wen:'เวิน',wang:'วาง',weng:'เวิง',ju:'จวี',jue:'เจวีย',juan:'จวียน',jun:'จวิน',qu:'ชวี',que:'เชวีย',quan:'ชวียน',qun:'ชวิน',xu:'ซวี',xue:'เซวีย',xuan:'ซวียน',xun:'ซวิน'};
  if (special[token]) return special[token];
  const initials=[['zh','จ'],['ch','ช'],['sh','ซ'],['b','ป'],['p','พ'],['m','ม'],['f','ฟ'],['d','ต'],['t','ท'],['n','น'],['l','ล'],['g','ก'],['k','ค'],['h','ฮ'],['j','จ'],['q','ช'],['x','ซ'],['r','ร'],['z','จ'],['c','ช'],['s','ซ']];
  let initial='',consonant='';
  for (const [py,th] of initials) if (token.startsWith(py)) { initial=py; consonant=th; break; }
  let final=token.slice(initial.length);
  if (['j','q','x'].includes(initial) && final.startsWith('u')) final='ü'+final.slice(1);
  if (!initial) {
    const standalone={a:'อา',o:'ออ',e:'เออ',ai:'ไอ',ei:'เอย',ao:'เอา',ou:'โอว',an:'อัน',en:'เอิน',ang:'อาง',eng:'เอิง',ong:'อง',i:'อี',u:'อู',ü:'อวี',er:'เออร์'};
    if (standalone[final]) return standalone[final];
  }
  const joined={
    a:consonant+'า',o:consonant+'อ',e:'เ'+consonant+'อ',ai:consonant+'ไอ',ei:'เ'+consonant+'ย',ao:'เ'+consonant+'า',ou:'โ'+consonant+'ว',
    an:consonant+'ัน',en:'เ'+consonant+'ิน',ang:consonant+'าง',eng:'เ'+consonant+'ิง',ong:consonant+'ง',
    i:consonant+'ี',ia:'เ'+consonant+'ีย',ie:'เ'+consonant+'ีย',iao:'เ'+consonant+'ียว',iu:consonant+'ิว',ian:'เ'+consonant+'ียน',in:consonant+'ิน',iang:'เ'+consonant+'ียง',ing:consonant+'ิง',iong:consonant+'ยง',
    u:consonant+'ู',ua:consonant+'วา',uo:consonant+'วอ',uai:consonant+'วาย',ui:consonant+'ุย',uan:consonant+'วาน',un:consonant+'ุน',uang:consonant+'วาง',ueng:'เ'+consonant+'ิง',
    ü:consonant+'วี',üe:'เ'+consonant+'วีย',üan:consonant+'วียน',ün:consonant+'วิน',er:consonant+'เออร์'
  };
  if (joined[final]) return joined[final];
  const letterNames={a:'เอ',b:'บี',c:'ซี',d:'ดี',e:'อี',f:'เอฟ',g:'จี',h:'เอช',i:'ไอ',j:'เจ',k:'เค',l:'แอล',m:'เอ็ม',n:'เอ็น',o:'โอ',p:'พี',q:'คิว',r:'อาร์',s:'เอส',t:'ที',u:'ยู',v:'วี',w:'ดับเบิลยู',x:'เอ็กซ์',y:'วาย',z:'แซด'};
  return [...token].map(ch=>letterNames[ch]||ch).join(' ');
}

// ฟังก์ชันสำหรับแปลงภาษาจีนเป็นคำอ่านภาษาไทยโดยประมาณ
function genPhoneticsZh(zh) {
  if (!zh) return '';
  const pinyinFn=window.PinyinPro && window.PinyinPro.pinyin;
  if (typeof pinyinFn==='function') {
    const chunks=String(zh).match(/[\u3400-\u9fff]+|[A-Za-z]+(?:['’-][A-Za-z]+)*|\d+(?:[.,]\d+)?|[^\u3400-\u9fffA-Za-z\d]+/g) || [];
    const pinyin=chunks.map(chunk=>{
      if (/[\u3400-\u9fff]/.test(chunk)) {
        try { return pinyinFn(chunk,{toneType:'symbol'}).replace(/[\p{L}]+/gu,token=>pinyinTokenToThai(token)); } catch(e) {}
      }
      return chunk;
    }).join(' ');
    return pinyin.replace(/\s+([，。！？；：、,.!?;:])/g,'$1').replace(/([（([{])\s+/g,'$1').replace(/\s+([）)\]}])/g,'$1').replace(/\s{2,}/g,' ').trim();
  }
  const dict = [
    {z:'早上好', t:'จ้าวซ่างห่าว'}, {z:'下午好', t:'เซี่ยอู่ห่าว'}, {z:'晚上好', t:'หว่านซ่างห่าว'},
    {z:'对不起', t:'ตุ้ยปู้ฉี่'}, {z:'没关系', t:'เหมยกวนซี'}, {z:'洗手间', t:'สีโส่วเจียน'},
    {z:'什么时候', t:'เสินเมอะสือโฮ่ว'}, {z:'为什么', t:'เว่ยเสินเมอะ'}, {z:'多少钱', t:'ตัวเส่าเฉียน'},
    {z:'你好', t:'หนีห่าว'}, {z:'欢迎', t:'ฮวนอิ๋ง'}, {z:'谢谢', t:'เซี่ยเซี่ย'}, {z:'再见', t:'จ้ายเจี้ยน'}, 
    {z:'医生', t:'อี้เซิง'}, {z:'护士', t:'ฮู่ซื่อ'}, {z:'医院', t:'อี้ย่วน'}, {z:'什么', t:'เสินเมอะ'}, 
    {z:'哪里', t:'หนาหลี่'}, {z:'怎么', t:'เจิ่นเมอะ'}, {z:'发烧', t:'ฟาเซา'}, {z:'感冒', t:'กั่นเม่า'},
    {z:'咳嗽', t:'เขอโซ่ว'}, {z:'头晕', t:'โถวยุน'}, {z:'今天', t:'จินเทียน'}, {z:'明天', t:'หมิงเทียน'}, 
    {z:'昨天', t:'จั๋วเทียน'}, {z:'现在', t:'เซี่ยนจ้าย'}, {z:'血压', t:'เสวี่ยยา'}, {z:'检查', t:'เจี่ยนฉา'}, 
    {z:'药房', t:'เย่าฝาง'}, {z:'打针', t:'ต่าเจิน'}, {z:'吃药', t:'ชือเย่า'}, {z:'稍等', t:'เซาเติ่ง'},
    {z:'预约', t:'อวี้เยวีย'}, {z:'名字', t:'หมิงจื้อ'}, {z:'护照', t:'ฮู่จ้าว'}, {z:'请问', t:'ฉิ่งเวิ่น'},
    {z:'请', t:'ฉิ่ง'}, {z:'你', t:'หนี่'}, {z:'您', t:'หนิน'}, {z:'我', t:'หว่อ'}, {z:'他', t:'ทา'}, 
    {z:'她', t:'ทา'}, {z:'们', t:'เหมิน'}, {z:'的', t:'เตอ'}, {z:'是', t:'ซื่อ'}, {z:'在', t:'จ้าย'}, 
    {z:'这', t:'เจ้อ'}, {z:'那', t:'น่า'}, {z:'里', t:'หลี่'}, {z:'有', t:'โหย่ว'}, {z:'没', t:'เหมย'}, 
    {z:'要', t:'เย่า'}, {z:'不', t:'ปู้'}, {z:'好', t:'ห่าว'}, {z:'吗', t:'มะ'}, {z:'疼', t:'เถิง'},
    {z:'痛', t:'ท่ง'}, {z:'药', t:'เย่า'}, {z:'吃', t:'ชือ'}, {z:'喝', t:'ฮือ'}, {z:'水', t:'สุ่ย'}, 
    {z:'等', t:'เติ่ง'}, {z:'来', t:'ไหล'}, {z:'去', t:'ชวี่'}, {z:'做', t:'จั้ว'}, {z:'看', t:'คั่น'}, 
    {z:'能', t:'เหนิง'}, {z:'会', t:'ฮุ่ย'}, {z:'和', t:'เหอ'}, {z:'也', t:'เหย่'}, {z:'很', t:'เหิ่น'}, 
    {z:'太', t:'ไท่'}, {z:'吗', t:'มะ'}, {z:'了', t:'เลอะ'}, {z:'吧', t:'ปะ'}, {z:'呢', t:'เนอะ'}
  ];
  
  let res = zh;
  // แปลงทีละคำจากฐานข้อมูล
  for (const item of dict) {
    res = res.split(item.z).join(item.t + ' ');
  }
  return res.replace(/  +/g, ' ').trim();
}

function updateEnglishPhonetic() {
  const en=document.getElementById('f-en')?.value.trim() || '';
  const field=document.getElementById('f-phonetic-en');
  if (field) field.value=en ? genPhonetics(en) : '';
}

function updateChinesePhonetic() {
  const zh=document.getElementById('f-zh')?.value.trim() || '';
  const field=document.getElementById('f-phonetic-zh');
  if (field) field.value=zh ? genPhoneticsZh(zh) : '';
}

function analyzeCtx(th, en) {
  const t = th.toLowerCase(), e = en.toLowerCase();

  if (t.match(/ทักทาย|สวัสดี|ต้อนรับ|สบายดีไหม/) || e.match(/hello|hi |welcome|good morning|how are you/))
    return { th: 'ใช้ทักทายและต้อนรับผู้ป่วย', en: 'Greeting and welcoming the patient' };

  if (t.match(/ชื่อ|นามสกุล|บัตร|พาสปอร์ต|เกิด|อายุ|เบอร์โทร|ติดต่อ/) || e.match(/name|passport|id card|birth|age|phone|contact/))
    return { th: 'ใช้สอบถามข้อมูลส่วนตัวเพื่อลงทะเบียน', en: 'Asking for personal information at registration' };

  if (t.match(/นัด|ทำนัด|คิว|ใบนัด/) || e.match(/appointment|queue/))
    return { th: 'ใช้สอบถามหรือจัดการเรื่องการนัดหมาย', en: 'Checking or managing appointments' };

  if (t.match(/ความดัน|น้ำหนัก|ส่วนสูง|อุณหภูมิ|ปรอท|ชีพจร|สัญญาณชีพ/) || e.match(/blood pressure|weight|height|temperature|pulse|vital/))
    return { th: 'ใช้แจ้งการตรวจวัดสัญญาณชีพเบื้องต้น', en: 'Informing about vital signs measurement' };

  if (t.match(/อาการ|เจ็บ|ปวด|แพ้ยา|โรคประจำตัว|ไข้|ไอ|เวียนหัว|คลื่นไส้/) || e.match(/symptom|pain|hurt|allergy|chronic|fever|cough|dizzy|nausea/))
    return { th: 'ใช้ซักถามประวัติและอาการเจ็บป่วย', en: 'Assessing symptoms and medical history' };

  if (t.match(/นอน|นั่ง|หายใจ|อ้าปาก|ขยับ|กลืน|พับแขน|ตรวจ/) || e.match(/lie down|sit|breath|breathe|open.*mouth|move|swallow|roll up|examine/))
    return { th: 'ใช้ออกคำสั่งขณะแพทย์/พยาบาลทำการตรวจ', en: 'Giving instructions during physical examination' };

  if (t.match(/รอ|สักครู่|เดี๋ยว/) || e.match(/wait|moment|shortly|soon/))
    return { th: 'ใช้บอกให้ผู้ป่วยนั่งรอรับบริการ', en: 'Asking the patient to wait' };

  if (t.match(/ยา|เภสัช|กินยา|ทานยา/) || e.match(/medicine|medication|pill|pharmacy/))
    return { th: 'ใช้แนะนำหรือสอบถามเกี่ยวกับการใช้ยา', en: 'Medication instructions or inquiries' };

  if (t.match(/จ่ายเงิน|การเงิน|ประกัน|ใบเสร็จ|ค่ารักษา/) || e.match(/pay|cashier|insurance|receipt|bill/))
    return { th: 'ใช้สื่อสารเรื่องค่าใช้จ่ายและประกัน', en: 'Communicating about payment and insurance' };

  if (t.match(/ทาง|ชั้น|ตึก|ห้อง|เลี้ยว|ตรงไป|ป้าย/) || e.match(/direction|floor|building|room|turn|straight|sign/))
    return { th: 'ใช้บอกทิศทางไปยังแผนกต่างๆ', en: 'Giving directions to other departments' };

  if (t.match(/ขอโทษ|เสียใจ|ไม่เป็นไร/) || e.match(/sorry|apologize|worry/))
    return { th: 'ใช้แสดงความเห็นใจหรือขออภัย', en: 'Showing empathy or apologizing' };

  if (t.match(/เข้าใจ|คำถาม|เรียบร้อย|เสร็จ/) || e.match(/understand|question|finish|done/))
    return { th: 'ใช้ตรวจสอบความเข้าใจหรือสิ้นสุดการตรวจ', en: 'Checking understanding or ending the visit' };

  return { th: 'ใช้ในการสนทนาทั่วไปกับผู้ป่วย', en: 'General conversation with the patient' };
}

/* ── Practice Recording ──────────────────────────────────── */
function goToPractice() {
  const s = currentScenario();
  if (s.phrases.length) {
    const p = s.phrases[0];
    selectPracticeCard('en', p.en, p.id);
  }
  switchTab('practice', document.querySelector('[data-tab="practice"]'));
}
function playPracticeAudio() { if (practiceTarget.text) speakText(practiceTarget.text, practiceTarget.lang); }

function toggleRecording() {
  if (!practiceTarget.text) { alert('กรุณาเลือกประโยคที่ต้องการฝึกก่อนค่ะ'); return; }
  if (isRecording) { recRef && recRef.stop(); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { showRecResult('Browser ไม่รองรับ กรุณาใช้ Chrome'); return; }
  const rec = new SR();
  rec.lang = speechLocale(practiceTarget.lang);
  rec.continuous = false; rec.interimResults = false; recRef = rec;
  rec.onstart = () => {
    isRecording = true;
    document.getElementById('recBtn').classList.add('recording');
    document.getElementById('recBtnText').textContent = 'หยุดฟัง (Stop)';
    document.getElementById('recIcon').className = 'fas fa-stop';
    document.getElementById('recBox').classList.add('listening');
    document.getElementById('recPlaceholder').style.display = 'none';
    document.getElementById('recResult').style.display = 'none';
    document.getElementById('listeningAnim').style.display = 'flex';
    document.getElementById('scoreBox').style.display = 'none';
  };
  rec.onresult = (e) => { const t = e.results[0][0].transcript; showRecResult(t); showScore(t); };
  rec.onend = () => {
    isRecording = false;
    document.getElementById('recBtn').classList.remove('recording');
    document.getElementById('recBtnText').textContent = 'กดเพื่อพูด (Tap to Speak)';
    document.getElementById('recIcon').className = 'fas fa-microphone';
    document.getElementById('recBox').classList.remove('listening');
    document.getElementById('listeningAnim').style.display = 'none';
    document.getElementById('recPlaceholder').style.display = '';
  };
  rec.onerror = () => { isRecording = false; showRecResult('ไม่สามารถรับเสียงได้ ลองอีกครั้ง'); };
  rec.start();
}

function showRecResult(text) {
  document.getElementById('listeningAnim').style.display = 'none';
  document.getElementById('recPlaceholder').style.display = 'none';
  const el = document.getElementById('recResult');
  el.innerHTML = `<span style="color:var(--text-hint);font-size:11px">คุณพูดว่า:</span><br><strong>${esc(text)}</strong>`;
  el.style.display = 'block';
}

function showScore(spoken) {
  const pct = calcScore(spoken, practiceTarget.text, practiceTarget.lang);
  const box = document.getElementById('scoreBox');
  box.style.display = 'block'; box.className = 'score-box';
  let cls, msg;
  if (pct >= 90) { cls = 'good'; msg = '✨ ยอดเยี่ยมมาก!'; }
  else if (pct >= 75) { cls = 'ok'; msg = '👍 ดีมาก ลองอีกนิดนะ'; }
  else if (pct >= 60) { cls = 'meh'; msg = '💪 ฝึกอีกหน่อยนะ'; }
  else { cls = 'bad'; msg = '🎤 ลองพูดใหม่อีกครั้ง'; }
  box.classList.add(cls);
  document.getElementById('scoreMsg').textContent = `${msg} · คะแนนคำนวณจากคำที่พูดตรง ลำดับคำ และคำที่ขาด/เกินจริง`;
  document.getElementById('scoreNum').textContent = pct + '%';
  const fill = document.getElementById('scoreBarFill');
  fill.style.width = '0';
  setTimeout(() => fill.style.width = pct + '%', 60);
  buildWordAnalysis(spoken, practiceTarget.text, practiceTarget.lang);
}

function buildWordAnalysis(spoken, target, lang) {
  const wa = document.getElementById('wordAnalysis');
  if (!target) { wa.innerHTML = ''; return; }
  let tw, sw;
  if (lang === 'my') {
    wa.innerHTML = `<div class="word-analysis-title"><i class="fas fa-spell-check"></i> เปรียบเทียบประโยคภาษาเมียนมาร์</div><div class="my-practice-compare"><div><small>ประโยคต้นแบบ</small><p>${esc(target)}</p></div><div><small>ระบบได้ยิน</small><p>${esc(spoken)}</p></div></div>`;
    return;
  }
  if (lang === 'zh') {
    tw = target.replace(/[^\u4e00-\u9fa5]/g,'').split('');
    sw = spoken.replace(/[^\u4e00-\u9fa5]/g,'').split('');
  } else {
    tw = target.toLowerCase().replace(/[^a-z ]/g,'').split(' ').filter(Boolean);
    sw = spoken.toLowerCase().replace(/[^a-z ]/g,'').split(' ').filter(Boolean);
  }
  const results = tw.map(t => {
    let best = 0; sw.forEach(s => { const sc = wordSim(s,t); if(sc>best) best=sc; });
    return { word:t, correct: best>=0.8 };
  });
  const wrong = results.filter(r => !r.correct);
  let html = `<div class="word-analysis-title"><i class="fas fa-spell-check"></i> วิเคราะห์รายคำ (กดคำเพื่อฟัง):</div>`;
  html += `<div class="word-tokens">${results.map(r =>
    `<div class="word-token ${r.correct?'correct':'wrong'}" onclick="speakText('${ea(r.word)}','${lang}')">
      ${esc(r.word)}<span class="token-hint">${r.correct?'✓':'✗'}</span>
    </div>`).join('')}</div>`;
  if (wrong.length > 0 && lang === 'en') {
    html += `<div class="wrong-tips">`;
    wrong.slice(0,4).forEach(r => {
      const ph = genPhonetics(r.word);
      html += `<div class="wrong-tip-item">
        <span class="tip-word">"${esc(r.word)}"</span>
        <span class="tip-arrow">→</span>
        <span class="tip-correct">ออกเสียง: ${esc(ph)}</span>
        <button class="btn-tip-listen" onclick="speakText('${ea(r.word)}','en')"><i class="fas fa-volume-up"></i> ฟัง</button>
      </div>`;
    });
    html += `</div>`;
  }
  wa.innerHTML = html;
}

function alignedTokenScore(spokenTokens, targetTokens) {
  const n=spokenTokens.length, m=targetTokens.length;
  if (!m) return 0;
  const dp=Array.from({length:n+1},()=>Array(m+1).fill(0));
  for(let i=0;i<=n;i++) dp[i][0]=i;
  for(let j=0;j<=m;j++) dp[0][j]=j;
  for(let i=1;i<=n;i++) for(let j=1;j<=m;j++) {
    const substitution=1-wordSim(spokenTokens[i-1],targetTokens[j-1]);
    dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+substitution);
  }
  return Math.max(0, Math.min(100, Math.round((1-dp[n][m]/Math.max(n,m))*100)));
}
function calcScore(spoken, target, lang='en') {
  if (!target || !spoken) return 0;
  if (lang === 'my') {
    const clean = value => Array.from(String(value).normalize('NFC').replace(/[^\u1000-\u109f]/g,''));
    return alignedTokenScore(clean(spoken), clean(target));
  }
  if (lang === 'zh') {
    const sw=Array.from(String(spoken).replace(/[^\u4e00-\u9fff]/g,''));
    const tw=Array.from(String(target).replace(/[^\u4e00-\u9fff]/g,''));
    return alignedTokenScore(sw,tw);
  }
  const sw=spoken.toLowerCase().replace(/[^a-z ]/g,'').split(/\s+/).filter(Boolean);
  const tw=target.toLowerCase().replace(/[^a-z ]/g,'').split(/\s+/).filter(Boolean);
  return alignedTokenScore(sw,tw);
}

function wordSim(a,b) {
  const long=a.length>=b.length?a:b, short=a.length>=b.length?b:a;
  if(!long.length) return 1;
  return (long.length - editDist(long,short)) / long.length;
}
function editDist(s1,s2) {
  const c=[];
  for(let i=0;i<=s1.length;i++){
    let last=i;
    for(let j=0;j<=s2.length;j++){
      if(i===0){c[j]=j;continue;}
      if(j>0){let nv=c[j-1];if(s1[i-1]!==s2[j-1])nv=Math.min(nv,last,c[j])+1;c[j-1]=last;last=nv;}
    }
    if(i>0) c[s2.length]=last;
  }
  return c[s2.length];
}

/* ── Chat Scenario Select ─────────────────────────────────── */
function renderChatScenarioSelect() {
  const sel = document.getElementById('chatScenarioSelect');
  if (!sel) return;
  sel.innerHTML = scenarios.map((s, i) =>
    `<option value="${s.id}" ${s.id===chatScenarioId?'selected':''}>สถานการณ์ที่ ${i+1} · ${s.icon} ${s.labelEn} · ${s.labelTh}</option>`
  ).join('');
  updateChatScenarioBadge();
}

function onChatScenarioChange() {
  chatScenarioId = document.getElementById('chatScenarioSelect').value;
  save();
  updateChatScenarioBadge();
  initQuiz();
}

function updateChatScenarioBadge() {
  const meta = rolePlayMeta[chatScenarioId] || rolePlayMeta['greeting'];
  const badge = document.getElementById('chatScenarioBadgeText');
  if (badge) badge.textContent = meta.badge;
  const hintBox = document.getElementById('chatHintBox');
  const hintText = document.getElementById('chatHintText');
  if (hintBox && hintText) { hintBox.style.display = 'block'; hintText.textContent = meta.hint; }
}

/* ── Quiz Mode ────────────────────────────────────────────── */
function initQuiz() {
  quizRoundIndex = 0;
  quizScore = 0;
  quizAnswered = false;

  const box = document.getElementById('chatBox');
  box.innerHTML = '';
  document.getElementById('quizOptionsWrap').innerHTML = '';

  const rounds = quizRounds[chatScenarioId] || [];
  rounds.forEach(r => {
    if(r.options) { r.options.wrongAttempts = 0; }
  });

  updateChatScenarioBadge();
  updateQuizProgress();
  showQuizRound(0);
}

function resetChat() { initQuiz(); }

function updateQuizProgress() {
  const rounds = (quizRounds[chatScenarioId] || []);
  const total = rounds.length;
  const wrap = document.getElementById('quizProgressWrap');
  if (!wrap) return;
  if (total === 0) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  document.getElementById('quizProgressText').textContent = `ข้อที่ ${Math.min(quizRoundIndex + 1, total)} / ${total}`;
  document.getElementById('quizScoreText').textContent = `✓ ${quizScore} คะแนน`;
  const pct = total > 0 ? (quizRoundIndex / total) * 100 : 0;
  document.getElementById('quizProgressFill').style.width = pct + '%';
}

function showQuizRound(roundIdx) {
  const rounds = quizRounds[chatScenarioId] || [];
  if (roundIdx >= rounds.length) { showQuizComplete(); return; }
  const round = rounds[roundIdx];
  quizAnswered = false;
  appendAiMsg(round.aiMsg.en, quizDisplayLang === 'zh' ? (round.aiMsg.thZh || round.aiMsg.th) : round.aiMsg.th, round.aiMsg.zh || quizChinese(round.aiMsg.en));
  const opts = shuffle([...round.options]);
  renderQuizOptions(opts);
  updateQuizProgress();
}

const QUIZ_ZH = Object.freeze({
  "Hello! Excuse me, I just arrived and I don't feel well at all. Can someone help me please?": "你好！对不起，我刚来，感觉不太舒服。有人可以帮我吗？",
  "Thank you so much! I've been feeling very weak and dizzy since this morning. I think I might have a fever too.": "太感谢了！从今天早上开始我就感觉非常虚弱和头晕。我想我也可能发烧了。",
  "Yes, I think I need to see a doctor. Can I register now? I'm not sure what to do.": "是的，我想我需要去看医生。我现在可以注册吗？我不知道该怎么办。",
  "I received a message from my doctor to come in today.": "我今天收到医生的消息，要我过来。",
  "Yes, just a regular check-up.": "是的，只是定期检查。",
  "I have done that at the front station already. What should I do next?": "我已经在前台做过了。接下来我应该做什么？",
  "Hello, I need to register. I've been having chest tightness and difficulty breathing since this afternoon.": "你好，我需要注册。从今天下午开始我就感觉胸闷、呼吸困难。",
  "My name is James Wilson. W-I-L-S-O-N. I don't have an appointment today, I came in suddenly.": "我叫詹姆斯·威尔逊。 W-I-L-S-O-N。我今天没有预约，是突然来的。",
  "Here is my passport. Number AB123456. I'm also on blood pressure medication called Lisinopril, 10mg daily.": "这是我的护照。编号 AB123456。我还服用赖诺普利降压药，每天 10 毫克。",
  "No allergies. But I have been feeling very hot since last night.": "没有过敏。但从昨晚开始我就感觉很热。",
  "Yes, I measured it at home and it was 38.5 degrees. It also hurts when I swallow.": "是的，我在家量了一下，是38.5度。吞咽的时候也很痛。",
  "About a 6, I think. That's all my symptoms.": "我想大约是6。这就是我的全部症状。",
  "Excuse me! I'm completely lost. I need to register first. Where should I go?": "打扰一下！我完全迷路了。我需要先注册。我应该去哪里？",
  "Room 19 on the first floor! Got it, thank you! After registration the doctor ordered blood tests. Where is the lab?": "一楼19号房间！明白了，谢谢！挂号后，医生要求进行血液检查。实验室在哪里？",
  "Room 11! Perfect! After the blood test, I need to pick up medicine. Where is the pharmacy?": "11号房间！完美的！验血后，我需要去拿药。药房在哪里？",
  "Oh, I also need to ask about my insurance coverage and pay some fees.": "哦，我还需要询问一下我的保险范围，并支付一些费用。",
  "Thank you. And my doctor said I need a chest X-ray too. Is it in this building?": "谢谢。我的医生说我也需要进行胸部 X 光检查。是在这栋楼里吗？",
  "Boonsom Martin Building... I'm not sure how to get there.": "文森·马丁大厦...我不知道怎么去那里。",
  "Hello, I'm a bit nervous. The doctor said I need some tests done. What do I need to do first?": "你好，我有点紧张。医生说我需要做一些检查。我首先需要做什么？",
  "Okay, I'm lying down. What's next? Should I do anything special?": "好吧，我躺着了。接下来怎么办？我应该做点什么特别的事情吗？",
  "I feel a little dizzy after the blood test. And my arm feels a bit sore.": "验血后我感觉有点头晕。而且我的手臂感觉有点酸痛。",
  "Okay, I'm waiting. The doctor is going to examine my chest now, right?": "好的，我等着。医生现在要检查我的胸部，对吗？",
  "Like this? *inhales heavily* Is there anything else I need to do during the ultrasound?": "像这样？ *重重吸气*在超声波检查过程中我还需要做什么吗？",
  "The examination is done. Thank you. Will I get the results today?": "检查结束了。谢谢。我今天能拿到结果吗？",
  "I feel dizzy after the blood test. What should I do?": "验血后我感到头晕。我应该怎么办？",
  "The examination is finished. Can I go home now?": "检查结束了。我现在可以回家了吗？",
  "Thank you. I understand the instructions.": "谢谢。我理解说明。",
  "Hello, welcome to our hospital! How can I help you today?": "您好，欢迎来到我院！今天我能为您提供什么帮助？",
  "Please lie down on the examination bed.": "请躺在检查床上。",
  "The pharmacy is on the 1st floor.": "药房位于一楼。",
  "Do you have any allergies?": "你有过敏吗？",
  "I'm sorry to hear that. Are you here for a check-up? Please follow me to register.": "听到这个消息我很遗憾。你来这里是为了检查吗？请跟我一起报名。",
  "Please take a deep breath.": "请深呼吸。",
  "What is your phone number?": "你的电话号码是什么？",
  "Please wait for the test results.": "请等待测试结果。",
  "Of course! Please wait here for a moment. I'll help you with registration right away.": "当然！请在这里稍等一下。我会立即帮助您注册。",
  "Take this medicine twice a day after meals.": "这种药每天两次，饭后服用。",
  "Please roll up your sleeve.": "请卷起袖子。",
  "Good morning! How are you feeling today?": "早上好！你今天感觉怎么样？",
  "Are you here for a check-up?": "你来这里是为了检查吗？",
  "Sorry for the delay.": "抱歉耽搁了。",
  "Please follow me.": "请跟我来。",
  "Have you checked your blood pressure, weight and height?": "您检查过血压、体重和身高吗？",
  "Are you currently taking any medication?": "您目前正在服用任何药物吗？",
  "Please wait here for a moment. The nurse will call you soon.": "请在这里稍等一下。护士很快就会给您打电话。",
  "How severe is the pain?": "疼痛有多严重？",
  "Tell me if you feel dizzy.": "如果你感到头晕请告诉我。",
  "Hello, welcome to our hospital.": "您好，欢迎来到我们医院。",
  "May I have your full name, please?": "请问您的全名吗？",
  "Please lie down on the bed.": "请躺在床上。",
  "Please follow me to the X-ray room.": "请跟我到X光室。",
  "Can I see your passport or ID card, please?": "我可以看一下您的护照或身份证吗？",
  "Please take a deep breath in and hold.": "请深吸一口气并屏住。",
  "Please follow the signs to the laboratory.": "请按照指示牌前往实验室。",
  "Please sit still.": "请坐好。",
  "Thank you. Do you have any allergies to medication?": "谢谢。您对药物有过敏吗？",
  "Please do not move during the scan.": "扫描期间请不要移动。",
  "Please go straight ahead and turn left.": "请一直向前走，然后左转。",
  "Good morning! Welcome to our hospital.": "早上好！欢迎来到我们医院。",
  "Do you have a fever?": "你发烧了吗？",
  "Please sign here.": "请在这里签名。",
  "How severe is the pain? On a scale of 1 to 10.": "疼痛有多严重？评分范围为 1 到 10。",
  "Where does it hurt?": "哪里疼？",
  "The screen will show your queue number.": "屏幕将显示您的队列号码。",
  "Could you repeat that, please?": "你再说一遍，好吗？",
  "Please take a seat. The nurse will call you soon.": "请坐。护士很快就会给您打电话。",
  "Please fill in this form.": "请填写这张表格。",
  "When did the symptoms start?": "症状是什么时候开始出现的？",
  "We need to check your vital signs first.": "我们需要先检查你的生命体征。",
  "Please register at the Medical Records Room, number 19, 1st floor, Chalerm Phra Baramee Building.": "请在 Chalerm Phra Baramee 大楼 1 楼 19 号病历室登记。",
  "I am going to check your blood pressure now.": "我现在要检查你的血压。",
  "Do you have an appointment today?": "今天有预约吗？",
  "The laboratory, room number 11, is on the first floor of Chalerm Phra Baramee Building.": "该实验室位于 Chalerm Phra Baramee 大楼一楼，室号 11。",
  "Please fill in this form first.": "请先填写此表格。",
  "Please do not move.": "请不要动。",
  "The pharmacy, number 30, is on the 1st floor. Please follow the signs.": "药房位于 1 楼 30 号。请遵循标志。",
  "Please wait for the test results first.": "请先等待测试结果。",
  "Please contact customer service centre, 1st floor, Chalerm Phra Baramee Building.": "请联系Chalerm Phra Baramee 大厦一楼的客户服务中心。",
  "X-ray is at room number 33.": "X光检查地点是33号房间。",
  "X-ray is at room number 33 on the first floor of Boonsom Martin Building.": "X 光检查地点为 Boonsom Martin Building 一楼 33 号房间。",
  "The pharmacy number 30 is on the first floor.": "30号药房位于一楼。",
  "Please lie down.": "请躺下。",
  "Please register at the Medical Records Room.": "请到病历室登记。",
  "Please follow the signs.": "请遵循标志。",
  "The laboratory room number 11 is on the first floor.": "11号实验室位于一楼。",
  "Please lie down on the bed. I'll check your blood pressure first.": "请躺在床上。我先检查一下你的血压。",
  "Please register at room 19 on the 1st floor.": "请到一楼19室报到。",
  "Please roll up your sleeve. I am going to check your blood pressure.": "请卷起袖子。我要检查一下你的血压。",
  "Please go straight and turn left to the X-ray room.": "请直行并左转至X光室。",
  "Tell me if you feel more dizzy. Please sit still and wait for a moment.": "告诉我你是否感到更头晕。请稍等片刻。",
  "Please follow the signs to the pharmacy on the 1st floor.": "请按照指示牌前往一楼药房。",
  "Hello, welcome to our hospital!": "您好，欢迎来到我院！",
  "Please fill in this registration form.": "请填写此注册表。",
  "I am going to check your blood pressure.": "我要检查一下你的血压。",
  "If you feel worse, please return immediately.": "如果您感觉更糟，请立即返回。",
  "Do you have any questions?": "您还有什么疑问吗？",
  "Please wait for the test results. Do you have any questions?": "请等待测试结果。您还有什么疑问吗？",
  "This may feel a little uncomfortable.": "这可能会让人感觉有点不舒服。",
  "Please follow me to the pharmacy.": "请跟我去药房。"
});
const quizZhMemory = new Map(Object.entries(QUIZ_ZH));

function quizChinese(text) {
  if (quizZhMemory.has(text)) return quizZhMemory.get(text);
  for (const scenario of scenarios) for (const phrase of scenario.phrases) if (phrase.en === text) return phrase.zh || '';
  return '';
}

function setQuizLanguage(lang) {
  quizDisplayLang = lang === 'zh' ? 'zh' : 'en';
  document.querySelectorAll('.quiz-lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.quizLang === quizDisplayLang));
  const rounds=quizRounds[chatScenarioId] || [];
  if (rounds[quizRoundIndex]) {
    const box=document.getElementById('chatBox');
    if (box) box.innerHTML='';
    showQuizRound(quizRoundIndex);
  }
}
function quizOptionText(text) { return quizDisplayLang === 'zh' ? (quizChinese(text) || 'ไม่พบคำแปลภาษาจีน กรุณาลองใหม่') : text; }
function quizOptionReading(text) { return quizDisplayLang === 'zh' ? genPhoneticsZh(quizOptionText(text)) : genPhonetics(text); }
function renderQuizOptions(opts) {
  currentQuizOpts = opts;
  currentQuizOpts.wrongAttempts = 0; 
  
  const wrap = document.getElementById('quizOptionsWrap');
  const labels = ['A', 'B', 'C', 'D'];
  wrap.innerHTML = `
    <div class="quiz-options-label"><i class="fas fa-hand-pointer"></i> ${quizDisplayLang === 'zh' ? 'บุคลากรควรพูดว่าอะไร? · 工作人员应该说什么？' : 'บุคลากรควรพูดว่าอะไร?'} (เลือก 1 ข้อ)</div>
    <div class="quiz-options-grid" id="quizOptGrid">
      ${opts.map((o, i) => `
        <button class="quiz-option-btn" id="qopt-${i}" data-idx="${i}">
          <span class="opt-num">${labels[i]}</span>
          <span class="quiz-option-copy"><span>${esc(quizOptionText(o.text))}</span><small class="quiz-option-thai">คำอ่าน: ${esc(quizOptionReading(o.text))}</small><span class="quiz-option-speak" title="ฟังเสียง" onclick="event.stopPropagation();speakText('${ea(quizOptionText(o.text))}','${quizDisplayLang === 'zh' ? 'zh' : 'en'}')"><i class="fas fa-volume-up"></i></span></span>
        </button>`).join('')}
    </div>`;

  document.getElementById('quizOptGrid').addEventListener('click', function(e) {
    const btn = e.target.closest('.quiz-option-btn');
    if (!btn) return;
    onQuizAnswer(parseInt(btn.dataset.idx, 10));
  });
}

function quizThai(text) {
  for (const scenario of scenarios) for (const phrase of scenario.phrases) if (phrase.en === text) return phrase.th || '';
  return '';
}
async function appendQuizThaiTranslation(originalText, displayedText, wrap) {
  const row=document.createElement('div');
  row.className='quiz-translation-row';
  row.innerHTML='<i class="fas fa-language"></i> <strong>คำแปลภาษาไทย:</strong> กำลังแปล…';
  wrap.appendChild(row);
  let thai=quizThai(originalText);
  if (!thai) {
    try { thai=await gTranslate(displayedText, quizDisplayLang === 'zh' ? 'zh-CN' : 'en', 'th'); } catch(e) { thai=''; }
  }
  row.innerHTML=thai
    ? `<i class="fas fa-language"></i> <strong>คำแปลภาษาไทย:</strong> ${esc(thai)}`
    : '<i class="fas fa-language"></i> <strong>คำแปลภาษาไทย:</strong> ไม่สามารถแปลได้ในขณะนี้';
}
function onQuizAnswer(clickedIdx) {
  if (quizAnswered) return;
  const opts = currentQuizOpts;
  if (!opts || !opts[clickedIdx]) return;

  if (typeof opts.wrongAttempts === 'undefined') {
    opts.wrongAttempts = 0;
  }

  const clicked = opts[clickedIdx];
  const isCorrect = clicked.correct;
  const hint = clicked.hint || '';
  const clickedOriginalText = clicked.text;
  const clickedText = quizOptionText(clickedOriginalText);
  const clickedSpeechLang = quizDisplayLang === 'zh' ? 'zh' : 'en';

  const grid = document.getElementById('quizOptGrid');
  if (!grid) return;
  const btns = grid.querySelectorAll('.quiz-option-btn');
  const wrap = document.getElementById('quizOptionsWrap');
  appendQuizThaiTranslation(clickedOriginalText, clickedText, wrap);

  quizAnswered = true;
  btns.forEach(b => b.disabled = true);

  if (isCorrect) {
    btns[clickedIdx].classList.add('correct-ans');

    quizScore++; 
    const scoreEl = document.getElementById('quizScoreText');
    if (scoreEl) scoreEl.textContent = `✓ ${quizScore} คะแนน`;

    const fb = document.createElement('div');
    fb.className = 'quiz-correct-row';
    fb.innerHTML = `<i class="fas fa-check-circle"></i> <span>ถูกต้อง! "${esc(clickedText)}" เป็นคำพูดที่เหมาะสมสำหรับสถานการณ์นี้</span>`;
    wrap.appendChild(fb);

    appendUserMsg(clickedText);
    speakText(clickedText, clickedSpeechLang);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'quiz-next-btn';
    const rounds = quizRounds[chatScenarioId] || [];
    const isLast = quizRoundIndex >= rounds.length - 1;
    nextBtn.innerHTML = isLast
      ? '<i class="fas fa-trophy"></i> ดูผลคะแนน'
      : '<i class="fas fa-arrow-right"></i> ข้อถัดไป';
    nextBtn.onclick = () => {
      quizRoundIndex++;
      document.getElementById('quizOptionsWrap').innerHTML = '';
      showQuizRound(quizRoundIndex);
    };
    wrap.appendChild(nextBtn);

  } else {
    opts.wrongAttempts++;
    btns[clickedIdx].classList.add('wrong-ans');

    const fb = document.createElement('div');
    fb.className = 'quiz-hint-row';
    fb.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span><strong>คำแนะนำ:</strong> ${esc(hint)}</span>`;
    wrap.appendChild(fb);

    if (opts.wrongAttempts >= 2) {
      const correctIdx = opts.findIndex(o => o.correct);
      if (correctIdx !== -1) {
        btns[correctIdx].classList.add('correct-ans');
      }

      const failMsg = document.createElement('div');
      failMsg.className = 'quiz-hint-row';
      failMsg.style.backgroundColor = '#fef2f2';
      failMsg.style.borderColor = '#fecaca';
      failMsg.style.color = '#dc2626';
      failMsg.innerHTML = `<i class="fas fa-times-circle" style="color: #dc2626;"></i> <span><strong>ตอบผิด 2 ครั้ง:</strong> ไม่ได้คะแนนในข้อนี้ (ข้อที่ถูกต้องคือข้อ ${['A','B','C','D'][correctIdx]})</span>`;
      wrap.appendChild(failMsg);

      const nextBtn = document.createElement('button');
      nextBtn.className = 'quiz-next-btn';
      const rounds = quizRounds[chatScenarioId] || [];
      const isLast = quizRoundIndex >= rounds.length - 1;
      nextBtn.innerHTML = isLast
        ? '<i class="fas fa-trophy"></i> ดูผลคะแนน'
        : '<i class="fas fa-arrow-right"></i> ข้อถัดไป';
      nextBtn.onclick = () => {
        quizRoundIndex++;
        document.getElementById('quizOptionsWrap').innerHTML = '';
        showQuizRound(quizRoundIndex);
      };
      wrap.appendChild(nextBtn);

    } else {
      setTimeout(() => {
        btns.forEach((b) => {
          if (!b.classList.contains('wrong-ans')) {
            b.disabled = false;
          }
        });
        quizAnswered = false; 
      }, 600);
    }
  }
}

function showQuizComplete() {
  const rounds = quizRounds[chatScenarioId] || [];
  const total = rounds.length;
  const pct = total > 0 ? Math.round((quizScore / total) * 100) : 0;
  let emoji = '🎉', msg = 'ยอดเยี่ยมมาก!';
  if (pct < 67) { emoji = '💪'; msg = 'ฝึกอีกนิดนะคะ!'; }
  else if (pct < 100) { emoji = '👍'; msg = 'ดีมากเลย!'; }

  const wrap = document.getElementById('quizOptionsWrap');
  wrap.innerHTML = `
    <div class="quiz-complete-box">
      <div class="quiz-complete-icon">${emoji}</div>
      <div class="quiz-complete-title">${msg}</div>
      <div class="quiz-complete-sub">คุณตอบถูก ${quizScore} จาก ${total} ข้อ</div>
      <div class="quiz-score-display">${pct}%</div>
      <div class="quiz-score-label">คะแนนรวม</div>
      <button class="btn-restart-quiz" onclick="initQuiz()">
        <i class="fas fa-redo"></i> เริ่มใหม่อีกรอบ
      </button>
    </div>`;

  const bar = document.getElementById('quizProgressFill');
  if (bar) bar.style.width = '100%';
}

function appendAiMsg(en, th, zh='') {
  const box = document.getElementById('chatBox');
  const primary = quizDisplayLang === 'zh' ? (zh || en) : en;
  const d = document.createElement('div');
  d.className = 'msg ai';
  d.innerHTML = `<div class="msg-avatar"><i class="fas fa-robot"></i></div>
    <div class="msg-content">
      ${th ? `<div class="msg-hint">${esc(th)}</div>` : ''}
      <div class="msg-bubble">${esc(primary)}</div>
      <div class="msg-phonetic">${esc(quizDisplayLang === 'zh' ? genPhoneticsZh(primary) : genPhonetics(primary))}</div>
      <button class="msg-listen" onclick="speakText('${ea(primary)}','${quizDisplayLang === 'zh' ? 'zh' : 'en'}')">▶ ฟัง</button>
    </div>`;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

function appendUserMsg(text) {
  const box = document.getElementById('chatBox');
  const d = document.createElement('div');
  d.className = 'msg user';
  d.innerHTML = `<div class="msg-content"><div class="msg-bubble">${esc(text)}</div></div>
    <div class="msg-user-avatar"><i class="fas fa-user-nurse"></i></div>`;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

/* ── Translate ────────────────────────────────────────────── */
function toggleTranslateMic() {
  const btn = document.getElementById('translateMicBtn');
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if(!SR) return;
  const lang = document.getElementById('fromLang').value;
  const rec = new SR(); rec.lang = speechLocale(lang); recRef = rec;
  rec.onstart = () => btn.classList.add('recording');
  rec.onresult = (e) => { let text=''; for(let i=e.resultIndex;i<e.results.length;i++) if(e.results[i].isFinal) text+=e.results[i][0].transcript; if(text){document.getElementById('translateInput').value=text.trim(); onTranslateInput();} };
  rec.onend = () => btn.classList.remove('recording');
  rec.start();
}
function onTranslateInput() {
  const text = document.getElementById('translateInput').value;
  document.getElementById('inputSpeakBtn').style.display = text ? 'flex' : 'none';
  clearTimeout(translateDebounce);
  if (!text.trim()) { setTransOutput(''); return; }
  setTransOutputLoading();
  translateDebounce = setTimeout(() => doTranslate(text), 600);
}
async function doTranslate(text) {
  try {
    const r = await gTranslate(text, document.getElementById('fromLang').value, document.getElementById('toLang').value);
    setTransOutput(r);
  } catch { setTransOutput('','[ไม่สามารถเชื่อมต่อได้]'); }
}
function setTransOutputLoading() {
  document.getElementById('translateOutput').innerHTML = `<div class="translate-loading"><div class="translate-spinner"></div> กำลังแปล...</div>`;
}
function setTransOutput(text, err='') {
  const el = document.getElementById('translateOutput');
  const toLang = document.getElementById('toLang').value;
  if (!text && !err) { el.innerHTML = '<p class="translate-placeholder">คำแปลจะปรากฏที่นี่...</p>'; return; }
  if (err) { el.innerHTML = `<p class="translate-placeholder">${esc(err)}</p>`; return; }
  const phonetic=toLang==='en' ? genPhonetics(text) : (toLang==='zh-CN' ? genPhoneticsZh(text) : '');
  const pronunciation=phonetic ? `<p class="translate-phonetic">${esc(phonetic)}</p>` : '';
  el.innerHTML = `<p class="translate-result">${esc(text)}</p>
    ${pronunciation}
    <div class="translate-out-actions">
      <button class="btn-out-action" onclick="speakText('${ea(text)}','${toLang}')"><i class="fas fa-volume-up"></i> ฟัง</button>
      <button class="btn-out-action" onclick="copyTrans('${ea(text)}')" id="copyBtn"><i class="fas fa-copy"></i> คัดลอก</button>
      <button class="btn-out-action" onclick="addTranslatedToPhrase('${ea(text)}')"><i class="fas fa-plus"></i> เพิ่มประโยค</button>
    </div>`;
}
async function addTranslatedToPhrase(translatedText) {
  const input = document.getElementById('translateInput').value.trim();
  const fromLang = document.getElementById('fromLang').value;
  const toLang = document.getElementById('toLang').value;
  const fieldByLang = { th:'f-th', en:'f-en', 'zh-CN':'f-zh', my:'f-my' };
  openAddModal();
  setTimeout(async () => {
    const fromField=document.getElementById(fieldByLang[fromLang]), toField=document.getElementById(fieldByLang[toLang]);
    if (fromField) fromField.value=input;
    if (toField) toField.value=translatedText;
    if (fromLang==='en') document.getElementById('f-phonetic-en').value=genPhonetics(input);
    if (fromLang==='zh-CN') document.getElementById('f-phonetic-zh').value=genPhoneticsZh(input);
    if (toLang==='en') document.getElementById('f-phonetic-en').value=genPhonetics(translatedText);
    if (toLang==='zh-CN') document.getElementById('f-phonetic-zh').value=genPhoneticsZh(translatedText);
    if (fromLang==='th') onModalThaiInput();
    else if (!document.getElementById('f-th').value) {
      try { document.getElementById('f-th').value = toLang==='th' ? translatedText : await gTranslate(input,fromLang,'th'); }
      catch(e) { document.getElementById('err-th').textContent='กรุณากรอกหรือแปลประโยคภาษาไทยก่อนบันทึก'; }
    }
  }, 100);
}
function speakTranslateInput() { speakText(document.getElementById('translateInput').value, document.getElementById('fromLang').value); }
function copyTrans(text) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('copyBtn'); if(!btn) return;
    btn.innerHTML = '<i class="fas fa-check"></i> คัดลอกแล้ว';
    setTimeout(() => { if(btn) btn.innerHTML = '<i class="fas fa-copy"></i> คัดลอก'; }, 1800);
  });
}
function swapLangs() {
  const f = document.getElementById('fromLang'), t = document.getElementById('toLang');
  const cur = document.querySelector('.translate-result'), inp = document.getElementById('translateInput');
  const swapText = cur ? cur.textContent : '';
  const tmp = f.value; f.value = t.value; t.value = tmp;
  if (swapText) { inp.value = swapText; document.getElementById('inputSpeakBtn').style.display = 'flex'; onTranslateInput(); }
}

function renderQuickPhrases() {
  const s = currentScenario();
  const wrap = document.getElementById('quickPhrases');
  if (!s.phrases.length) { wrap.innerHTML = ''; return; }
  wrap.innerHTML = `<div class="quick-label">ประโยคด่วน · ${esc(s.labelTh)}</div>
    ${s.phrases.slice(0,3).map(p => `
      <div class="quick-phrase-item">
        <div class="q-th">🇹🇭 ${esc(p.th)}</div>
        <div class="q-en" onclick="speakText('${ea(p.en)}','en')" style="cursor:pointer">
          <i class="fas fa-volume-up" style="color:var(--primary);margin-right:4px"></i> ${esc(p.en)}
        </div>
        ${p.phonetic_en ? `<div class="q-phonetic-en">${esc(p.phonetic_en)}</div>` : ''}
        <div class="q-zh" onclick="speakText('${ea(p.zh)}','zh')" style="cursor:pointer;margin-top:2px">
          <i class="fas fa-volume-up" style="color:var(--primary);margin-right:4px"></i> ${esc(p.zh)}
        </div>
        ${p.phonetic_zh ? `<div class="q-phonetic-zh">${esc(p.phonetic_zh)}</div>` : ''}
        <div class="q-my" onclick="speakText('${ea(p.my || '')}','my')" style="cursor:pointer;margin-top:4px">
          <i class="fas fa-volume-up" style="color:#7c3aed;margin-right:4px"></i> ${p.my ? esc(p.my) : '<span class="my-pending">กำลังเตรียมภาษาเมียนมาร์…</span>'}
        </div>
      </div>`).join('')}`;
}

/* ── Tabs ─────────────────────────────────────────────────── */
function switchTab(tabId, btnEl) {
  if (tabId !== 'ai-translator' && interpreterActive) stopInterpreter();
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  else { const b = document.querySelector('[data-tab="'+tabId+'"]'); if(b) b.classList.add('active'); }
  const panel = document.getElementById('panel-'+tabId); if(panel) panel.classList.add('active');
}

/* ── Speech Rate Control ──────────────────────────────────── */
function setSpeechRate(rate, key) {
  speechRate = rate;
  document.querySelectorAll('.card-speed-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.speed === key);
  });
}

function showSpeechNotice(message, retryAudio=null) {
  const notice=document.getElementById('speechNotice');
  if (!notice) { console.warn(message); return; }
  notice.replaceChildren(document.createTextNode(message));
  if (retryAudio) {
    const retry=document.createElement('button'); retry.type='button'; retry.textContent='เล่นเสียง';
    retry.onclick=()=>{
      try {
        retryAudio.currentTime=0;
        const attempt=retryAudio.play();
        if (attempt && typeof attempt.then==='function') attempt.then(()=>notice.classList.remove('visible')).catch(()=>{retry.textContent='ยังเล่นไม่ได้';});
      } catch(e) { retry.textContent='ยังเล่นไม่ได้'; }
    };
    notice.appendChild(retry);
    retryAudio.controls=true;
    retryAudio.setAttribute('aria-label','ตัวเล่นเสียงสำรอง');
    retryAudio.style.display='block';
    notice.appendChild(retryAudio);
  }
  notice.classList.add('visible');
  if (speechNoticeTimer) clearTimeout(speechNoticeTimer);
  speechNoticeTimer=retryAudio ? null : setTimeout(()=>notice.classList.remove('visible'),6000);
}
function makeSilentWavDataUri() {
  const samples=240, dataBytes=samples*2, buffer=new ArrayBuffer(44+dataBytes), view=new DataView(buffer), bytes=new Uint8Array(buffer);
  const text=(offset,value)=>{for(let i=0;i<value.length;i++)bytes[offset+i]=value.charCodeAt(i);};
  text(0,'RIFF'); view.setUint32(4,36+dataBytes,true); text(8,'WAVE'); text(12,'fmt '); view.setUint32(16,16,true);
  view.setUint16(20,1,true); view.setUint16(22,1,true); view.setUint32(24,8000,true); view.setUint32(28,16000,true);
  view.setUint16(32,2,true); view.setUint16(34,16,true); text(36,'data'); view.setUint32(40,dataBytes,true);
  return 'data:audio/wav;base64,'+btoa(String.fromCharCode(...bytes));
}
function primeGoogleAudioPlayback() {
  try {
    if (currentGoogleAudio) currentGoogleAudio.pause();
    if (interpreterPrimedAudio && interpreterPrimedAudio!==currentGoogleAudio) interpreterPrimedAudio.pause();
    const audio=new Audio(makeSilentWavDataUri()); audio.setAttribute('playsinline',''); audio.volume=0; currentGoogleAudio=audio; interpreterPrimedAudio=audio;
    const attempt=audio.play();
    if (attempt && typeof attempt.then==='function') {
      attempt.then(()=>{audio.pause();audio.currentTime=0;audio.volume=1;audio.dataset.userActivated='true';})
        .catch(()=>{audio.volume=1;if(currentGoogleAudio===audio)currentGoogleAudio=null;if(interpreterPrimedAudio===audio)interpreterPrimedAudio=null;});
    }
  } catch(e) { currentGoogleAudio=null; interpreterPrimedAudio=null; }
}
function playNativeMyanmarTts(text) {
  const synth=window.speechSynthesis;
  if (!synth || !text) return false;
  const voice=synth.getVoices().find(v=>/^my([-_]|$)/i.test(v.lang));
  if (!voice) return false;
  try {
    synth.cancel();
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang=voice.lang; utterance.voice=voice; utterance.rate=0.85;
    utterance.onstart=()=>document.getElementById('speechNotice')?.classList.remove('visible');
    utterance.onerror=()=>showSpeechNotice('เสียงภาษาเมียนมาร์ของอุปกรณ์เล่นไม่สำเร็จ');
    synth.speak(utterance);
    return true;
  } catch(e) { return false; }
}

function playNativeFallback(text, lang) {
  const synth=window.speechSynthesis;
  if (!synth || !text) return false;
  try {
    synth.cancel();
    const locale=speechLocale(lang);
    const voices=synth.getVoices ? synth.getVoices() : [];
    const voice=voices.find(v=>v.lang.replace('_','-').toLowerCase()===locale.toLowerCase())
      || voices.find(v=>v.lang.toLowerCase().startsWith(String(lang).toLowerCase()));
    // Never claim success when the device has no voice for the requested language.
    // This lets the Google/proxy path report a real failure and expose replay UI.
    if (!voice) return false;
    const utterance=new SpeechSynthesisUtterance(String(text));
    utterance.lang=locale; utterance.rate=lang==='th'?0.88:0.92; utterance.pitch=1; utterance.volume=1;
    if (voice) utterance.voice=voice;
    utterance.onerror=()=>{};
    synth.speak(utterance);
    return true;
  } catch(e) { return false; }
}

/* ── Burmese: local WAV for prepared phrases; Google TTS for new text ─ */
function playGoogleTts(text, tl, useInterpreterAudio=false) {
  if (!text) return null;
  try {
    const preparedPath=tl==='my' ? PREBUILT_MY_AUDIO_BY_TEXT[String(text).trim()] : '';
    const directUrl=preparedPath ? new URL(preparedPath,document.baseURI).href
      : 'https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob'
        +'&tl='+encodeURIComponent(tl)+'&q='+encodeURIComponent(text);
    // The preview/deployed app can provide /google-tts as a same-origin proxy;
    // this avoids Chromium blocking Google's audio host while retaining direct fallback.
    const configuredApi=String(window.HEAL_TRANSLATOR_API_BASE || '').replace(/\/+$/,'');
    const apiOrigin=configuredApi || location.origin;
    const proxyUrl=(!preparedPath && /^https?:$/.test(location.protocol))
      ? apiOrigin+'/google-tts?tl='+encodeURIComponent(tl)+'&q='+encodeURIComponent(text) : '';
    // Keep the v6 route: same-origin proxy first (works reliably on the
    // supplied server.py), then Google's direct audio as a browser fallback.
    const url=proxyUrl || directUrl;
    const backupUrl=proxyUrl ? directUrl : (preparedPath ? ''
      : 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob'
        +'&tl='+encodeURIComponent(tl)+'&q='+encodeURIComponent(text));
    const audio=(useInterpreterAudio && interpreterPrimedAudio) ? interpreterPrimedAudio : new Audio();
    if (currentGoogleAudio && currentGoogleAudio!==audio) currentGoogleAudio.pause();
    audio.pause();
    try { audio.currentTime=0; } catch(e) {}
    audio.setAttribute('playsinline',''); audio.preload='auto'; audio.volume=1;
    audio.playbackRate=Math.min(2.0,Math.max(0.5,speechRate+0.1));
    currentGoogleAudio=audio;
    audio.addEventListener('playing',()=>{
      const notice=document.getElementById('speechNotice');
      if (notice) notice.classList.remove('visible');
      if (speechNoticeTimer) clearTimeout(speechNoticeTimer);
    },{once:true});
    let retryCount=0;
    const loadAndPlay=(source)=>{
      audio.src=source; audio.load();
      audio.addEventListener('error',()=>{
        if (backupUrl && retryCount===0) { retryCount++; loadAndPlay(backupUrl); return; }
        if (tl==='th' && playNativeFallback(text,'th')) return;
        if (useInterpreterAudio && tl==='th') return;
        if (tl==='my' && !preparedPath && !useInterpreterAudio && playNativeMyanmarTts(text)) return;
        showSpeechNotice(`โหลดเสียง ${tl==='my'?'ภาษาเมียนมาร์':languageLabel(tl)} ไม่ได้ โปรดตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง`,audio);
      },{once:true});
      const start=()=>{
        const attempt=audio.play(); audio.playPromise=attempt;
        if (attempt && attempt.catch) attempt.catch(err=>{
          // Keep the same-origin proxy on autoplay denial; a later user tap can
          // replay this valid audio. Do not replace it with the blocked host.
          if (err?.name==='NotAllowedError') return;
          if (backupUrl && retryCount===0) { retryCount++; loadAndPlay(backupUrl); return; }
          if (tl==='th' && playNativeFallback(text,'th')) return;
          if (useInterpreterAudio && tl==='th') return;
          if (tl==='my' && !preparedPath && !useInterpreterAudio && playNativeMyanmarTts(text)) return;
          showSpeechNotice('เล่นเสียงไม่สำเร็จ โปรดตรวจอินเทอร์เน็ตและระดับเสียง แล้วลองอีกครั้ง',audio);
        });
      };
      if (audio.readyState>=3) start();
      else audio.addEventListener('canplay',start,{once:true});
    };
    loadAndPlay(url);
    return audio;
  } catch(e) {
    showSpeechNotice('ไม่สามารถเริ่มเสียงได้ โปรดตรวจระดับเสียงของอุปกรณ์');
    return null;
  }
}

/* ── Speech ───────────────────────────────────────────────── */
function speakText(text, lang) {
  if (!text) return;
  const synth = window.speechSynthesis;

  // Stop any previous Google TTS audio but keep the user-unlocked media element.
  if (currentGoogleAudio) { currentGoogleAudio.pause(); try { currentGoogleAudio.currentTime=0; } catch(e) {} }

  // Myanmar and Thai use the tested Google TTS route directly. Do not let a
  // silent/incorrect browser voice intercept Thai output.
  if (lang === 'my') { playGoogleTts(text,'my'); return; }
  if (lang === 'th') { playGoogleTts(text,'th'); return; }

  // No Web Speech API — use Google TTS for en/zh
  if (!synth) {
    const langMap2 = { 'en': 'en-US', 'zh': 'zh-CN', 'zh-CN': 'zh-CN', 'th': 'th-TH', 'my': 'my-MM' };
    playGoogleTts(text, langMap2[lang] || 'en-US');
    return;
  }

  synth.cancel();

  // Android Chrome requires a short gap after cancel() before speak()
  setTimeout(function () {
    const utt = new SpeechSynthesisUtterance(text);
    const langMap = { 'th': 'th-TH', 'en': 'en-US', 'zh': 'zh-CN', 'zh-CN': 'zh-CN', 'my': 'my-MM' };
    const targetLang = langMap[lang] || lang || 'en-US';
    utt.lang = targetLang;
    utt.rate = speechRate;
    utt.pitch = 1.0;
    utt.volume = 1.0;

    function pickVoiceAndSpeak() {
      const voices = synth.getVoices();
      let chosen = null;

      if (targetLang === 'en-US') {
        // Female US English — priority order (covers iOS, Android, Windows, macOS)
        const femaleUS = [
          'Samantha',           // macOS / iOS
          'Google US English',  // Android Chrome
          'Microsoft Zira Desktop', 'Microsoft Zira', // Windows
          'Karen',              // macOS (AU accent but female & clear)
          'Victoria', 'Moira', 'Fiona', 'Tessa'
        ];
        for (const name of femaleUS) {
          chosen = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
          if (chosen) break;
        }
        if (!chosen) chosen = voices.find(v => v.lang === 'en-US' || v.lang === 'en_US');
        if (!chosen) chosen = voices.find(v => v.lang.startsWith('en'));
        if (chosen) utt.voice = chosen;
        if (synth.paused) synth.resume();
        synth.speak(utt);

      } else if (targetLang === 'zh-CN') {
        // Female Mandarin — priority order
        const femaleZH = [
          'Ting-Ting', 'Tingting',            // macOS / iOS
          'Google 普通话（中国大陆）',            // Android Chrome (Simplified)
          'Google Chinese (Simplified)',
          'Microsoft Huihui Desktop', 'Microsoft Huihui', // Windows
          'Microsoft Yaoyao',
          'Mei-Jia', 'Li-mu', '普通话'
        ];
        for (const name of femaleZH) {
          chosen = voices.find(v => v.name.includes(name));
          if (chosen) break;
        }
        if (!chosen) chosen = voices.find(v => v.lang === 'zh-CN' || v.lang === 'zh_CN');
        if (!chosen) chosen = voices.find(v => v.lang.startsWith('zh'));

        if (chosen) {
          utt.voice = chosen;
          if (synth.paused) synth.resume();
          synth.speak(utt);
        } else {
          // No Chinese voice on this device — fall back to Google TTS Audio
          playGoogleTts(text, 'zh-CN');
        }

      } else {
        chosen = voices.find(v => v.lang.replace('_', '-') === targetLang);
        if (!chosen) chosen = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
        if (!chosen && targetLang === 'my-MM') { playGoogleTts(text, 'my'); return; }
        if (!chosen && targetLang === 'th-TH') { playGoogleTts(text, 'th'); return; }
        if (chosen) utt.voice = chosen;
        if (synth.paused) synth.resume();
        synth.speak(utt);
      }
    }

    const voices = synth.getVoices();
    if (voices.length > 0) {
      pickVoiceAndSpeak();
    } else {
      // Voices not yet loaded — wait for voiceschanged event
      let done = false;
      const onVC = function () {
        if (done) return;
        done = true;
        synth.removeEventListener('voiceschanged', onVC);
        pickVoiceAndSpeak();
      };
      synth.addEventListener('voiceschanged', onVC);
      // Safety fallback: if voices never fire, try Google TTS for zh
      setTimeout(function () {
        if (!done) {
          done = true;
          synth.removeEventListener('voiceschanged', onVC);
          if (targetLang === 'zh-CN') {
            playGoogleTts(text, 'zh-CN');
          } else {
            pickVoiceAndSpeak();
          }
        }
      }, 600);
    }
  }, 80); // 80 ms gap lets Android finish the cancel()
}

/* ── Room selection and usage analytics ───────────────────── */
function openRoomGate(initial) {
  roomChangeOnly = !initial;
  const gate = document.getElementById('roomGate');
  const select = document.getElementById('roomSelect');
  const custom = document.getElementById('customRoom');
  populateDepartmentOptions();
  if (currentRoom) {
    const option = [...select.options].find(o => o.value === currentRoom);
    if (option) { select.value = currentRoom; custom.value = ''; }
    else { select.value = '__custom__'; custom.value = currentRoom; }
  }
  document.getElementById('roomGateTitle').textContent = initial ? 'เลือกห้องตรวจก่อนเริ่ม' : 'เปลี่ยนห้องตรวจ';
  document.getElementById('roomStartBtn').innerHTML = initial ? '<i class="fas fa-play"></i> เริ่มใช้งาน' : '<i class="fas fa-check"></i> บันทึกห้องตรวจ';
  document.getElementById('roomCancelBtn').style.display = initial ? 'none' : 'inline-flex';
  gate.classList.add('open');
  toggleCustomRoom();
}
function populateDepartmentOptions() {
  const select = document.getElementById('roomSelect');
  select.innerHTML = DEPT_GROUPS.map(group => `<optgroup label="${esc(group.group)}">${group.items.map(item => `<option value="${item === 'อื่นๆ' ? '__custom__' : esc(item)}">${esc(item)}</option>`).join('')}</optgroup>`).join('');
}
function closeRoomGate() { if (currentRoom) document.getElementById('roomGate').classList.remove('open'); }
function toggleCustomRoom() {
  const custom = document.getElementById('customRoom');
  custom.style.display = document.getElementById('roomSelect').value === '__custom__' ? 'block' : 'none';
}
function confirmRoomAndStart() {
  const selected = document.getElementById('roomSelect').value;
  const room = selected === '__custom__' ? document.getElementById('customRoom').value.trim() : selected;
  if (!room) { document.getElementById('customRoom').focus(); return; }
  const shouldRecord = !roomChangeOnly || room !== currentRoom;
  currentRoom = room;
  localStorage.setItem('heal_english_active_room_v1', room);
  document.getElementById('activeRoomLabel').innerHTML = `<i class="fas fa-location-dot"></i> ${esc(room)}`;
  document.getElementById('roomGate').classList.remove('open');
  if (shouldRecord) recordUsageSession(room);
  roomChangeOnly = false;
}
function recordUsageSession(room) {
  const now = new Date();
  const log = { id: (crypto.randomUUID ? crypto.randomUUID() : `${now.getTime()}-${Math.random().toString(16).slice(2)}`), room, timestamp: now.toISOString(), dateKey: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`, dateLabel: new Intl.DateTimeFormat('th-TH',{day:'2-digit',month:'2-digit',year:'2-digit'}).format(now), count: 1 };
  syncUsageToSheet(log);
}
async function syncUsageToSheet(log) {
  try {
    await fetch(GOOGLE_SHEETS_ENDPOINT, { method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify(log), keepalive:true });
  } catch (err) {
    console.warn('Usage event could not be sent to the private reporting sheet.');
  }
}

/* ── Two-way live voice interpreter ───────────────────────── */
function speechLocale(lang) { return ({ th:'th-TH', en:'en-US', zh:'zh-CN', 'zh-CN':'zh-CN', my:'my-MM' })[lang] || lang; }
function languageLabel(lang) { return ({ th:'ภาษาไทย', en:'English', 'zh-CN':'中文', my:'မြန်မာ (เมียนมาร์)' })[lang] || lang; }
function detectInterpreterLanguage(text, expectedLang='th') {
  const value=String(text || '');
  if (/[\u0E00-\u0E7F]/.test(value)) return 'th';
  if (/[\u1000-\u109F]/.test(value)) return 'my';
  if (/[\u4E00-\u9FFF]/.test(value)) return 'zh-CN';
  if (/[A-Za-z]/.test(value)) return 'en';
  return expectedLang;
}
function bestRecognitionTranscript(result, expectedLang) {
  const alternatives=Array.from(result || []).map(item=>({
    text:String(item.transcript || '').trim(),
    confidence:Number(item.confidence) || 0,
    lang:detectInterpreterLanguage(item.transcript,expectedLang)
  })).filter(item=>item.text);
  if (!alternatives.length) return '';
  const top=alternatives[0];
  const expected=alternatives.find(item=>item.lang===expectedLang);
  const foreign=alternatives.find(item=>item.lang!==expectedLang && ['th','en','zh-CN','my'].includes(item.lang));
  if (foreign && !expected) return foreign.text;
  if (foreign && foreign.confidence>0 && foreign.confidence>=(expected?.confidence || top.confidence)-0.15) return foreign.text;
  return top.text;
}
function patientLanguage() { return document.getElementById('interpreterLang').value; }
function onInterpreterLanguageChange() {
  if (!interpreterActive) {
    const startsWithPatient=document.getElementById('interpreterFirstTurn').value==='patient';
    document.getElementById('interpreterStatus').textContent=startsWithPatient
      ? `เลือก ${languageLabel(patientLanguage())} แล้ว · เริ่มฟังผู้ป่วยก่อน`
      : `เลือก ${languageLabel(patientLanguage())} แล้ว · เริ่มฟังบุคลากรพูดภาษาไทยก่อน`;
    return;
  }
  document.getElementById('interpreterStatus').textContent=`เปลี่ยนภาษาผู้ป่วยเป็น ${languageLabel(patientLanguage())}`;
  if (interpreterNextLang === 'th') return;
  interpreterNextLang=patientLanguage();
  restartInterpreterRecognitionForNewTurn();
}
function onInterpreterFirstTurnChange() {
  if (interpreterActive) return;
  const first=document.getElementById('interpreterFirstTurn').value;
  document.getElementById('interpreterStatus').textContent=first==='patient'
    ? `เริ่มฟังผู้ป่วยก่อน (${languageLabel(patientLanguage())})`
    : 'เริ่มฟังบุคลากรพูดภาษาไทยก่อน';
}
function updateInterpreterTurn() {
  const source = interpreterNextLang;
  document.getElementById('interpreterTurn').textContent = interpreterActive ? `กำลังฟัง: ${languageLabel(source)} · อีกฝั่งจะได้ยินคำแปล` : 'พร้อมเริ่มสนทนา';
  document.getElementById('interpreterSourceLabel').textContent = `สิ่งที่ได้ยิน (${languageLabel(source)})`;
  const avatar=document.getElementById('interpreterAvatar');
  avatar.classList.toggle('listening', interpreterActive && !interpreterBusy);
  avatar.classList.toggle('speaking', interpreterActive && interpreterBusy);
  avatar.setAttribute('aria-label', interpreterActive ? (interpreterBusy ? 'AI ล่ามกำลังแปลหรือพูด' : 'AI ล่ามกำลังฟัง') : 'AI ล่ามพร้อมสนทนา');
  const swapBtn=document.getElementById('interpreterSwapBtn');
  if (swapBtn) swapBtn.disabled=!interpreterActive || interpreterBusy;
}
function startInterpreter() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { document.getElementById('interpreterStatus').textContent = 'เบราว์เซอร์นี้ไม่รองรับการรู้จำเสียง ลองใช้ Chrome รุ่นใหม่ผ่าน HTTPS'; return; }
  if (interpreterRestartTimer) { clearTimeout(interpreterRestartTimer); interpreterRestartTimer=null; }
  interpreterSessionToken++;
  interpreterActive = true; interpreterBusy = false;
  interpreterNextLang = document.getElementById('interpreterFirstTurn').value === 'patient' ? patientLanguage() : 'th';
  primeGoogleAudioPlayback();
  document.getElementById('interpreterStartBtn').disabled = true;
  document.getElementById('interpreterStopBtn').disabled = false;
  document.getElementById('interpreterSwapBtn').disabled = false;
  document.getElementById('interpreterSourceText').textContent = '—';
  document.getElementById('interpreterTranslatedText').textContent = '—';
  document.getElementById('interpreterStatus').textContent = `เริ่ม AI Translator · กำลังฟัง ${languageLabel(interpreterNextLang)} · กรุณาพูดทีละคน`;
  updateInterpreterTurn(); startInterpreterRecognition();
}
function scheduleInterpreterRecognition(delay=120) {
  if (interpreterRestartTimer) clearTimeout(interpreterRestartTimer);
  interpreterRestartTimer=setTimeout(() => {
    interpreterRestartTimer=null;
    startInterpreterRecognition();
  },delay);
}
function startInterpreterRecognition() {
  if (!interpreterActive || interpreterBusy) return;
  if (interpreterRecognition) return;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  let rec=null;
  const sessionToken=interpreterSessionToken;
  try {
    rec = new SR(); interpreterRecognition = rec;
    rec.lang = speechLocale(interpreterNextLang); rec.continuous = false; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onstart = () => { if(sessionToken!==interpreterSessionToken || interpreterRecognition!==rec) return; document.getElementById('interpreterStatus').textContent = `กำลังฟัง ${languageLabel(interpreterNextLang)}…`; updateInterpreterTurn(); };
    rec.onresult = event => {
      if (sessionToken!==interpreterSessionToken || interpreterRecognition!==rec || !interpreterActive) return;
      let finalText = '';
      for (let i=event.resultIndex;i<event.results.length;i++) {
        if (event.results[i].isFinal) finalText += `${bestRecognitionTranscript(event.results[i],interpreterNextLang)} `;
      }
      if (finalText.trim()) {
        handleInterpreterUtterance(finalText.trim(), interpreterNextLang);
        try { rec.stop(); } catch(e) {}
      }
    };
    rec.onerror = event => {
      if (sessionToken!==interpreterSessionToken || interpreterRecognition!==rec) return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') { document.getElementById('interpreterStatus').textContent = 'ไมโครโฟนไม่ได้รับอนุญาต กรุณาเปิดสิทธิ์ไมโครโฟนในการตั้งค่าเบราว์เซอร์'; stopInterpreter(); }
      else if (event.error === 'language-not-supported') { const msg=`อุปกรณ์/เบราว์เซอร์ไม่รองรับการรู้จำ ${languageLabel(interpreterNextLang)}; ลองใช้ Chrome หรือใช้โหมดแปลแบบกดไมค์`; stopInterpreter(); document.getElementById('interpreterStatus').textContent = msg; }
      else if (event.error !== 'no-speech' && event.error !== 'aborted') document.getElementById('interpreterStatus').textContent = `มีปัญหาการรับเสียง (${event.error}) กำลังลองใหม่…`;
    };
    rec.onend = () => {
      if (interpreterRecognition===rec) interpreterRecognition=null;
      // An old recognizer can fire onend after the user has pressed Swap.
      // Never let that stale callback schedule a competing session.
      if (sessionToken!==interpreterSessionToken) return;
      if (interpreterActive && !interpreterBusy) scheduleInterpreterRecognition(140);
    };
    rec.start();
  } catch (err) {
    if (interpreterRecognition===rec) interpreterRecognition=null;
    if (!interpreterActive) return;
    if (err && ['NotAllowedError','SecurityError'].includes(err.name)) {
      stopInterpreter();
      document.getElementById('interpreterStatus').textContent = 'ไมโครโฟนไม่ได้รับอนุญาต กรุณาเปิดสิทธิ์ไมโครโฟนในการตั้งค่าเบราว์เซอร์';
    } else {
      document.getElementById('interpreterStatus').textContent = 'กำลังเชื่อมต่อไมโครโฟนใหม่…';
      scheduleInterpreterRecognition(700);
    }
  }
}
async function handleInterpreterUtterance(text, sourceLang) {
  if (!interpreterActive || interpreterBusy) return;
  const sessionToken=interpreterSessionToken;
  const expectedTurnLang=sourceLang;
  const selectedPatientLang=patientLanguage();
  const allowedLangs=new Set(['th',selectedPatientLang]);
  const detected=detectInterpreterLanguage(text,expectedTurnLang);
  // SpeechRecognition was configured with the selected locale. Trust that locale
  // unless the transcript is unmistakably written in a third script.
  const scriptMismatch=(detected!==expectedTurnLang && /[\u4E00-\u9FFF\u1000-\u109F\u0E00-\u0E7F]/u.test(text));
  sourceLang = scriptMismatch ? detected : expectedTurnLang;
  // Recognition is constrained to the selected pair; never send a third language
  // to the translator under the wrong source-language label.
  if (!allowedLangs.has(sourceLang)) {
    interpreterBusy=false;
    document.getElementById('interpreterSourceText').textContent=text;
    document.getElementById('interpreterStatus').textContent=`ตรวจพบ ${languageLabel(detected)} ซึ่งไม่อยู่ในคู่ภาษาที่เลือก · กรุณาพูด ${languageLabel(expectedTurnLang)} หรือกดสลับภาษา`;
    updateInterpreterTurn();
    return;
  }
  interpreterBusy = true; updateInterpreterTurn();
  const targetLang = sourceLang === 'th' ? selectedPatientLang : 'th';
  document.getElementById('interpreterSourceText').textContent = text;
  document.getElementById('interpreterSourceLabel').textContent = `ตรวจพบภาษา: ${languageLabel(sourceLang)}`;
  document.getElementById('interpreterTurn').textContent = `ตรวจพบ ${languageLabel(sourceLang)} · กำลังแปลไป ${languageLabel(targetLang)}`;
  document.getElementById('interpreterTranslatedText').textContent = 'กำลังแปล…';
  document.getElementById('interpreterStatus').textContent = `กำลังแปล ${languageLabel(sourceLang)} → ${languageLabel(targetLang)}…`;
  try {
    const translated = await gTranslate(text, sourceLang, targetLang);
    if (!interpreterActive || sessionToken !== interpreterSessionToken) return;
    document.getElementById('interpreterTranslatedText').textContent = translated;
    document.getElementById('interpreterStatus').textContent = `กำลังพูดคำแปล ${languageLabel(targetLang)}…`;
    await interpreterSpeak(translated, targetLang);
    if (interpreterActive && sessionToken === interpreterSessionToken) {
      document.getElementById('interpreterStatus').textContent = `แปลแล้ว · ยังคงฟัง ${languageLabel(interpreterNextLang)} อยู่ · กดสลับภาษาที่ฟังเมื่อต้องการเปลี่ยนฝั่ง`;
    }
  } catch (err) {
    if (sessionToken === interpreterSessionToken) {
      document.getElementById('interpreterTranslatedText').textContent = 'แปลไม่สำเร็จ กรุณาพูดซ้ำ';
      document.getElementById('interpreterStatus').textContent = 'เชื่อมต่อบริการแปลไม่ได้ — ตรวจสอบอินเทอร์เน็ตแล้วพูดซ้ำ';
    }
  } finally {
    if (sessionToken === interpreterSessionToken) {
      interpreterBusy = false; updateInterpreterTurn();
      if (interpreterActive) scheduleInterpreterRecognition(100);
    }
  }
}
function splitInterpreterSpeech(text, limit=150) {
  let remaining=String(text || '').trim();
  const parts=[], minimum=Math.floor(limit*0.55);
  while (remaining.length>limit) {
    const head=remaining.slice(0,limit+1);
    let cut=0, match;
    const sentenceBreak=/[.!?。！？၊။]+[”’"')\]]*/gu;
    while ((match=sentenceBreak.exec(head))) {
      const end=match.index+match[0].length;
      if (end>=minimum && end<=limit) cut=end;
    }
    if (cut<minimum) {
      const phraseBreak=/[,，、;；:：\s]+/gu;
      while ((match=phraseBreak.exec(head))) {
        const end=match.index+match[0].length;
        if (end>=minimum && end<=limit) cut=end;
      }
    }
    if (cut<minimum) cut=limit;
    if (/^[\uDC00-\uDFFF]$/.test(remaining.charAt(cut))) cut--;
    const part=remaining.slice(0,cut).trim();
    if (!part) { cut=limit; }
    parts.push(part || remaining.slice(0,cut).trim());
    remaining=remaining.slice(cut).trim();
  }
  if (remaining) parts.push(remaining);
  return parts;
}
function interpreterSpeechWatchdog(text) {
  // Do not block the next listening turn on a browser audio event.
  return Math.max(2600,Math.min(5000,String(text || '').length*55));
}
function speakInterpreterGoogleChunk(text, lang) {
  return new Promise(resolve => {
    const audio=playGoogleTts(text,lang,true);
    if (!audio) { resolve(false); return; }
    let finished=false, watchdog=null, ok=false;
    const done=(success=false)=>{
      if (finished) return;
      finished=true; ok=success;
      if (watchdog) clearTimeout(watchdog);
      if (audio._interpreterFinish===done) audio._interpreterFinish=null;
      resolve(ok);
    };
    audio._interpreterFinish=done;
    audio.addEventListener('playing',()=>{ ok=true; },{once:true});
    audio.addEventListener('ended',()=>done(true),{once:true});
    audio.addEventListener('error',()=>done(false),{once:true});
    // playPromise is assigned asynchronously after canplay on Safari; attach
    // a short safety timer so a blocked audio element cannot stop recognition.
    if (audio.playPromise && typeof audio.playPromise.catch==='function') audio.playPromise.catch(()=>done(false));
    watchdog=setTimeout(()=>done(ok),interpreterSpeechWatchdog(text));
  });
}
function speakInterpreterNativeChunk(text, lang, locale, voice) {
  return new Promise(resolve => {
    const synth=window.speechSynthesis;
    let finished=false, watchdog=null;
    const done=()=>{
      if (finished) return;
      finished=true;
      if (watchdog) clearTimeout(watchdog);
      resolve();
    };
    const fallback=()=>{
      if (finished) return;
      finished=true;
      if (watchdog) clearTimeout(watchdog);
      if (!interpreterActive) { resolve(); return; }
      try { synth.cancel(); } catch(e) {}
      speakInterpreterGoogleChunk(text,lang).then(resolve,resolve);
    };
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang=locale; utterance.rate=0.9; utterance.voice=voice;
    utterance.onend=done;
    utterance.onerror=fallback;
    watchdog=setTimeout(fallback,interpreterSpeechWatchdog(text));
    try { synth.speak(utterance); } catch(e) { fallback(); }
  });
}
async function getInterpreterVoice(synth, lang, locale) {
  if (!synth || lang === 'my') return null;
  const find=()=>{
    const voices=synth.getVoices() || [];
    return voices.find(v=>v.lang.replace('_','-').toLowerCase()===locale.toLowerCase())
      || voices.find(v=>v.lang.toLowerCase().startsWith(lang.toLowerCase())) || null;
  };
  let voice=find();
  if (voice) return voice;
  // On GitHub Pages, Chrome often populates voices after the first user gesture.
  // Wait briefly instead of immediately falling back to an autoplay-sensitive URL.
  await new Promise(resolve=>{
    let settled=false;
    const finish=()=>{ if(settled) return; settled=true; synth.removeEventListener('voiceschanged',finish); clearTimeout(timer); resolve(); };
    const timer=setTimeout(finish,1200);
    synth.addEventListener('voiceschanged',finish);
  });
  return find();
}
async function interpreterSpeak(text, lang) {
  const chunks=splitInterpreterSpeech(text);
  if (!chunks.length) return;
  const synth=window.speechSynthesis;
  if (synth) { try { synth.cancel(); } catch(e) {} }
  // Use the already-unlocked Google/proxy audio element for every translated
  // language. Safari can expose a SpeechSynthesis voice but still produce no
  // sound after an async translation; Google TTS is the consistent primary.
  // Native voice remains a fallback for English/Chinese/Thai when audio is
  // blocked by a browser policy. Burmese stays on Google TTS because native
  // Burmese voices are not consistently available on iOS/Android.
  for (const chunk of chunks) {
    if (!interpreterActive) return;
    const played=await speakInterpreterGoogleChunk(chunk,lang);
    if (!played && synth && lang !== 'my') {
      const locale=speechLocale(lang);
      const voice=await getInterpreterVoice(synth,lang,locale);
      if (voice) await speakInterpreterNativeChunk(chunk,lang,locale,voice);
    }
  }
}
function speakInterpreterSource() {
  const text=document.getElementById('interpreterSourceText')?.textContent.trim();
  if (text && text !== '—') speakText(text, interpreterNextLang);
}
function speakInterpreterTranslation() {
  const text=document.getElementById('interpreterTranslatedText')?.textContent.trim();
  if (text && text !== '—' && text !== 'กำลังแปล…') speakText(text, interpreterNextLang === 'th' ? patientLanguage() : 'th');
}
function restartInterpreterRecognitionForNewTurn() {
  if (interpreterRestartTimer) { clearTimeout(interpreterRestartTimer); interpreterRestartTimer=null; }
  // Invalidate every callback belonging to the previous language session.
  interpreterSessionToken++;
  const old=interpreterRecognition;
  interpreterRecognition=null;
  try { if(old) old.onend=null; if(old) old.abort(); } catch(e) {}
  interpreterBusy=false;
  updateInterpreterTurn();
  // Safari/Chrome both need a short stop/start gap after abort().
  scheduleInterpreterRecognition(520);
}
function switchInterpreterTurn() {
  if (!interpreterActive || interpreterBusy) return;
  interpreterNextLang = interpreterNextLang === 'th' ? patientLanguage() : 'th';
  document.getElementById('interpreterStatus').textContent=`สลับแล้ว · กำลังเริ่มฟัง ${languageLabel(interpreterNextLang)}…`;
  restartInterpreterRecognitionForNewTurn();
}
function stopInterpreter() {
  interpreterSessionToken++;
  interpreterActive = false; interpreterBusy = false;
  if (interpreterRestartTimer) { clearTimeout(interpreterRestartTimer); interpreterRestartTimer=null; }
  try { if(interpreterRecognition) interpreterRecognition.abort(); } catch(e) {}
  if(window.speechSynthesis) window.speechSynthesis.cancel();
  const activeAudio=currentGoogleAudio;
  if(activeAudio){if(activeAudio._interpreterFinish)activeAudio._interpreterFinish();activeAudio.pause();currentGoogleAudio=null;}
  if(interpreterPrimedAudio){if(interpreterPrimedAudio!==activeAudio)interpreterPrimedAudio.pause();interpreterPrimedAudio=null;}
  document.getElementById('interpreterStartBtn').disabled = false;
  document.getElementById('interpreterStopBtn').disabled = true;
  document.getElementById('interpreterSwapBtn').disabled = true;
  document.getElementById('interpreterStatus').textContent = 'หยุดล่ามแล้ว'; updateInterpreterTurn();
}

/* ── Helpers ──────────────────────────────────────────────── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function ea(s) {
  if (!s) return '';
  return String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'\\"');
}

window.addEventListener('DOMContentLoaded', init);
