/**
 * GTS Weather Bulletin & Note Master Processor Script
 * --------------------------------------------------
 * อ่านไฟล์ข่าวสภาพอากาศดิบทั้งหมดจาก FTP/received:
 * 1. Synoptic (SM*.*, SI*.*, SN*.*) -> เพิ่ม ZCZC...NNNN บันทึกเข้า FTP/<ปีพ.ศ.>/Synoptic/<DD-MMMYY.T<T>> และสำเนา SM<T>.TXT
 * 2. Note (NOTE*.*)               -> เพิ่ม ZCZC...NNNN บันทึกเข้า FTP/<ปีพ.ศ.>/Note/<DD-MMMYY.T<T>> และสำเนา N<T>.TXT
 * 3. Metar (SA*.*, SP*.*)         -> เพิ่ม ZCZC...NNNN บันทึกเข้า FTP/<ปีพ.ศ.>/Metar/<DD-MMMYY.TXT> และสำเนา M<T>.TXT
 * 4. Warning (WW*.*, WO*.*, ฯลฯ) -> เพิ่ม ZCZC...NNNN บันทึกเข้า FTP/<ปีพ.ศ.>/Warning/<DD-MMMYY.TXT> และสำเนา W<T>.TXT
 * 5. UpperAir (US*.*, UL*.*, ฯลฯ) -> เพิ่ม ZCZC...NNNN บันทึกเข้า FTP/<ปีพ.ศ.>/UpperAir/<DD-MMMYY.TXT> และสำเนา U<T>.TXT
 */

const fs = require('fs');
const path = require('path');

const BASE_FTP_DIR = process.env.FTP_DIR || path.join(__dirname, '..', 'FTP');
const RECEIVED_DIR = path.join(BASE_FTP_DIR, 'received');

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

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
    const prefix2 = fileUpper.substring(0, 2);

    let categoryFolder = 'Metar';
    let extName = `.TXT`;
    let copyPrefix = `M`;

    if (fileUpper.startsWith('NOTE')) {
      categoryFolder = 'Note';
      extName = `.T${utcCycle}`;
      copyPrefix = `N`;
    } else if (['SM', 'SI', 'SN'].includes(prefix2)) {
      categoryFolder = 'Synoptic';
      extName = `.T${utcCycle}`;
      copyPrefix = `SM`;
    } else if (['SA', 'SP'].includes(prefix2)) {
      categoryFolder = 'Metar';
      extName = `.TXT`;
      copyPrefix = `M`;
    } else if (['WW', 'WO', 'WS', 'WC', 'WV'].includes(prefix2)) {
      categoryFolder = 'Warning';
      extName = `.TXT`;
      copyPrefix = `W`;
    } else if (['US', 'UL', 'UK', 'UG', 'UQ'].includes(prefix2)) {
      categoryFolder = 'UpperAir';
      extName = `.TXT`;
      copyPrefix = `U`;
    }

    const targetFolder = path.join(BASE_FTP_DIR, yearBE, categoryFolder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    try {
      const rawContent = fs.readFileSync(filePath, 'utf-8').trim();
      const formattedEntry = `ZCZC\r\n${rawContent}\r\n\r\nNNNN\r\n\r\n`;

      // 1. บันทึกลงไฟล์หลักประจำวัน e.g. 11-AUG26.T00 หรือ 11-AUG26.TXT
      const mainFileName = `${dayStr}-${monthStr}${year2D}${extName}`;
      const mainPath = path.join(targetFolder, mainFileName);
      fs.appendFileSync(mainPath, formattedEntry, 'utf-8');

      // 2. สำเนาลงไฟล์ประจำรอบเวลา e.g. SM00.TXT, N00.TXT, M00.TXT
      const copyFileName = `${copyPrefix}${utcCycle}.TXT`;
      const copyPath = path.join(targetFolder, copyFileName);
      fs.copyFileSync(mainPath, copyPath);

      // ลบไฟล์ดิบต้นทางออก
      fs.unlinkSync(filePath);
      console.log(`[INGEST] Processed ${file} -> ${categoryFolder}/${mainFileName} & ${copyFileName}`);
    } catch (err) {
      console.error(`[ERROR] Failed to process ${file}:`, err);
    }
  }
}

// เรียกทำงาน
processFtpFiles();
