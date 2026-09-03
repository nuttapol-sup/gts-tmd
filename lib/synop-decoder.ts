export interface DecodedSynopStation {
  stationId: string;
  stationName: string;
  countryFlag: string;
  temp?: string;
  dewPoint?: string;
  seaPressure?: string;
  stationPressure?: string;
  windDir?: string;
  windSpeed?: string;
  presentWeather?: string;
  rainAmount?: string;
  maxTemp?: string;
  rawLine: string;
}

export const WMO_STATIONS_MAP: Record<string, { name: string; flag: string }> = {
  // Thailand (48300 - 48583)
  "48300": { name: "แม่ฮ่องสอน", flag: "🇹🇭" },
  "48303": { name: "เชียงราย", flag: "🇹🇭" },
  "48327": { name: "เชียงใหม่", flag: "🇹🇭" },
  "48330": { name: "ลำปาง", flag: "🇹🇭" },
  "48331": { name: "พะเยา", flag: "🇹🇭" },
  "48332": { name: "น่าน", flag: "🇹🇭" },
  "48354": { name: "อุดรธานี", flag: "🇹🇭" },
  "48356": { name: "สกลนคร", flag: "🇹🇭" },
  "48357": { name: "นครพนม", flag: "🇹🇭" },
  "48378": { name: "พิษณุโลก", flag: "🇹🇭" },
  "48381": { name: "ขอนแก่น", flag: "🇹🇭" },
  "48400": { name: "นครสวรรค์", flag: "🇹🇭" },
  "48407": { name: "อุบลราชธานี", flag: "🇹🇭" },
  "48431": { name: "นครราชสีมา", flag: "🇹🇭" },
  "48450": { name: "ดอนเมือง", flag: "🇹🇭" },
  "48455": { name: "กรุงเทพมหานคร (บางนา)", flag: "🇹🇭" },
  "48456": { name: "สนามบินสุวรรณภูมิ", flag: "🇹🇭" },
  "48475": { name: "กาญจนบุรี", flag: "🇹🇭" },
  "48480": { name: "ชลบุรี / พัทยา", flag: "🇹🇭" },
  "48500": { name: "ประจวบคีรีขันธ์", flag: "🇹🇭" },
  "48517": { name: "ชุมพร", flag: "🇹🇭" },
  "48532": { name: "ระนอง", flag: "🇹🇭" },
  "48551": { name: "สุราษฎร์ธานี", flag: "🇹🇭" },
  "48565": { name: "ภูเก็ต", flag: "🇹🇭" },
  "48568": { name: "สงขลา", flag: "🇹🇭" },
  "48583": { name: "นราธิวาส", flag: "🇹🇭" },

  // Laos (48920 - 48957)
  "48921": { name: "เวียงจันทน์ (Vientiane)", flag: "🇱🇦" },
  "48924": { name: "วังเวียง (Vang Vieng)", flag: "🇱🇦" },
  "48925": { name: "หลักซาว (Lak Sao)", flag: "🇱🇦" },
  "48926": { name: "โพนโฮง (Phon Hong)", flag: "🇱🇦" },
  "48927": { name: "เมืองโพนโพน (Phon Phon)", flag: "🇱🇦" },
  "48928": { name: "ซำเหนือ (Sam Neua)", flag: "🇱🇦" },
  "48930": { name: "เชียงขวาง (Xieng Khouang)", flag: "🇱🇦" },
  "48935": { name: "โพนสะหวัน (Phonsavan)", flag: "🇱🇦" },
  "48938": { name: "ปากซัน (Paksan)", flag: "🇱🇦" },
  "48940": { name: "พงสาลี (Phongsali)", flag: "🇱🇦" },
  "48941": { name: "หลวงน้ำทา (Luang Namtha)", flag: "🇱🇦" },
  "48943": { name: "อุดมไชย (Oudomxay)", flag: "🇱🇦" },
  "48945": { name: "หลวงพระบาง (Luang Prabang)", flag: "🇱🇦" },
  "48946": { name: "เวียงจันทน์ (Vientiane-Nongteng)", flag: "🇱🇦" },
  "48947": { name: "สะหวันนะเขต (Savannakhet)", flag: "🇱🇦" },
  "48948": { name: "ปากเซ (Pakse)", flag: "🇱🇦" },
  "48952": { name: "ท่าแขก (Thakhek)", flag: "🇱🇦" },
  "48953": { name: "ไชยบุรี (Sainyabuli)", flag: "🇱🇦" },
  "48955": { name: "เซกอง (Sekong)", flag: "🇱🇦" },
  "48957": { name: "อัตตะปือ (Attapeu)", flag: "🇱🇦" },

  // Vietnam (48800 - 48900)
  "48808": { name: "ฮานอย (Hanoi)", flag: "🇻🇳" },
  "48820": { name: "ดานัง (Da Nang)", flag: "🇻🇳" },
  "48900": { name: "โฮจิมินห์ (Ho Chi Minh)", flag: "🇻🇳" },

  // Malaysia & Singapore
  "48601": { name: "ปีนัง (Penang)", flag: "🇲🇾" },
  "48647": { name: "กัวลาลัมเปอร์ (Kuala Lumpur)", flag: "🇲🇾" },
  "48698": { name: "สิงคโปร์ (Changi)", flag: "🇸🇬" },

  // Russia & Regional Stations
  "31960": { name: "วลาดิวอสต็อก (Vladivostok)", flag: "🇷🇺" },
  "31510": { name: "ฮาบารอฟสก์ (Khabarovsk)", flag: "🇷🇺" },
  "25703": { name: "มาการาดาน (Magadan)", flag: "🇷🇺" },
  "32540": { name: "เปโตรปัฟลอฟสค์-คัมชัตสกี (Petropavlovsk)", flag: "🇷🇺" },
  "29634": { name: "โนโวซีบีสค์ (Novosibirsk)", flag: "🇷🇺" },
  "30758": { name: "ชิตา (Chita)", flag: "🇷🇺" },
  "27612": { name: "มอสโก (Moscow)", flag: "🇷🇺" },
  "24959": { name: "ยาคุตสก์ (Yakutsk)", flag: "🇷🇺" },
  "30710": { name: "อีร์คุตสก์ (Irkutsk)", flag: "🇷🇺" },
};

