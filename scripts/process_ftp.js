/**
 * GTS Weather Bulletin Ingestion & Processor Script
 * ------------------------------------------------
 * อ่านไฟล์ข่าวสภาพอากาศดิบจาก FTP/received
 * จัดรูปแบบ ZCZC ... NNNN ตามมาตรฐาน GTS
 * ย้ายจัดเก็บลง FTP/<ปีพ.ศ.>/<หมวดหมู่>/<DD-MMMYY.TXT>
 */

const fs = require('fs');
const path = require('path');

const BASE_FTP_DIR = process.env.FTP_DIR || path.join(__dirname, '..', 'FTP');
const RECEIVED_DIR = path.join(BASE_FTP_DIR, 'received');

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// หมวดหมู่ไฟล์ข่าว GTS ตามตัวอักษรนำหน้า
const BULLETIN_PREFIX_MAP = {
  SA: 'Metar',      // ข่าว METAR อากาศการบิน
  SP: 'Metar',      // ข่าว SPECI อากาศการบินพิเศษ
  SM: 'Synoptic',   // ข่าว Synoptic
  SI: 'Synoptic',   // ข่าว Synoptic 
  SN: 'Synoptic',   // ข่าว Synoptic
  WW: 'Warning',    // ข่าวเตือนภัย Warning
  WO: 'Warning',    // ข่าวเตือนภัย Warning
  WS: 'Warning',    // ข่าว SIGMET
  WC: 'Warning',    // ข่าว Tropical Cyclone
  WV: 'Warning',    // ข่าว Volcanic Ash
  US: 'UpperAir',   // ข่าว Upper Air
  UL: 'UpperAir',   // ข่าว Upper Air
  UK: 'UpperAir',   // ข่าว Upper Air
  UG: 'UpperAir',   // ข่าว Upper Air
  UQ: 'UpperAir',   // ข่าว Upper Air
  NT: 'Notes',      // Note ท้ายข่าว
};

function processFtpFiles() {
  if (!fs.existsSync(RECEIVED_DIR)) {
    fs.mkdirSync(RECEIVED_DIR, { recursive: true });
    return;
  }

  const files = fs.readdirSync(RECEIVED_DIR);
  if (files.length === 0) return;

  const now = new Date();
  const dayStr = String(now.getDate()).padStart(2, '0');
  const monthStr = MONTH_NAMES[now.getMonth()];
  const yearBE = String(now.getFullYear() + 543);
  const year2D = String(now.getFullYear()).substring(2);

  // ชื่อไฟล์ปลายทาง e.g. 11-AUG26.TXT
  const outFileName = `${dayStr}-${monthStr}${year2D}.TXT`;

  for (const file of files) {
    const filePath = path.join(RECEIVED_DIR, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) continue;

    // ตรวจสอบตัวอักษรนำหน้า e.g. SA, SM, WW
    const prefix = file.substring(0, 2).toUpperCase();
    const categoryFolder = BULLETIN_PREFIX_MAP[prefix] || 'Metar';

    const targetFolder = path.join(BASE_FTP_DIR, yearBE, categoryFolder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const targetFilePath = path.join(targetFolder, outFileName);

    try {
      const rawContent = fs.readFileSync(filePath, 'utf-8').trim();

      // สร้างข้อความรูปแบบ GTS (ZCZC ... NNNN)
      const formattedEntry = `ZCZC\r\n${rawContent}\r\n\r\nNNNN\r\n\r\n`;

      // ต่อท้ายไฟล์ปลายทาง (Append)
      fs.appendFileSync(targetFilePath, formattedEntry, 'utf-8');

      // ลบไฟล์ดิบต้นทางออก
      fs.unlinkSync(filePath);
      console.log(`[INGEST] Processed ${file} -> ${categoryFolder}/${outFileName}`);
    } catch (err) {
      console.error(`[ERROR] Failed to process ${file}:`, err);
    }
  }
}

// เรียกทำงาน
processFtpFiles();
