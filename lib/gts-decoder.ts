import { parseSynopBulletin, DecodedSynopStation } from "./synop-decoder";

export interface DecodedMetar {
  icao: string;
  utcTime: string;
  wind: string;
  visibility: string;
  weatherCondition: string;
  cloudCoverage: string;
  tempDewPoint: string;
  qnhPressure: string;
  rawText: string;
}

export interface DecodedWarning {
  headerLine: string;
  issueTime: string;
  warningType: string;
  affectedArea: string;
  rawContent: string;
}

export interface DecodedNote {
  headerLine: string;
  sender: string;
  utcTime: string;
  noteText: string;
}

export type GTSCategoryType = "synoptic" | "metar" | "warning" | "notes" | "upperair" | "bufr" | "unknown";

export interface GTSDecodeResult {
  status: "success" | "error";
  category: GTSCategoryType;
  categoryLabel: string;
  headerLine: string;
  countryCode: string;
  utcTime: string;
  totalItems: number;
  data: {
    stations?: DecodedSynopStation[];
    metarReports?: DecodedMetar[];
    warningInfo?: DecodedWarning;
    noteInfo?: DecodedNote;
    rawText: string;
  };
}

/**
 * Detect GTS category from WMO header or raw text content
 */
export function detectGtsCategory(headerLine: string, rawText: string): { category: GTSCategoryType; label: string } {
  const upperHeader = (headerLine || "").toUpperCase().trim();
  const upperRaw = (rawText || "").toUpperCase();

  const parts = upperHeader.split(/\s+/);
  const dataType = parts[0] || "";
  const t1 = dataType.substring(0, 1);
  const t1t2 = dataType.substring(0, 2);

  // 1. METAR / SPECI
  if (
    t1t2 === "SA" ||
    t1t2 === "SP" ||
    upperRaw.includes("METAR") ||
    upperRaw.includes("SPECI")
  ) {
    return { category: "metar", label: "ข้อมูลข่าว Metar (อากาศการบิน)" };
  }

  // 2. Warning / Tropical Cyclone / SIGMET
  if (
    t1 === "W" ||
    t1t2 === "WT" ||
    t1t2 === "WO" ||
    t1t2 === "WW" ||
    t1t2 === "WC" ||
    upperRaw.includes("WARNING") ||
    upperRaw.includes("SIGMET") ||
    upperRaw.includes("CYCLONE")
  ) {
    return { category: "warning", label: "ข้อมูลข่าวเตือนภัย (Warning / SIGMET)" };
  }

  // 3. Synoptic Surface (AAXX / BBXX / SM / SI / SN)
  if (
    t1t2 === "SM" ||
    t1t2 === "SI" ||
    t1t2 === "SN" ||
    upperRaw.includes("AAXX") ||
    upperRaw.includes("BBXX")
  ) {
    return { category: "synoptic", label: "ข่าว Synoptic (Surface)" };
  }

  // 4. Notes / Administrative GTS Notes
  if (
    dataType.startsWith("NOTE") ||
    upperRaw.includes("NOTE") ||
    upperRaw.includes("ADMINISTRATIVE")
  ) {
    return { category: "notes", label: "Note ท้ายข่าว (Raw GTS)" };
  }

  // 5. Upper Air
  if (t1 === "U" || upperRaw.includes("TTAA") || upperRaw.includes("TTBB")) {
    return { category: "upperair", label: "ข่าว Upper Air (ชั้นบน)" };
  }

  // 6. BUFR
  if (t1t2 === "IS" || t1t2 === "IU" || upperRaw.includes("BUFR")) {
    return { category: "bufr", label: "ข่าว BUFR Binary Data" };
  }

  return { category: "unknown", label: "ข่าวสภาพอากาศทั่วไป (General GTS)" };
}

/**
 * Decode METAR raw report tokens
 */
