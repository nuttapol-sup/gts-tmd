import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export interface GTSBulletin {
  id: string;
  category: "synoptic" | "upperair" | "warning" | "metar" | "notes";
  categoryLabel: string;
  headerLine: string;
  dataType: string;
  countryCode: string;
  utcTimeStr: string;
  dayStr: string;
  hourStr: string;
  rawText: string;
  filename: string;
  folderPath: string;
}

const MONTH_NAMES = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

function cleanBinaryText(text: string): string {
  if (!text) return "";
  const hasBinaryNoise = /[\uFFFD\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(text) || /BUFR|GRIB/i.test(text);

  if (hasBinaryNoise) {
    const cleaned = text
      .replace(/[\uFFFD\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\uFFFF]/g, " ")
      .replace(/[^\x20-\x7E\r\n]/g, " ")
      .replace(/  +/g, " ")
      .trim();

    return cleaned || "[ข้อมูลข่าวสารรูปแบบ BUFR Binary Data]";
  }

  return text.replace(/[\uFFFD\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "").trim();
}

const CATEGORY_SUBFOLDERS: Record<string, string[]> = {
  synoptic: ["Synoptic", "synoptic", "SYNOPTIC"],
  notes: ["Note", "note", "Notes", "notes"],
  metar: ["Metar", "metar", "METAR"],
  warning: ["War", "war", "Warning", "warning"],
  upperair: ["Wind", "wind", "Upperair", "upperair", "WIND"],
  burf: ["Burf", "burf", "BUFR", "bufr", "Bufr"],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date") || "";
  const utcParam = searchParams.get("utc") || "";
  const countryParam = searchParams.get("country") || "";
  const categoryParam = searchParams.get("category") || "";
  const isAllData = searchParams.get("allData") === "true";

  const baseFtpDir = process.env.FTP_DIR || path.join(process.cwd(), "FTP");

  try {
    if (!fs.existsSync(baseFtpDir)) {
      return NextResponse.json({
        status: "error",
        message: `Directory ${baseFtpDir} not found`,
        bulletins: [],
      });
    }

    // Extract Day, Month (3-letter abbreviation), Year (AD 4 digits & BE 4 digits)
    let targetDay = "";
    let targetMonthStr = "";
    let targetYear2D = "";
    let targetYearBE = "2569"; // default 2026 -> พ.ศ. 2569
    let targetYearAD = "2026";

    if (dateParam) {
      const parts = dateParam.split("-");
      if (parts.length === 3) {
        const yyyyNum = parseInt(parts[0], 10);
        const mmNum = parseInt(parts[1], 10);
        const dd = parts[2].padStart(2, "0");

        targetDay = dd;
        targetYearAD = parts[0];
        targetYear2D = parts[0].substring(2);
        targetYearBE = String(yyyyNum + 543);

        if (mmNum >= 1 && mmNum <= 12) {
          targetMonthStr = MONTH_NAMES[mmNum - 1];
        }
      } else {
        targetDay = dateParam.padStart(2, "0");
      }
    }

    const targetHour = utcParam ? utcParam.padStart(2, "0") : "";

    // Determine target year folder: check BE (e.g. 2569), AD (e.g. 2026), or 2D (e.g. 26)
    const possibleYearFolders = [
      path.join(baseFtpDir, targetYearBE),
      path.join(baseFtpDir, targetYearAD),
      path.join(baseFtpDir, targetYear2D),
      baseFtpDir,
    ];

    let yearDirToUse = baseFtpDir;
    for (const p of possibleYearFolders) {
      if (fs.existsSync(/*turbopackIgnore: true*/ p) && fs.statSync(/*turbopackIgnore: true*/ p).isDirectory()) {
        yearDirToUse = p;
        break;
      }
    }

    // Collect target category folders to scan
    const dirsToScan: string[] = [];

    // If specific category requested and not isAllData, prioritize that category's folder
    if (categoryParam && CATEGORY_SUBFOLDERS[categoryParam] && !isAllData) {
      const folderNames = CATEGORY_SUBFOLDERS[categoryParam];
      for (const fn of folderNames) {
        const catPath = path.join(yearDirToUse, fn);
        if (fs.existsSync(/*turbopackIgnore: true*/ catPath) && fs.statSync(/*turbopackIgnore: true*/ catPath).isDirectory()) {
          dirsToScan.push(catPath);
          break;
        }
      }
    }

    // If no specific category folder found or isAllData, scan all subdirectories inside year folder
    if (dirsToScan.length === 0) {
      try {
        const yearSubEntries = fs.readdirSync(/*turbopackIgnore: true*/ yearDirToUse);
        for (const entry of yearSubEntries) {
          const subPath = path.join(yearDirToUse, entry);
          if (fs.existsSync(/*turbopackIgnore: true*/ subPath) && fs.statSync(/*turbopackIgnore: true*/ subPath).isDirectory()) {
            dirsToScan.push(subPath);
          }
        }
      } catch (e) {
        // ignore
      }
      if (dirsToScan.length === 0) {
        dirsToScan.push(yearDirToUse);
      }
    }

    const bulletins: GTSBulletin[] = [];

    // Scan files across target folders
    for (const scanDir of dirsToScan) {
      if (!fs.existsSync(scanDir)) continue;

      let filesInDir: string[] = [];
      try {
        filesInDir = fs.readdirSync(scanDir);
      } catch (e) {
        continue;
      }

      for (const filename of filesInDir) {
        const filePath = path.join(scanDir, filename);
        let stat;
        try {
          stat = fs.statSync(filePath);
        } catch (e) {
          continue;
        }
        if (!stat.isFile()) continue;

        const upperFn = filename.toUpperCase();

        // Filter by Date (Day, Month, Year) e.g. 12-AUG26
        if (targetDay && targetMonthStr && targetYear2D) {
          const expectedPrefix = `${targetDay}-${targetMonthStr}${targetYear2D}`.toUpperCase();
          const isDatePrefixed = upperFn.startsWith(expectedPrefix);
          const isCycleShortcut = /^(SM|M|W|U|N)\d{2}\.TXT$/i.test(filename);

          if (!isDatePrefixed && !isCycleShortcut) {
            continue;
          }
        }

        // Filter by UTC Hour e.g. .T09 (only for .T files; .TXT files contain all hours)
        if (targetHour) {
          const expectedSuffix = `.T${targetHour}`.toUpperCase();
          const isCycleShortcut = filename.toUpperCase().endsWith(`${targetHour}.TXT`);
          if (upperFn.includes(".T") && !upperFn.endsWith(".TXT")) {
            if (!upperFn.includes(expectedSuffix)) {
              continue;
            }
          } else if (isCycleShortcut) {
            // matched cycle shortcut file
          }
        }

        const fileContent = fs.readFileSync(filePath, "utf-8");

        // Split text content by ZCZC marker
        const blocks = fileContent.split(/ZCZC/i);

        let blockIdx = 0;
        for (const block of blocks) {
          blockIdx++;
          if (!block.trim()) continue;

          let nnnnIdx = block.indexOf("NNNN");
          let body = nnnnIdx !== -1 ? block.substring(0, nnnnIdx) : block;
          const cleanRaw = body.replace(/ZCZC/gi, "").replace(/NNNN/gi, "").trim();

          const lines = body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
          if (lines.length === 0) continue;

          let headerLine = "";
          let dataType = "";
          let countryCode = "";
          let utcTimeStr = "";
          let dayStr = "";
          let hourStr = "";

          // Find GTS Header line (e.g. SIAU24 AMMC 080900, NOTE02 VTBB 010900, SAOM32 OOMS 010000)
          for (const line of lines) {
            const parts = line.split(/\s+/);
            if (
              parts.length >= 3 &&
              /^[A-Z0-9]{4,6}$/i.test(parts[0]) &&
              /^\d{6}$/.test(parts[2])
            ) {
              headerLine = line;
              dataType = parts[0];
              countryCode = parts[1];
              utcTimeStr = parts[2];
              dayStr = utcTimeStr.substring(0, 2);
              hourStr = utcTimeStr.substring(2, 4);
              break;
            }
          }

          if (!headerLine && lines.length >= 1) {
            for (const line of lines) {
              const parts = line.split(/\s+/);
              if (parts.length >= 3 && /^\d{6}$/.test(parts[2])) {
                headerLine = line;
                dataType = parts[0];
                countryCode = parts[1];
                utcTimeStr = parts[2];
                dayStr = utcTimeStr.substring(0, 2);
                hourStr = utcTimeStr.substring(2, 4);
                break;
              }
            }
          }

          if (!dataType) continue;

          // Categorize bulletin type
          let category: "synoptic" | "upperair" | "warning" | "metar" | "notes" = "notes";
          let categoryLabel = "Note ท้ายข่าว (Raw GTS)";

          const dataTypeUpper = dataType.toUpperCase();
          const scanDirLower = scanDir.toLowerCase();
          const t1 = dataTypeUpper.substring(0, 1);
          const t1t2 = dataTypeUpper.substring(0, 2);

          if (
            dataTypeUpper.startsWith("NOTE") ||
            scanDirLower.includes("note") ||
            categoryParam === "notes"
          ) {
            category = "notes";
            categoryLabel = "Note ท้ายข่าว (Raw GTS)";
          } else if (
            scanDirLower.includes("synoptic") ||
            (t1 === "S" && (t1t2 === "SI" || t1t2 === "SM" || t1t2 === "SN" || body.includes("AAXX") || body.includes("BBXX")))
          ) {
            category = "synoptic";
            categoryLabel = "ข่าว Synoptic (Surface)";
          } else if (
            scanDirLower.includes("wind") ||
            t1 === "U" ||
            body.includes("TTAA") ||
            body.includes("TTBB") ||
            body.includes("PPAA")
          ) {
            category = "upperair";
            categoryLabel = "ข่าว Upper Air (ชั้นบน)";
          } else if (
            scanDirLower.includes("war") ||
            t1 === "W" ||
            t1t2 === "WT" ||
            t1t2 === "WW" ||
            t1t2 === "WO" ||
            body.includes("WARNING") ||
            body.includes("SIGMET")
          ) {
            category = "warning";
            categoryLabel = "ประกาศเตือนภัย (Warning)";
          } else if (
            scanDirLower.includes("metar") ||
            t1 === "M" ||
            t1t2 === "SA" ||
            t1t2 === "SP" ||
            t1t2 === "FT" ||
            t1t2 === "FC" ||
            body.includes("METAR") ||
            body.includes("TAF")
          ) {
            category = "metar";
            categoryLabel = "ข่าว METAR (อากาศการบิน)";
          } else if (t1 === "S") {
            category = "synoptic";
            categoryLabel = "ข่าว Synoptic (Surface)";
          }

          // Apply Day Filter
          if (targetDay && dayStr && dayStr !== targetDay) {
            continue;
          }

          // Apply Hour Filter
          if (targetHour && hourStr && hourStr !== targetHour) {
            continue;
          }

          // Apply Country Code Filter (if country is selected and not "zero")
          if (
            countryParam &&
            countryParam !== "zero" &&
            countryCode.toUpperCase() !== countryParam.toUpperCase()
          ) {
            continue;
          }

          // Apply Category Filter if not isAllData and specific category selected
          if (!isAllData && categoryParam && category !== categoryParam) {
            continue;
          }

          const sanitizedRaw = cleanBinaryText(cleanRaw);

          bulletins.push({
            id: `ftp-${filename}-${blockIdx}`,
            category,
            categoryLabel,
            headerLine,
            dataType,
            countryCode,
            utcTimeStr,
            dayStr,
            hourStr,
            rawText: sanitizedRaw,
            filename,
            folderPath: scanDir,
          });
        }
      }
    }

    return NextResponse.json({
      status: "success",
      count: bulletins.length,
      targetDay,
      targetMonthStr,
      targetYearBE,
      targetHour,
      countryParam,
      isAllData,
      scannedFolders: dirsToScan,
      bulletins,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message || "Failed to read FTP files",
      bulletins: [],
    });
  }
}
