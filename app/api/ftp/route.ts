import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export interface GTSStationItem {
  stationId: string;
  rawLine: string;
  isStation: boolean;
}

export interface GTSBulletin {
  id: string;
  category: "synoptic" | "upperair" | "warning" | "metar" | "notes" | "burf";
  categoryLabel: string;
  headerLine: string;
  dataType: string;
  countryCode: string;
  utcTimeStr: string;
  dayStr: string;
  hourStr: string;
  stations: GTSStationItem[];
  rawText: string;
  filename: string;
}

function extractStationObjects(rawText: string): GTSStationItem[] {
  const stations: GTSStationItem[] = [];
  const lines = rawText.split(/\r?\n/);

  let currentStationId: string | null = null;
  let currentLines: string[] = [];
  let currentIsStation = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const tokens = trimmed.split(/\s+/);
    const firstToken = tokens[0];

    // Skip bulletin header line (e.g., "FTTH20 VTBB 030500", "SMRA11 RUNW 010000 RRU")
    if (tokens.length >= 3 && /^[A-Z0-9]{4,6}$/i.test(tokens[0]) && /^\d{6}$/.test(tokens[2])) {
      continue;
    }

    const upperFirst = firstToken.toUpperCase();

    // Pattern 1: 5-digit WMO station ID (e.g., 48921, 36104)
    let isWmoId = /^\d{5}$/.test(firstToken);
    let extractedId = firstToken;

    // Pattern 1b: Upper Air Report Header (e.g., "TTDD 0100/ 20744", "TTAA 03121 48455", "PILOT 03121 48455")
    const isUpperAirHeader = /^(TT|PP)[A-D]{2}$/i.test(upperFirst) || ["PILOT", "TEMP"].includes(upperFirst);
    if (isUpperAirHeader) {
      if (tokens[2] && /^\d{5}$/.test(tokens[2])) {
        isWmoId = true;
        extractedId = tokens[2];
      } else if (tokens[1] && /^\d{5}$/.test(tokens[1])) {
        isWmoId = true;
        extractedId = tokens[1];
      }
    }

    // Pattern 2: 4-letter ICAO station ID (e.g., VTBD, VTBS, WMKK, WSSS, WBGB) or METAR/SPECI/TAF
    let isIcaoId = false;

    if (["METAR", "SPECI", "TAF"].includes(upperFirst)) {
      for (let i = 1; i < Math.min(tokens.length, 5); i++) {
        const tok = tokens[i].toUpperCase();
        if (
          /^[A-Z]{4}$/.test(tok) &&
          !["COR", "AMD", "NIL", "AUTO", "RTD", "AAXX", "BBXX"].includes(tok) &&
          !/^CC[A-Z]$/.test(tok)
        ) {
          isIcaoId = true;
          extractedId = tok;
          break;
        }
      }
    } else if (/^[A-Z]{4}$/i.test(firstToken) && upperFirst !== "AUTO" && upperFirst !== "NIL" && upperFirst !== "COR" && upperFirst !== "AMD" && upperFirst !== "AAXX" && !isUpperAirHeader) {
      isIcaoId = true;
      extractedId = upperFirst;
    }

    // If we are currently accumulating an active station report, append continuation lines until '='
    if (currentStationId) {
      currentLines.push(trimmed);

      if (trimmed.endsWith("=") || trimmed.includes("=")) {
        stations.push({
          stationId: currentStationId,
          rawLine: currentLines.join(" "),
          isStation: currentIsStation,
        });
        currentStationId = null;
        currentLines = [];
        currentIsStation = false;
      }
    } else if (isWmoId || isIcaoId) {
      // Start a new station report
      currentStationId = extractedId;
      currentLines = [trimmed];
      currentIsStation = true;

      if (trimmed.endsWith("=") || trimmed.includes("=")) {
        stations.push({
          stationId: currentStationId,
          rawLine: currentLines.join(" "),
          isStation: currentIsStation,
        });
        currentStationId = null;
        currentLines = [];
        currentIsStation = false;
      }
    } else {
      // General body line before any station block (e.g., "AAXX 01001")
      stations.push({
        stationId: firstToken.toUpperCase(),
        rawLine: trimmed,
        isStation: false,
      });
    }
  }

  if (currentStationId && currentLines.length > 0) {
    stations.push({
      stationId: currentStationId,
      rawLine: currentLines.join(" "),
      isStation: currentIsStation,
    });
  }

  return stations;
}