export function decodeWindDirection(dd: number): string {
  if (dd === 0 || dd === 36) return "เหนือ (N)";
  if (dd > 0 && dd < 9) return "ตะวันออกเฉียงเหนือ (NE)";
  if (dd === 9) return "ตะวันออก (E)";
  if (dd > 9 && dd < 18) return "ตะวันออกเฉียงใต้ (SE)";
  if (dd === 18) return "ใต้ (S)";
  if (dd > 18 && dd < 27) return "ตะวันตกเฉียงใต้ (SW)";
  if (dd === 27) return "ตะวันตก (W)";
  if (dd > 27 && dd < 36) return "ตะวันตกเฉียงเหนือ (NW)";
  if (dd === 99) return "ลมแปรปรวน (VRB)";
  return `${dd * 10}°`;
}

export function decodePresentWeather(ww: number): string {
  if (ww === 0) return "ท้องฟ้าแจ่มใส";
  if (ww === 1 || ww === 2) return "มีเมฆเล็กน้อย";
  if (ww === 3) return "ท้องฟ้ามืดครึ้ม";
  if (ww === 5) return "หมอกแดด / ฟ้าหลัว (Haze)";
  if (ww === 10) return "หมอกบาง (Mist)";
  if (ww >= 40 && ww <= 49) return "หมอกหนา (Fog)";
  if (ww >= 50 && ww <= 59) return "ฝนพรำ (Drizzle)";
  if (ww >= 60 && ww <= 69) return "ฝนตกเล็กน้อยถึงปานกลาง (Rain)";
  if (ww >= 70 && ww <= 79) return "หิมะตก (Snow)";
  if (ww >= 80 && ww <= 89) return "ฝนซ่า / ฝนโชก (Showers)";
  if (ww >= 90) return "ฝนฟ้าคะนอง (Thunderstorm)";
  return `ww=${ww}`;
}

