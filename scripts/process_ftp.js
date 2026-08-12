/**
 * GTS Weather Bulletin & Note Master Processor Script
 * --------------------------------------------------
 * อ่านไฟล์ข่าวสภาพอากาศดิบทั้งหมดจาก FTP/received:
 * 1. Synoptic (SM*.*, SI*.*, SN*.*) -> บันทึกเข้า FTP/<ปีพ.ศ.>/Synoptic/<DD-MMMYY.T<T>> และสำเนา SM<T>.TXT
 * 2. Note (NOTE*.*)               -> บันทึกเข้า FTP/<ปีพ.ศ.>/Note/<DD-MMMYY.T<T>> และสำเนา N<T>.TXT
 * 3. Burf/BUFR (IS*.*, IU*.*, H*.*)-> บันทึกเข้า FTP/<ปีพ.ศ.>/Burf/<DD-MMMYY_T<T>>/<filename> และสำเนา Burf/<DD-MMMYY.TXT>
 * 4. Wind/UpperAir (U*.*, PR*.*)   -> บันทึกเข้า FTP/<ปีพ.ศ.>/Wind/<DD-MMMYY.T<T>> และสำเนา U<T>.TXT
 * 5. Warning (WE*.*, WW*.*, ฯลฯ) -> บันทึกเข้า FTP/<ปีพ.ศ.>/War/<DD-MMMYY.TXT> และสำเนา W<T>.TXT
 * 6. Metar (SA*.*, SP*.*)         -> บันทึกเข้า FTP/<ปีพ.ศ.>/Metar/<DD-MMMYY.TXT> และสำเนา M<T>.TXT
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
    const prefix1 = fileUpper.substring(0, 1);

    let categoryFolder = 'Metar';
    let extName = `.TXT`;
    let copyPrefix = `M`;
    let isBurf = false;

    if (fileUpper.startsWith('NOTE')) {
      categoryFolder = 'Note';
      extName = `.T${utcCycle}`;
      copyPrefix = `N`;
    } else if (['IS', 'IU'].includes(prefix2) || prefix1 === 'H' || fileUpper.startsWith('BUFR') || fileUpper.startsWith('BURF')) {
      categoryFolder = 'Burf';
      extName = `.TXT`;
      copyPrefix = `B`;
      isBurf = true;
    } else if (['SM', 'SI', 'SN'].includes(prefix2)) {
      categoryFolder = 'Synoptic';
      extName = `.T${utcCycle}`;
      copyPrefix = `SM`;
    } else if (fileUpper.startsWith('U') || prefix2 === 'PR') {
      categoryFolder = 'Wind';
      extName = `.T${utcCycle}`;
      copyPrefix = `U`;
    } else if (['WE', 'WW', 'WO', 'WS', 'WC', 'WV'].includes(prefix2)) {
      categoryFolder = 'War';
      extName = `.TXT`;
      copyPrefix = `W`;
    } else if (['SA', 'SP'].includes(prefix2)) {
      categoryFolder = 'Metar';
      extName = `.TXT`;
      copyPrefix = `M`;
    }

    const targetFolder = path.join(BASE_FTP_DIR, yearBE, categoryFolder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    try {
      if (isBurf) {
        // ประมวลผลไฟล์ Burf / BUFR (IS*.*, IU*.*, H*.*)
        // 1. สร้างโฟลเดอร์เฉพาะรอบเวลา e.g. Burf/12-AUG26_T15/
        const burfSubDirName = `${dayStr}-${monthStr}${year2D}_T${utcCycle}`;
        const burfSubDirPath = path.join(targetFolder, burfSubDirName);
        if (!fs.existsSync(burfSubDirPath)) {
          fs.mkdirSync(burfSubDirPath, { recursive: true });
        }

        // คัดลอกไฟล์ดิบเข้าโฟลเดอร์รอบเวลา
        const rawCopyPath = path.join(burfSubDirPath, file);
        fs.copyFileSync(filePath, rawCopyPath);

        // 2. บันทึกข้อความส่วนหัวลงในไฟล์รวมประจำวัน Burf/12-AUG26.TXT
        const rawContent = fs.readFileSync(filePath, 'utf-8').trim();
        const formattedEntry = `ZCZC\r\n${rawContent}\r\n\r\nNNNN\r\n\r\n`;

        const mainFileName = `${dayStr}-${monthStr}${year2D}.TXT`;
        const mainPath = path.join(targetFolder, mainFileName);
        fs.appendFileSync(mainPath, formattedEntry, 'utf-8');

        // ลบไฟล์ดิบต้นทางออก
        fs.unlinkSync(filePath);
        console.log(`[INGEST BURF] Processed ${file} -> Burf/${burfSubDirName}/${file}`);
      } else {
        // ประมวลผลข่าวอากาศทั่วไป
        const rawContent = fs.readFileSync(filePath, 'utf-8').trim();
        const formattedEntry = `ZCZC\r\n${rawContent}\r\n\r\nNNNN\r\n\r\n`;

        const mainFileName = `${dayStr}-${monthStr}${year2D}${extName}`;
        const mainPath = path.join(targetFolder, mainFileName);
        fs.appendFileSync(mainPath, formattedEntry, 'utf-8');

        const copyFileName = `${copyPrefix}${utcCycle}.TXT`;
        const copyPath = path.join(targetFolder, copyFileName);
        fs.copyFileSync(mainPath, copyPath);

        fs.unlinkSync(filePath);
        console.log(`[INGEST] Processed ${file} -> ${categoryFolder}/${mainFileName} & ${copyFileName}`);
      }
    } catch (err) {
      console.error(`[ERROR] Failed to process ${file}:`, err);
    }
  }
}

// เรียกทำงาน
processFtpFiles();