export function parseMetarReport(rawText: string): DecodedMetar[] {
  const reports: DecodedMetar[] = [];
  const lines = rawText.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("ZCZC") || trimmed.startsWith("NNNN")) continue;

    // Look for ICAO station (e.g. VTBS 030900Z, WSSS 030830Z, RPLL 030900Z)
    const tokens = trimmed.split(/\s+/);
    let icao = "";
    let utcTime = "";

    for (let i = 0; i < tokens.length; i++) {
      if (/^[A-Z]{4}$/i.test(tokens[i]) && i < tokens.length - 1 && /^\d{6}Z$/i.test(tokens[i + 1])) {
        icao = tokens[i].toUpperCase();
        utcTime = tokens[i + 1].toUpperCase();
        break;
      }
    }

    if (!icao) {
      if (/^[A-Z]{4}$/i.test(tokens[0])) {
        icao = tokens[0].toUpperCase();
      }
    }

    if (!icao) continue;

    // Parse METAR weather elements
    let wind = "ไม่ระบุ";
    let visibility = "ไม่ระบุ";
    let weatherCondition = "ปกติ";
    let cloudCoverage = "แจ่มใส";
    let tempDewPoint = "ไม่ระบุ";
    let qnhPressure = "ไม่ระบุ";

    for (const tok of tokens) {
      // Wind: e.g. 18005KT, VRB02KT, 09012G22KT
      if (/^(\d{3}|VRB)\d{2,3}(G\d{2,3})?KT$/i.test(tok)) {
        const speedMatch = tok.match(/^(\d{3}|VRB)(\d{2,3})KT$/i);
        if (speedMatch) {
          const dir = speedMatch[1] === "VRB" ? "แปรปรวน" : `${speedMatch[1]}°`;
          wind = `ทิศทาง ${dir} ความเร็ว ${speedMatch[2]} นอต`;
        } else {
          wind = tok;
        }
      }
      // Visibility: e.g. 9999, 5000, 0800
      else if (/^\d{4}$/.test(tok)) {
        const meters = parseInt(tok, 10);
        visibility = meters >= 9999 ? "ทัศนวิสัยดีมาก (> 10 กม.)" : `${meters} เมตร`;
      }
      // Weather condition: e.g. TSRA, SHRA, FG, HZ, BR, +RA, -RA
      else if (/^(\+|-)?(TS|SH|FZ)?(RA|SN|DZ|FG|HZ|BR|HZ|FU|DU|SA|SQ|FC)$/i.test(tok)) {
        const conditionMap: Record<string, string> = {
          TSRA: "ฝนฟ้าคะนอง (Thunderstorm Rain)",
          SHRA: "ฝนซ่า / ฝนโชก (Rain Showers)",
          RA: "ฝนตก (Rain)",
          "-RA": "ฝนตกเล็กน้อย (Light Rain)",
          "+RA": "ฝนตกหนัก (Heavy Rain)",
          FG: "หมอกหนา (Fog)",
          HZ: "ฟ้าหลัว / หมอกแดด (Haze)",
          BR: "หมอกบาง (Mist)",
          TS: "พายุฝนฟ้าคะนอง (Thunderstorm)",
        };
        weatherCondition = conditionMap[tok.toUpperCase()] || tok;
      }
      // Cloud: e.g. FEW020, SCT030, BKN015, OVC010, NSC, CAVOK
      else if (/^(FEW|SCT|BKN|OVC)\d{3}$/i.test(tok)) {
        const coverMap: Record<string, string> = {
          FEW: "เมฆเล็กน้อย (FEW)",
          SCT: "เมฆกระจาย (SCT)",
          BKN: "เมฆเป็นส่วนมาก (BKN)",
          OVC: "เมฆเต็มท้องฟ้า (OVC)",
        };
        const type = tok.substring(0, 3).toUpperCase();
        const alt = parseInt(tok.substring(3), 10) * 100;
        cloudCoverage = `${coverMap[type] || type} ฐานเมฆ ${alt} ฟุต`;
      } else if (tok.toUpperCase() === "CAVOK") {
        visibility = "> 10 กม.";
        cloudCoverage = "ท้องฟ้าแจ่มใส ทัศนวิสัยดี (CAVOK)";
      }
      // Temperature / Dew point: e.g. 31/24, M02/M05, 28/22
      else if (/^(M?\d{2})\/(M?\d{2})$/i.test(tok)) {
        const parts = tok.split("/");
        const formatT = (s: string) => (s.startsWith("M") ? `-${s.substring(1)}` : `+${s}`);
        tempDewPoint = `อุณหภูมิ ${formatT(parts[0])} °C / จุดน้ำค้าง ${formatT(parts[1])} °C`;
      }
      // QNH Pressure: e.g. Q1012, Q1008, A2992
      else if (/^Q\d{4}$/i.test(tok)) {
        qnhPressure = `${tok.substring(1)} hPa`;
      }
    }

    reports.push({
      icao,
      utcTime,
      wind,
      visibility,
      weatherCondition,
      cloudCoverage,
      tempDewPoint,
      qnhPressure,
      rawText: line,
    });
  }

  return reports;
}