export function parseSynopBulletin(rawText: string): DecodedSynopStation[] {
  const lines = rawText.split(/\r?\n/);
  const results: DecodedSynopStation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const tokens = line.split(/\s+/);
    if (tokens.length < 2) continue;

    const firstToken = tokens[0];
    if (!/^\d{5}$/.test(firstToken)) continue;

    const stationId = firstToken;
    const info = WMO_STATIONS_MAP[stationId] || { name: `สถานี WMO ${stationId}`, flag: "🌐" };

    let temp: string | undefined;
    let dewPoint: string | undefined;
    let stationPressure: string | undefined;
    let seaPressure: string | undefined;
    let windDir: string | undefined;
    let windSpeed: string | undefined;
    let presentWeather: string | undefined;
    let rainAmount: string | undefined;
    let maxTemp: string | undefined;

    // Check group 2: Nddff
    if (tokens[2] && /^\d{5}$/.test(tokens[2])) {
      const dd = parseInt(tokens[2].substring(1, 3), 10);
      const ff = parseInt(tokens[2].substring(3, 5), 10);
      windDir = decodeWindDirection(dd);
      windSpeed = `${ff} นอต (${Math.round(ff * 1.852)} กม./ชม.)`;
    }

    for (let j = 1; j < tokens.length; j++) {
      const tok = tokens[j].replace("=", "");
      if (!/^\d{5}$/.test(tok)) continue;

      // 1s_nT T T (Temp)
      if (tok.startsWith("1") && tok.length === 5) {
        const sign = tok[1] === "1" ? "-" : "+";
        const val = (parseInt(tok.substring(2), 10) / 10).toFixed(1);
        temp = `${sign}${val} °C`;
      }
      // 2s_nT_dT_dT_d (Dew Point)
      else if (tok.startsWith("2") && tok.length === 5 && tok[1] !== "0") {
        const sign = tok[1] === "1" ? "-" : "+";
        const val = (parseInt(tok.substring(2), 10) / 10).toFixed(1);
        dewPoint = `${sign}${val} °C`;
      }
      // 3P_0P_0P_0P_0 (Station Level Pressure)
      else if (tok.startsWith("3") && tok.length === 5 && !tok.startsWith("333")) {
        const valStr = tok.substring(1);
        const valNum = parseInt(valStr, 10) / 10;
        const fullVal = valNum < 500 ? 1000 + valNum : valNum < 1000 ? 900 + valNum : valNum;
        stationPressure = `${fullVal.toFixed(1)} hPa`;
      }
      // 4P P P P (Sea Level Pressure)
      else if (tok.startsWith("4") && tok.length === 5) {
        const valStr = tok.substring(1);
        const valNum = parseInt(valStr, 10) / 10;
        const fullVal = valNum < 500 ? 1000 + valNum : 900 + valNum;
        seaPressure = `${fullVal.toFixed(1)} hPa`;
      }
      // 7wwW1W2 (Present Weather)
      else if (tok.startsWith("7") && tok.length === 5 && !tok.startsWith("70") && !tok.startsWith("77")) {
        const ww = parseInt(tok.substring(1, 3), 10);
        presentWeather = decodePresentWeather(ww);
      }
      // 6RRRt (Rainfall Amount)
      else if (tok.startsWith("6") && tok.length === 5 && !tok.startsWith("60000")) {
        const rrr = parseInt(tok.substring(1, 4), 10);
        if (rrr === 990) rainAmount = "ฝนตกเล็กน้อยมาก (< 0.1 มม.)";
        else if (rrr > 0 && rrr < 990) rainAmount = `${rrr} มม.`;
      }
      // 1s_nTxTxTx in Section 333 (Max Temp)
      else if (tok.startsWith("1") && tok.length === 5 && j > 5) {
        const sign = tok[1] === "1" ? "-" : "+";
        const val = (parseInt(tok.substring(2), 10) / 10).toFixed(1);
        maxTemp = `${sign}${val} °C`;
      }
    }

    results.push({
      stationId,
      stationName: info.name,
      countryFlag: info.flag,
      temp,
      dewPoint,
      seaPressure,
      stationPressure,
      windDir,
      windSpeed,
      presentWeather,
      rainAmount,
      maxTemp,
      rawLine: line,
    });
  }

  return results;
}
