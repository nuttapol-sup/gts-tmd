/**
 * GTS Weather Bulletin & Note Ingestion Processor Script
 * ------------------------------------------------------
 * อ่านไฟล์ข่าวสภาพอากาศดิบ และไฟล์ NOTE จาก FTP/received
 * 1. ข่าวสภาพอากาศ (SA, SM, WW, ฯลฯ) -> เพิ่ม ZCZC...NNNN ย้ายเข้า FTP/<ปีพ.ศ.>/<หมวดหมู่>/<DD-MMMYY.TXT>
 * 2. ข่าว NOTE (NOTE*.*) -> เพิ่ม ZCZC...NNNN ย้ายเข้า FTP/<ปีพ.ศ.>/Note/<DD-MMMYY.T<T>> และสำเนา N<T>.TXT
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
  NOTE: 'Notes',    // Note ท้ายข่าว
};

// คำนวณหา UTC Cycle Hour (00, 03, 06, 09, 12, 15, 18, 21)
function getUtcCycleHour(hourNum) {
  if (hourNum >= 21) return '21';
  if (hourNum >= 18) return '18';
  if (hourNum >= 15) return '15';
  if (hourNum >= 12) return '12';
  if (hourNum >= 9)  return '09';
  if (hourNum >= 6)  return '06';
  if (hourNum >= 3)  return '03';
  return '00';
}

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
  const utcCycle = getUtcCycleHour(now.getUTCHours());

  for (const file of files) {
    const filePath = path.join(RECEIVED_DIR, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) continue;

    const fileUpper = file.toUpperCase();
    const isNoteFile = fileUpper.startsWith('NOTE');

    try {
      const rawContent = fs.readFileSync(filePath, 'utf-8').trim();
      const formattedEntry = `ZCZC\r\n${rawContent}\r\n\r\nNNNN\r\n\r\n`;

      if (isNoteFile) {
        // ประมวลผลไฟล์ NOTE*.*
        const targetFolder = path.join(BASE_FTP_DIR, yearBE, 'Note');
        if (!fs.existsSync(targetFolder)) {
          fs.mkdirSync(targetFolder, { recursive: true });
        }

        // 1. บันทึกลงไฟล์ชื่อ <DD>-<MMM><YY>.T<T> เช่น 11-AUG26.T00
        const mainNoteFileName = `${dayStr}-${monthStr}${year2D}.T${utcCycle}`;
        const mainNotePath = path.join(targetFolder, mainNoteFileName);
        fs.appendFileSync(mainNotePath, formattedEntry, 'utf-8');

        // 2. คัดลอกลงไฟล์สำเนา N<T>.TXT เช่น N00.TXT
        const copyNoteFileName = `N${utcCycle}.TXT`;
        const copyNotePath = path.join(targetFolder, copyNoteFileName);
        fs.copyFileSync(mainNotePath, copyNotePath);

        // ลบไฟล์ดิบต้นทางออก
        fs.unlinkSync(filePath);
        console.log(`[INGEST NOTE] Processed ${file} -> Note/${mainNoteFileName} & ${copyNoteFileName}`);
      } else {
        // ประมวลผลไฟล์ข่าวอากาศทั่วไป (SA, SM, WW, US ฯลฯ)
        const prefix = fileUpper.substring(0, 2);
        const categoryFolder = BULLETIN_PREFIX_MAP[prefix] || 'Metar';
        const targetFolder = path.join(BASE_FTP_DIR, yearBE, categoryFolder);
        
        if (!fs.existsSync(targetFolder)) {
          fs.mkdirSync(targetFolder, { recursive: true });
        }

        const outFileName = `${dayStr}-${monthStr}${year2D}.TXT`;
        const targetFilePath = path.join(targetFolder, outFileName);

        fs.appendFileSync(targetFilePath, formattedEntry, 'utf-8');
        fs.unlinkSync(filePath);
        console.log(`[INGEST BULLETIN] Processed ${file} -> ${categoryFolder}/${outFileName}`);
      }
    } catch (err) {
      console.error(`[ERROR] Failed to process ${file}:`, err);
    }
  }
}

// เรียกทำงาน
processFtpFiles();