/**
 * Decode Warning / SIGMET bulletin
 */
export function parseWarningInfo(headerLine: string, rawText: string): DecodedWarning {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let warningType = "ประกาศเตือนภัยอากาศ / SIGMET";
  let affectedArea = "ภูมิภาคเอเชียตะวันออกเฉียงใต้";

  const upperRaw = rawText.toUpperCase();
  if (upperRaw.includes("TROPICAL CYCLONE")) warningType = "เตือนภัยพายุหมุนเขตร้อน (Tropical Cyclone)";
  else if (upperRaw.includes("SIGMET")) warningType = "เตือนภัยการบิน (SIGMET)";
  else if (upperRaw.includes("TS") || upperRaw.includes("THUNDERSTORM")) warningType = "เตือนภัยพายุฝนฟ้าคะนอง";

  return {
    headerLine: headerLine || "WARNING",
    issueTime: new Date().toISOString(),
    warningType,
    affectedArea,
    rawContent: rawText,
  };
}

/**
 * Decode Administrative Note bulletin
 */
export function parseNoteInfo(headerLine: string, rawText: string): DecodedNote {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let sender = "RTH Bangkok / GTS Center";
  let utcTime = "N/A";

  const parts = (headerLine || "").split(/\s+/);
  if (parts.length >= 3) {
    sender = parts[1] || sender;
    utcTime = parts[2] || utcTime;
  }

  return {
    headerLine: headerLine || "NOTE",
    sender,
    utcTime,
    noteText: rawText,
  };
}

/**
 * Main Unified GTS Decoder function supporting Synoptic, METAR, Warning, Notes, and UpperAir
 */
export function decodeGtsBulletin(rawText: string, forcedCategory?: string): GTSDecodeResult {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let headerLine = "";
  let countryCode = "";
  let utcTime = "";

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length >= 3 && /^[A-Z0-9]{4,6}$/i.test(parts[0]) && /^\d{6}$/.test(parts[2])) {
      headerLine = line;
      countryCode = parts[1];
      utcTime = parts[2];
      break;
    }
  }

  // Detect category if not explicitly specified
  const detected = detectGtsCategory(headerLine, rawText);
  const category = (forcedCategory as GTSCategoryType) || detected.category;
  const categoryLabel = detected.label;

  const data: GTSDecodeResult["data"] = { rawText };
  let totalItems = 0;

  if (category === "synoptic") {
    const stations = parseSynopBulletin(rawText);
    data.stations = stations;
    totalItems = stations.length;
  } else if (category === "metar") {
    const metarReports = parseMetarReport(rawText);
    data.metarReports = metarReports;
    totalItems = metarReports.length;
  } else if (category === "warning") {
    const warningInfo = parseWarningInfo(headerLine, rawText);
    data.warningInfo = warningInfo;
    totalItems = 1;
  } else if (category === "notes") {
    const noteInfo = parseNoteInfo(headerLine, rawText);
    data.noteInfo = noteInfo;
    totalItems = 1;
  }

  return {
    status: "success",
    category,
    categoryLabel,
    headerLine: headerLine || "N/A",
    countryCode: countryCode || "N/A",
    utcTime: utcTime || "N/A",
    totalItems,
    data,
  };
}