export function isCountryMatch(
  selectedCountry: string,
  countryCode: string,
  dataType: string,
  bodyText: string
): boolean {
  if (!selectedCountry || selectedCountry === "zero") return true;

  const req = selectedCountry.toUpperCase();
  const cCode = (countryCode || "").toUpperCase();
  const dType = (dataType || "").toUpperCase();
  const bodyUpper = (bodyText || "").toUpperCase();

  // WMO 2-letter A1A2 (e.g. SATH31 -> TH, SAAU31 -> AU, SAJP31 -> JP)
  const a1a2 = dType.length >= 4 ? dType.substring(2, 4) : "";

  switch (req) {
    case "VTBB": // Thailand
      return (
        cCode.startsWith("VT") ||
        a1a2 === "TH" ||
        bodyUpper.includes("VTBB") ||
        bodyUpper.includes("VTBD") ||
        bodyUpper.includes("VTBS")
      );

    case "AMMC": // Australia
      return (
        cCode === "AMMC" ||
        cCode.startsWith("Y") ||
        a1a2 === "AU" ||
        bodyUpper.includes("YSSY") ||
        bodyUpper.includes("YMML")
      );

    case "VGDC": // Bangladesh
      return cCode.startsWith("VG") || a1a2 === "BS" || a1a2 === "BD";

    case "WBSB": // Brunei (Exclusive to Brunei WBSB, excluding Sabah/Sarawak WB..)
      return cCode === "WBSB" || a1a2 === "BN" || a1a2 === "BX";

    case "BABJ": // China (Exclusive to Chinese ICAO prefixes ZB, ZG, ZH, ZL, ZP, ZS, ZU, ZY)
      return (
        cCode === "BABJ" ||
        cCode.startsWith("ZB") ||
        cCode.startsWith("ZG") ||
        cCode.startsWith("ZH") ||
        cCode.startsWith("ZL") ||
        cCode.startsWith("ZP") ||
        cCode.startsWith("ZS") ||
        cCode.startsWith("ZU") ||
        cCode.startsWith("ZY") ||
        a1a2 === "CN"
      );

    case "VHHH": // Hong Kong
      return cCode.startsWith("VH") || a1a2 === "HK";

    case "DEMS": // India
      return (
        cCode === "DEMS" ||
        cCode.startsWith("VI") ||
        cCode.startsWith("VO") ||
        cCode.startsWith("VE") ||
        cCode.startsWith("VA") ||
        a1a2 === "IN"
      );

    case "WIIX": // Indonesia
      return (
        cCode === "WIIX" ||
        cCode.startsWith("WI") ||
        cCode.startsWith("WA") ||
        a1a2 === "ID"
      );

    case "OLLL": // Iran
      return cCode.startsWith("OI") || a1a2 === "IR";

    case "RJTD": // Japan (Exclusive to RJ.. ICAO airports, excluding Ryukyu RO..)
      return (
        cCode === "RJTD" ||
        cCode.startsWith("RJ") ||
        a1a2 === "JP"
      );

    case "UAAA": // Kazakhstan
      return (cCode.startsWith("UA") && cCode !== "UAFF") || a1a2 === "KZ";

    case "OKBK": // Kuwait
      return cCode.startsWith("OK") || a1a2 === "KW";

    case "UAFF": // Kyrgyzstan
      return cCode === "UAFF" || cCode.startsWith("UC") || a1a2 === "KG";

    case "VLIV": // Laos
      return cCode.startsWith("VL") || a1a2 === "LA";

    case "VMMC": // Macao
      return cCode.startsWith("VM") || a1a2 === "MO";

    case "FMMI": // Madagascar
      return cCode.startsWith("FM") || a1a2 === "MG";

    case "WMKK": // Malaysia (Peninsular WM.. and Sabah/Sarawak WB..)
      return (
        (cCode.startsWith("WM") || (cCode.startsWith("WB") && cCode !== "WBSB")) ||
        a1a2 === "MY"
      );

    case "VRMM": // Maldives
      return cCode.startsWith("VR") || a1a2 === "MV";

    case "MNUB": // Mongolia
      return cCode === "MNUB" || cCode.startsWith("ZM") || a1a2 === "MN";

    case "VBRR": // Myanmar
      return cCode === "VBRR" || cCode.startsWith("VY") || a1a2 === "MM" || a1a2 === "BM";

    case "VNKT": // Nepal
      return cCode.startsWith("VN") || a1a2 === "NP";

    case "DKPY": // North Korea
      return cCode === "DKPY" || cCode.startsWith("ZK") || a1a2 === "KP";

    case "OOMS": // Oman
      return cCode.startsWith("OO") || a1a2 === "OM";

    case "OCEAN": // Pacific Ocean
      return (
        cCode === "OCEAN" ||
        cCode.startsWith("PH") ||
        cCode.startsWith("NF") ||
        cCode.startsWith("NW") ||
        cCode.startsWith("PT") ||
        cCode.startsWith("PG") ||
        a1a2 === "OC" ||
        a1a2 === "PF" ||
        a1a2 === "PS"
      );

    case "RPLL": // Philippines
      return cCode.startsWith("RP") || a1a2 === "PH";

    case "ROAH": // Ryukyu Islands (Exclusive to RO.. ICAO airports)
      return cCode.startsWith("RO") || a1a2 === "RY";

    case "RUSSIA": // Russia
    case "RU":
      return (
        cCode.startsWith("RU") ||
        cCode === "RIII" ||
        (cCode.startsWith("U") &&
          !cCode.startsWith("UA") &&
          !cCode.startsWith("UC") &&
          !cCode.startsWith("UT")) ||
        a1a2 === "RU" ||
        a1a2 === "RA" ||
        a1a2 === "RS"
      );

    case "WSSS": // Singapore
      return cCode.startsWith("WS") || a1a2 === "SG";

    case "VCCC": // Sri Lanka
      return cCode.startsWith("VC") || a1a2 === "SL";

    case "RCAA": // Taiwan
      return cCode.startsWith("RC") || a1a2 === "TW";

    case "UTTT": // Uzbekistan
      return cCode.startsWith("UT") || a1a2 === "UZ";

    default:
      return cCode === req || dType.includes(req);
  }
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

export async function handleFtpQuery(request: Request, forcedCategory?: string) {
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.IS_BUILD === "true") {
    return NextResponse.json({ status: "success", count: 0, bulletins: [] });
  }

  const { searchParams } = new URL(request.url);
  const rawDateParam = searchParams.get("date") || "";
  const rawUtcParam = searchParams.get("utc") || "";
  const rawCountryParam = searchParams.get("country") || "";
  const rawCategoryParam = forcedCategory || searchParams.get("category") || "";
  const isAllData = searchParams.get("allData") === "true" || !!forcedCategory;

  // Cybersecurity: Input sanitization to prevent Path Traversal & Special Character Injection
  const sanitizeAlphaNum = (val: string) => val.replace(/[^a-zA-Z0-9\-_]/g, "").substring(0, 30);
  const dateParam = rawDateParam.replace(/[^0-9\-]/g, "").substring(0, 10);
  const utcParam = sanitizeAlphaNum(rawUtcParam);
  const countryParam = sanitizeAlphaNum(rawCountryParam);
  const categoryParam = sanitizeAlphaNum(rawCategoryParam);

  const candidateBaseDirs = [
    process.env.FTP_DIR,
    path.join(/*turbopackIgnore: true*/ process.cwd(), "FTP"),
    "/home/rthbkk/FTP",
    "/var/ftp",
    "/srv/ftp",
    "/ftp",
  ].filter(Boolean) as string[];

  let baseFtpDir = "";
  for (const candidate of candidateBaseDirs) {
    if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
      baseFtpDir = candidate;
      break;
    }
  }

  try {
    if (!baseFtpDir) {
      return NextResponse.json({
        status: "error",
        message: `FTP directory not found. Checked candidate paths: ${candidateBaseDirs.join(", ")}`,
        bulletins: [],
      });
    }

    // Extract Day, Month (3-letter abbreviation), Year (AD 4 digits & BE 4 digits)
    let targetDay = "";
    let targetMonthStr = "";
    let targetYear2D = "";
    let targetYearBE = "2569";
    let targetYearAD = "2026";
    const now = new Date();
    const defaultYyyy = now.getUTCFullYear();
    const defaultMm = String(now.getUTCMonth() + 1).padStart(2, "0");
    const defaultDd = String(now.getUTCDate()).padStart(2, "0");
    const todayStr = `${defaultYyyy}-${defaultMm}-${defaultDd}`;

    const activeDateParam = dateParam || todayStr;

    if (activeDateParam) {
      const parts = activeDateParam.split("-");
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
        targetDay = activeDateParam.padStart(2, "0");
      }
    }

    const targetHour = utcParam ? utcParam.padStart(2, "0") : "";

    // Determine target year folder: check BE (e.g. 2569), AD (e.g. 2026), or 2D (e.g. 26)
    const possibleYearFolders = [
      path.join(/*turbopackIgnore: true*/ baseFtpDir, targetYearBE),
      path.join(/*turbopackIgnore: true*/ baseFtpDir, targetYearAD),
      path.join(/*turbopackIgnore: true*/ baseFtpDir, targetYear2D),
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

    // If specific category requested, prioritize scanning that category's folder
    if (categoryParam && CATEGORY_SUBFOLDERS[categoryParam]) {
      const folderNames = CATEGORY_SUBFOLDERS[categoryParam];
      for (const fn of folderNames) {
        const catPath = path.join(yearDirToUse, fn);
        if (fs.existsSync(/*turbopackIgnore: true*/ catPath) && fs.statSync(/*turbopackIgnore: true*/ catPath).isDirectory()) {
          dirsToScan.push(catPath);
          break;
        }
      }
    }

    // If no specific category folder found or no category specified, scan all subdirectories inside year folder
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

        try {
          const stat = fs.statSync(filePath);
          if (stat.size > 5 * 1024 * 1024) continue; // Skip files > 5MB to prevent Invalid string length

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
          let category: "synoptic" | "upperair" | "warning" | "metar" | "notes" | "burf" = "notes";
          let categoryLabel = "Note ท้ายข่าว (Raw GTS)";

          const dataTypeUpper = dataType.toUpperCase();
          const scanDirLower = scanDir.toLowerCase();
          const t1 = dataTypeUpper.substring(0, 1);
          const t1t2 = dataTypeUpper.substring(0, 2);

          if (
            scanDirLower.includes("burf") ||
            scanDirLower.includes("bufr") ||
            t1t2 === "IS" ||
            t1t2 === "IU" ||
            t1 === "H" ||
            body.includes("BUFR")
          ) {
            category = "burf";
            categoryLabel = "ข่าว BUFR Binary Data";
          } else if (
            dataTypeUpper.startsWith("NOTE") ||
            scanDirLower.includes("note")
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
          if (countryParam && countryParam !== "zero") {
            if (!isCountryMatch(countryParam, countryCode, dataType, cleanRaw)) {
              continue;
            }
          }

          // Apply Category Filter if specific category tab selected (unless categoryParam is empty)
          if (categoryParam && category !== categoryParam) {
            continue;
          }

          // Synoptic filter: only allow headers starting with SM or SI
          if (categoryParam === "synoptic" || category === "synoptic") {
            const dtUpper = (dataType || "").trim().toUpperCase();
            if (!dtUpper.startsWith("SM") && !dtUpper.startsWith("SI")) {
              continue;
            }
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
              stations: extractStationObjects(sanitizedRaw),
              rawText: sanitizedRaw,
              filename,
            });
          }
        } catch (e) {
          // Skip corrupt or unreadable file safely
          continue;
        }
      }
    }

    // If no bulletins found for today's date (e.g. local test environment), fallback to scanning recent files
    if (bulletins.length === 0 && !dateParam) {
      for (const scanDir of dirsToScan) {
        if (!fs.existsSync(scanDir)) continue;
        let filesInDir: string[] = [];
        try {
          filesInDir = fs.readdirSync(scanDir);
        } catch (e) {
          continue;
        }

        filesInDir.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
        const recentFiles = filesInDir.slice(0, 15);

        for (const filename of recentFiles) {
          const filePath = path.join(scanDir, filename);
          let stat;
          try {
            stat = fs.statSync(filePath);
          } catch (e) {
            continue;
          }
          if (!stat.isFile()) continue;

          try {
            if (stat.size > 5 * 1024 * 1024) continue;
            const fileContent = fs.readFileSync(filePath, "utf-8");
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

              for (const l of lines) {
                const parts = l.split(/\s+/);
                if (parts.length >= 3 && /^[A-Z0-9]{4,6}$/i.test(parts[0]) && /^\d{6}$/.test(parts[2])) {
                  headerLine = l;
                  dataType = parts[0];
                  countryCode = parts[1];
                  utcTimeStr = parts[2];
                  dayStr = parts[2].substring(0, 2);
                  hourStr = parts[2].substring(2, 4);
                  break;
                }
              }

              let category: GTSBulletin["category"] = "synoptic";
              let categoryLabel = "ข่าว Synoptic (Surface)";

              if (countryParam && countryParam !== "zero") {
                if (!isCountryMatch(countryParam, countryCode, dataType, cleanRaw)) {
                  continue;
                }
              }

              if (categoryParam === "synoptic" || category === "synoptic") {
                const dtUpper = (dataType || "").trim().toUpperCase();
                if (!dtUpper.startsWith("SM") && !dtUpper.startsWith("SI")) {
                  continue;
                }
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
                stations: extractStationObjects(sanitizedRaw),
                rawText: sanitizedRaw,
                filename,
              });
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    // Sort bulletins so latest (newest) data appears FIRST
    bulletins.sort((a, b) => {
      if (b.filename !== a.filename) {
        return b.filename.localeCompare(a.filename, undefined, { numeric: true });
      }
      const timeA = parseInt(a.utcTimeStr || "0", 10);
      const timeB = parseInt(b.utcTimeStr || "0", 10);
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return parseInt(b.id.split("-").pop() || "0", 10) - parseInt(a.id.split("-").pop() || "0", 10);
    });

    // Deduplicate bulletins having exact same headerLine, countryCode, and rawText content
    const uniqueBulletins: any[] = [];
    const seenContentKeys = new Set<string>();
    let idCounter = 1;

    for (const b of bulletins) {
      const normText = (b.rawText || "").trim().replace(/\r?\n/g, "\n");
      const key = `${b.headerLine || ""}_${b.countryCode || ""}_${normText}`;
      if (!seenContentKeys.has(key)) {
        seenContentKeys.add(key);
        uniqueBulletins.push({
          id: String(idCounter++).padStart(6, "0"),
          category: b.category,
          categoryLabel: b.categoryLabel,
          headerLine: b.headerLine,
          dataType: b.dataType,
          countryCode: b.countryCode,
          utcTimeStr: b.utcTimeStr,
          stations: b.stations,
        });
      }
    }

    return NextResponse.json({
      status: "success",
      count: uniqueBulletins.length,
      targetDay,
      targetMonthStr,
      targetYearBE,
      targetHour,
      countryParam,
      isAllData,
      bulletins: uniqueBulletins,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: error.message || "Failed to read FTP files",
      bulletins: [],
    });
  }
}

export async function GET(request: Request) {
  return handleFtpQuery(request);
}
