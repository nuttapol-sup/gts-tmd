"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { convertTacToIwxxm } from "@/lib/iwxxm";
import {
  Code,
  Download,
  FileText,
  X,
  Thermometer,
  Wind,
  Gauge,
  Droplets,
  CloudRain,
  Satellite,
  Cloud,
  AlertTriangle,
  RadioTower,
  StickyNote,
  Calendar,
  Clock,
  Globe2,
  RotateCcw,
  Database,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { GTSBulletin } from "@/app/api/ftp/route";

export type WeatherCategory = "synoptic" | "upperair" | "warning" | "metar" | "notes";

const UTC_HOURS = [
  { utc: "00", ict: "07:00" },
  { utc: "03", ict: "10:00" },
  { utc: "06", ict: "13:00" },
  { utc: "09", ict: "16:00" },
  { utc: "12", ict: "19:00" },
  { utc: "15", ict: "22:00" },
  { utc: "18", ict: "01:00 (+1d)" },
  { utc: "21", ict: "04:00 (+1d)" },
];

// Helper to calculate the closest/current standard 3-hour UTC observation cycle (00, 03, 06, 09, 12, 15, 18, 21)
const getCurrentUtcCycle = (): string => {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const cycle = Math.floor(utcHours / 3) * 3;
  return String(cycle).padStart(2, "0");
};

const COUNTRIES = [
  { value: "zero", name: "--- All (ทั้งหมด) ---", flag: "🌐", iso: "" },
  { value: "AMMC", name: "Australia", flag: "🇦🇺", iso: "au" },
  { value: "VGDC", name: "Bangladesh", flag: "🇧🇩", iso: "bd" },
  { value: "WBSB", name: "Brunei", flag: "🇧🇳", iso: "bn" },
  { value: "BABJ", name: "China", flag: "🇨🇳", iso: "cn" },
  { value: "VHHH", name: "Hong Kong", flag: "🇭🇰", iso: "hk" },
  { value: "DEMS", name: "India", flag: "🇮🇳", iso: "in" },
  { value: "WIIX", name: "Indonesia", flag: "🇮🇩", iso: "id" },
  { value: "OLLL", name: "Iran", flag: "🇮🇷", iso: "ir" },
  { value: "RJTD", name: "Japan", flag: "🇯🇵", iso: "jp" },
  { value: "UAAA", name: "Kazakhstan", flag: "🇰🇿", iso: "kz" },
  { value: "OKBK", name: "Kuwait", flag: "🇰🇼", iso: "kw" },
  { value: "UAFF", name: "Kyrgyzstan", flag: "🇰🇬", iso: "kg" },
  { value: "VLIV", name: "Laos", flag: "🇱🇦", iso: "la" },
  { value: "VMMC", name: "Macao", flag: "🇲🇴", iso: "mo" },
  { value: "FMMI", name: "Madagascar", flag: "🇲🇬", iso: "mg" },
  { value: "WMKK", name: "Malaysia", flag: "🇲🇾", iso: "my" },
  { value: "VRMM", name: "Maldives", flag: "🇲🇻", iso: "mv" },
  { value: "MNUB", name: "Mongolia", flag: "🇲🇳", iso: "mn" },
  { value: "VBRR", name: "Myanmar", flag: "🇲🇲", iso: "mm" },
  { value: "VNKT", name: "Nepal", flag: "🇳🇵", iso: "np" },
  { value: "DKPY", name: "North Korea", flag: "🇰🇵", iso: "kp" },
  { value: "OOMS", name: "Oman", flag: "🇴🇲", iso: "om" },
  { value: "OCEAN", name: "Pacific Ocean", flag: "🌊", iso: "un" },
  { value: "RPLL", name: "Philippines", flag: "🇵🇭", iso: "ph" },
  { value: "ROAH", name: "Ryukyu Islands", flag: "🇯🇵", iso: "jp" },
    { value: "RUSSIA", name: "Russia (รัสเซีย)", flag: "🇷🇺", iso: "ru" },
  { value: "WSSS", name: "Singapore", flag: "🇸🇬", iso: "sg" },
  { value: "VCCC", name: "Sri Lanka", flag: "🇱🇰", iso: "lk" },
  { value: "RCAA", name: "Taiwan", flag: "🇹🇼", iso: "tw" },
  { value: "VTBB", name: "Thailand", flag: "🇹🇭", iso: "th" },
  { value: "UTTT", name: "Uzbekistan", flag: "🇺🇿", iso: "uz" },
  { value: "VVGL", name: "Vietnam", flag: "🇻🇳", iso: "vn" },
];


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

const WMO_STATIONS_MAP: Record<string, { name: string; flag: string }> = {
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
  "48940": { name: "พงสาลี", flag: "🇱🇦" },
  "48941": { name: "หลวงน้ำทา", flag: "🇱🇦" },
  "48943": { name: "อุดมไชย", flag: "🇱🇦" },
  "48945": { name: "หลวงพระบาง", flag: "🇱🇦" },
  "48946": { name: "เวียงจันทน์", flag: "🇱🇦" },
  "48947": { name: "สะหวันนะเขต", flag: "🇱🇦" },
  "48948": { name: "ปากเซ", flag: "🇱🇦" },
  "48952": { name: "ท่าแขก", flag: "🇱🇦" },
  "48953": { name: "ไชยบุรี", flag: "🇱🇦" },
  "48955": { name: "เซกอง", flag: "🇱🇦" },
  "48957": { name: "อัตตะปือ", flag: "🇱🇦" },
  "48808": { name: "ฮานอย", flag: "🇻🇳" },
  "48820": { name: "ดานัง", flag: "🇻🇳" },
  "48900": { name: "โฮจิมินห์", flag: "🇻🇳" },
  "48601": { name: "ปีนัง", flag: "🇲🇾" },
  "48647": { name: "กัวลาลัมเปอร์", flag: "🇲🇾" },
  "48698": { name: "สิงคโปร์ (Changi)", flag: "🇸🇬" },
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

function decodeWindDirection(dd: number): string {
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

function decodePresentWeather(ww: number): string {
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

function parseSynopBulletin(rawText: string): DecodedSynopStation[] {
  const lines = rawText.split("\n");
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
        let rawP = parseInt(tok.substring(1), 10);
        if (rawP < 1000) rawP += 10000;
        stationPressure = `${(rawP / 10).toFixed(1)} hPa`;
      }
      // 4PPPP (Sea Level Pressure)
      else if (tok.startsWith("4") && tok.length === 5) {
        let rawP = parseInt(tok.substring(1), 10);
        if (rawP < 1000) rawP += 10000;
        seaPressure = `${(rawP / 10).toFixed(1)} hPa`;
      }
      // 7wwW1W2 (Present weather)
      else if (tok.startsWith("7") && tok.length === 5) {
        const ww = parseInt(tok.substring(1, 3), 10);
        presentWeather = decodePresentWeather(ww);
      }
    }

    // Check line below for Section 333 (Max Temp & 24h Rain)
    if (i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (nextLine.includes("333")) {
        const subTokens = nextLine.split(/\s+/);
        for (const st of subTokens) {
          const cleanSt = st.replace("=", "");
          // 58s_nT_xT_xT_x (Max Temp)
          if (cleanSt.startsWith("58") && cleanSt.length === 5) {
            const sign = cleanSt[2] === "1" ? "-" : "+";
            const val = (parseInt(cleanSt.substring(3), 10) / 10).toFixed(1);
            maxTemp = `${sign}${val} °C`;
          }
          // 7RRRR (Rain 24h)
          else if (cleanSt.startsWith("70") && cleanSt.length === 5) {
            const rawRain = parseInt(cleanSt.substring(1), 10);
            rainAmount = `${(rawRain / 10).toFixed(1)} มม.`;
          }
        }
      }
    }

    results.push({
      stationId,
      stationName: info.name,
      countryFlag: info.flag,
      temp,
      dewPoint,
      stationPressure,
      seaPressure,
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

export default function DataHub() {
  const handleDownloadIwxxm = (xml: string, header: string) => {
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iwxxm_${header.replace(/\s+/g, "_")}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<WeatherCategory>("synoptic");

  useEffect(() => {
    if (tabParam && ["synoptic", "upperair", "warning", "metar", "notes"].includes(tabParam)) {
      setActiveTab(tabParam as WeatherCategory);
    } else if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash && ["synoptic", "upperair", "warning", "metar", "notes"].includes(hash)) {
        setActiveTab(hash as WeatherCategory);
      }
    }
  }, [tabParam]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedUtc, setSelectedUtc] = useState<string>(getCurrentUtcCycle);
  const [selectedCountry, setSelectedCountry] = useState<string>("zero");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [decodingBulletin, setDecodingBulletin] = useState<GTSBulletin | null>(null);
  const [iwxxmBulletin, setIwxxmBulletin] = useState<GTSBulletin | null>(null);
  const [copiedIwxxm, setCopiedIwxxm] = useState<boolean>(false);

  const [ftpBulletins, setFtpBulletins] = useState<GTSBulletin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"headers" | "single" | "all">("headers");
  const [selectedBulletinId, setSelectedBulletinId] = useState<string | null>(null);

  const fetchFtpData = async (isAllData = false) => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        date: selectedDate,
        utc: selectedUtc,
        country: selectedCountry,
        category: activeTab,
        allData: isAllData ? "true" : "false",
      });
      const res = await fetch(`/api/ftp?${query.toString()}`);
      const data = await res.json();
      if (data.status === "success" && data.bulletins) {
        setFtpBulletins(data.bulletins);
      } else {
        setFtpBulletins([]);
      }
    } catch (e) {
      console.error("Failed to fetch FTP bulletins", e);
      setFtpBulletins([]);
    } finally {
      setIsLoading(false);
    }
  };

  const bulletinIdParam = searchParams.get("bulletinId");

  useEffect(() => {
    if (bulletinIdParam) {
      setSelectedBulletinId(bulletinIdParam);
      setViewMode("single");
    } else {
      setViewMode("headers");
      setSelectedBulletinId(null);
    }
    fetchFtpData(false);
  }, [selectedCountry, selectedDate, selectedUtc, activeTab, bulletinIdParam]);

  const handleAllData = () => {
    setViewMode("all");
    setSelectedBulletinId(null);
    fetchFtpData(true);
  };

  const handleReset = () => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    setSelectedUtc(getCurrentUtcCycle());
    setSelectedCountry("zero");
    setViewMode("headers");
    setSelectedBulletinId(null);
  };

  const handleSelectSingleHeader = (id: string) => {
    setSelectedBulletinId(id);
    setViewMode("single");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Group bulletins by country name
  const groupedBulletins = ftpBulletins.reduce((acc, bulletin) => {
    const matchedCountry = COUNTRIES.find((c) => c.value === bulletin.countryCode);
    const countryName = matchedCountry ? matchedCountry.name : bulletin.countryCode;
    if (!acc[countryName]) {
      acc[countryName] = [];
    }
    acc[countryName].push(bulletin);
    return acc;
  }, {} as Record<string, GTSBulletin[]>);

  const selectedBulletin = ftpBulletins.find((b) => b.id === selectedBulletinId);

  const getCountryName = (code: string) => {
    const upper = (code || "").toUpperCase();
    if (upper === "RUSSIA" || upper.startsWith("RU") || upper === "RIII") {
      return "Russia (รัสเซีย)";
    }
    const found = COUNTRIES.find((c) => c.value.toUpperCase() === upper);
    return found ? found.name : code;
  };

  const renderCountryFlag = (code: string, className = "w-6 h-4") => {
    const upper = (code || "").toUpperCase();
    const found = (upper === "RUSSIA" || upper.startsWith("RU") || upper === "RIII")
      ? { name: "Russia (รัสเซีย)", iso: "ru" }
      : COUNTRIES.find((c) => c.value.toUpperCase() === upper);
    if (found && found.iso) {
      return (
        <img
          src={`https://flagcdn.com/w40/${found.iso}.png`}
          srcSet={`https://flagcdn.com/w80/${found.iso}.png 2x`}
          alt={found.name}
          className={`${className} object-cover rounded-[3px] border border-white/20 shadow-sm shrink-0 inline-block`}
          loading="lazy"
        />
      );
    }
    return <span className="text-base leading-none">🌐</span>;
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBaseHeaderCode = (bulletin: GTSBulletin) => {
    const text = (bulletin.headerLine || bulletin.dataType || "").trim();
    const parts = text.split(/\s+/);
    return parts[0] ? parts[0].toUpperCase() : "OTHER";
  };

  // Deduplicate bulletins so identical headers per country display only 1 button
  const displayBulletins: GTSBulletin[] = [];
  const seenCountryHeaders = new Set<string>();

  for (const item of ftpBulletins) {
    if (activeTab === "synoptic" || item.category === "synoptic") {
      const dt = (item.dataType || item.headerLine || "").trim().toUpperCase();
      if (!dt.startsWith("SM") && !dt.startsWith("SI")) {
        continue;
      }
    }

    const rawCode = (item.countryCode || "OTHER").toUpperCase();
    const code = (rawCode.startsWith("RU") || rawCode === "RIII" || rawCode === "RUSSIA") ? "RUSSIA" : rawCode;
    const headerStr = (item.headerLine || item.dataType || "").trim();
    const key = `${code}___${headerStr}`;
    if (!seenCountryHeaders.has(key)) {
      seenCountryHeaders.add(key);
      displayBulletins.push({
        ...item,
        countryCode: code,
      });
    }
  }

  // Group bulletins by countryCode
  const groupedByCountry = displayBulletins.reduce<Record<string, GTSBulletin[]>>((acc, item) => {
    const rawCode = (item.countryCode || "OTHER").toUpperCase();
    const code = (rawCode.startsWith("RU") || rawCode === "RIII" || rawCode === "RUSSIA") ? "RUSSIA" : rawCode;
    if (!acc[code]) {
      acc[code] = [];
    }
    acc[code].push(item);
    return acc;
  }, {});

  // Group news by same code together and sort ascendingly (จากน้อยไปมาก)
  Object.keys(groupedByCountry).forEach((code) => {
    groupedByCountry[code].sort((a, b) => {
      const hA = (a.headerLine || a.dataType || "").trim();
      const hB = (b.headerLine || b.dataType || "").trim();
      return hA.localeCompare(hB, undefined, { numeric: true, sensitivity: "base" });
    });
  });

  const countryCodes = Object.keys(groupedByCountry).sort((a, b) => {
    const nameA = getCountryName(a);
    const nameB = getCountryName(b);
    return nameA.localeCompare(nameB, "th");
  });

  return (
    <section className="py-8 relative z-10" id="data-hub">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Navigation Bar */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 shadow-xl max-w-4xl mx-auto">
          <button
            onClick={() => setActiveTab("synoptic")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "synoptic"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Satellite className="w-4 h-4" />
            ข่าว Synoptic
          </button>

          <button
            onClick={() => setActiveTab("upperair")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "upperair"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Cloud className="w-4 h-4" />
            ข่าว Upper Air (Wind)
          </button>

          <button
            onClick={() => setActiveTab("warning")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "warning"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            ประกาศเตือนภัย (War)
          </button>

          <button
            onClick={() => setActiveTab("metar")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "metar"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <RadioTower className="w-4 h-4" />
            ข่าว METAR (การบิน)
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "notes"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <StickyNote className="w-4 h-4" />
            Note ท้ายข่าว
          </button>
        </div>

        {/* GTS Query Form Control Card */}
        <div className="max-w-3xl mx-auto">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-br from-[#0f172a]/95 via-[#0f1d3a]/90 to-[#0b132b]/95 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Badge & Card Title */}
            <div className="text-center space-y-2 border-b border-slate-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {activeTab === "synoptic" && "ข้อมูลผิวพื้น (Surface Synoptic)"}
                {activeTab === "upperair" && "ข้อมูลบรรยากาศชั้นบน (Upper Air / Wind)"}
                {activeTab === "warning" && "ประกาศเตือนภัยสภาพอากาศ (Warning / War)"}
                {activeTab === "metar" && "ข้อมูลอากาศการบิน (METAR / TAF)"}
                {activeTab === "notes" && "Note ท้ายข่าวสภาพอากาศ (GTS Raw Notes)"}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                ข้อมูลข่าว {
                  activeTab === "synoptic" ? "Synoptic" :
                  activeTab === "upperair" ? "Upper Air (Wind)" :
                  activeTab === "warning" ? "เตือนภัย (War)" :
                  activeTab === "metar" ? "METAR" : "Note"
                }
              </h2>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* 1. Date Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  เลือกวันที่ (DD/MM/YYYY)
                </label>
                <div className="max-w-xs mx-auto relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-sm font-mono text-center text-cyan-300 focus:outline-none focus:border-cyan-300 shadow-inner"
                  />
                </div>
              </div>

              {/* 2. UTC Cycle Time Radio Selectors */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 text-center flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  รอบเวลาตรวจวัดมาตรฐาน (UTC Cycle Time)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-w-2xl mx-auto">
                  {UTC_HOURS.map((item) => (
                    <button
                      key={item.utc}
                      onClick={() => setSelectedUtc(item.utc)}
                      className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        selectedUtc === item.utc
                          ? "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white border-cyan-300 shadow-md shadow-cyan-500/30 scale-105"
                          : "bg-slate-900/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold font-mono">{item.utc}. UTC</span>
                      <span className="text-[10px] opacity-75 font-mono">({item.ict})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Country Select Dropdown */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 text-center flex items-center justify-center gap-1.5">
                  <Globe2 className="w-4 h-4 text-cyan-400" />
                  Select a Country (เลือกประเทศ)
                </label>
                <div className="max-w-md mx-auto">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-sm text-white focus:outline-none focus:border-cyan-300 font-medium cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.value === "zero" ? c.name : `${c.name} (${c.value})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Action Buttons (Removed Browse button as requested) */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleAllData}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4" />
                  )}
                  All Data (ดูข้อมูลทั้งหมด)
                </button>

                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-500 to-amber-600 hover:brightness-110 text-white shadow-lg shadow-rose-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset (ล้างค่า)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Display Area for Browse Headers List vs Single Selected Header vs All Data */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* ----------------- MODE 1: BROWSE HEADERS INDEX LIST (เมื่อเลือกประเทศ/วันที่/UTC) ----------------- */}
          {viewMode === "headers" && (
            <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <button
                  onClick={handleAllData}
                  className="text-cyan-400 hover:text-cyan-300 font-bold text-sm underline flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  All Data &lt;&lt; -- แสดงข้อมูลทั้งหมด
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  พบ {displayBulletins.length} รายการ (แยก {countryCodes.length} ประเทศ)
                </span>
              </div>

              {isLoading ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span>กำลังดึงรายการหัวข่าวสาร ...</span>
                </div>
              ) : displayBulletins.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <p className="text-sm text-slate-300 font-semibold">
                    ไม่พบรายการหัวข่าวตรงตามเงื่อนไขที่เลือก (วันที่ {selectedDate}, UTC {selectedUtc}, {selectedCountry === "zero" ? "แสดงทุกประเทศ" : `ประเทศ ${selectedCountry}`})
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-xs text-slate-400">
                    คลิกเลือก **หัวข่าว** ด้านล่าง (แยกจำแนกตามประเทศ) เพื่อเปิดอ่านเนื้อหาข่าวเฉพาะหัวข่านั้นๆ:
                  </p>

                  <div className="space-y-5">
                    {countryCodes.map((code) => {
                      const countryBulletins = groupedByCountry[code];
                      const countryName = getCountryName(code);

                      // Group country's bulletins into rows by base header code (e.g. SMIN01, SMIN02, SMIN03...)
                      const subGroupsByBaseCode = countryBulletins.reduce<Record<string, GTSBulletin[]>>((acc, item) => {
                        const baseKey = getBaseHeaderCode(item);
                        if (!acc[baseKey]) {
                          acc[baseKey] = [];
                        }
                        acc[baseKey].push(item);
                        return acc;
                      }, {});

                      const sortedBaseKeys = Object.keys(subGroupsByBaseCode).sort((a, b) => {
                        return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
                      });

                      return (
                        <div key={code} className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-3 shadow-lg">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2.5">
                              {renderCountryFlag(code, "w-6 h-4")}
                              <span className="font-bold text-sm text-cyan-200">
                                {countryName} ({code})
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                              {countryBulletins.length} รายการ
                            </span>
                          </div>

                          {/* Row-by-Row Header Groups (ขึ้นบรรทัดใหม่แยกจำแนกตามรหัสข่าวหลัก) */}
                          <div className="space-y-1.5 pt-1 font-mono text-sm">
                            {sortedBaseKeys.map((baseKey) => {
                              const itemsInRow = subGroupsByBaseCode[baseKey];
                              return (
                                <div
                                  key={baseKey}
                                  className="flex flex-wrap items-center gap-2.5 py-1.5 border-b border-slate-800/60 last:border-0"
                                >
                                  {itemsInRow.map((item) => (
                                    <a
                                      key={item.id}
                                      href={`/services?tab=${activeTab}&date=${selectedDate}&utc=${selectedUtc}&country=${selectedCountry}&bulletinId=${encodeURIComponent(item.id)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-600 hover:text-white text-cyan-300 font-semibold border border-cyan-500/40 hover:border-cyan-300 transition-all cursor-pointer shadow-md text-xs sm:text-sm inline-flex items-center gap-1.5"
                                      title={`กดเพื่อเปิดอ่านเนื้อหาข่าว ${item.headerLine} ในแท็บใหม่`}
                                    >
                                      <span>{item.headerLine || item.dataType}</span>
                                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400 opacity-80" />
                                    </a>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------- MODE 2: SINGLE SELECTED HEADER VIEW (เมื่อกดเข้า หัวข่าวนั้นๆ) ----------------- */}
          {viewMode === "single" && selectedBulletin && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setViewMode("headers")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                  กลับไปหน้ารวมหัวข่าว (Back to Headers List)
                </button>

                <span className="text-xs text-cyan-400 font-mono font-bold bg-cyan-950/60 px-3 py-1.5 rounded-xl border border-cyan-800">
                  แสดงหัวข่าว: {selectedBulletin.headerLine}
                </span>
              </div>

              {(() => {
                // Display ONLY the exact bulletin that was clicked
                const listToDisplay = [selectedBulletin];

                return (
                  <div className="space-y-6">
                    {listToDisplay.map((bulletin, idx) => (
                      <div
                        key={bulletin.id}
                        className={`glass-panel rounded-3xl p-6 border space-y-4 shadow-2xl relative overflow-hidden transition-all ${
                          idx === 0
                            ? "border-emerald-500/50 bg-gradient-to-br from-[#0f2427]/90 via-[#0d1f35]/90 to-[#0b132b]/95"
                            : "border-cyan-500/30 bg-slate-900/90"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            {idx === 0 && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-500/50 shadow-md shadow-emerald-500/20 animate-pulse">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                ข้อมูลตัวล่าสุด (LATEST)
                              </span>
                            )}
                            <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-sm font-bold border border-cyan-500/40">
                              {bulletin.headerLine}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-xs font-bold border border-blue-500/30 flex items-center gap-2">
                              {renderCountryFlag(bulletin.countryCode, "w-5 h-3.5")}
                              <span>รหัสประเทศ: {getCountryName(bulletin.countryCode)} ({bulletin.countryCode})</span>
                            </span>
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                              {bulletin.categoryLabel}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => setIwxxmBulletin(bulletin)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-md shadow-purple-500/20 border border-purple-400/30 transition-all cursor-pointer"
                            >
                              <Code className="w-3.5 h-3.5 text-purple-200" />
                              <span>แปลงเป็น IWXXM (XML)</span>
                            </button>
                            <button
                              onClick={() => setDecodingBulletin(bulletin)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/30 transition-all cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>ถอดรหัสข่าว (Decode)</span>
                            </button>
                            <button
                              onClick={() => handleCopy(bulletin.rawText, bulletin.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer shrink-0"
                            >
                              {copiedId === bulletin.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-300">คัดลอกรหัสแล้ว</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>คัดลอกเนื้อหาข่าว</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <pre className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner max-h-[500px] overflow-y-auto">
                          <code>{bulletin.rawText}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ----------------- MODE 3: ALL DATA EXPANDED VIEW (เมื่อกด All Data) ----------------- */}
          {viewMode === "all" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  แสดงข้อมูลทั้งหมด (พบ {displayBulletins.length} ข่าว - แยก {countryCodes.length} ประเทศ)
                </h3>
                <button
                  onClick={() => setViewMode("headers")}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  สลับไปดูเฉพาะรายการหัวข่าว
                </button>
              </div>

              {isLoading ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3 glass-panel rounded-2xl">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span>กำลังอ่านไฟล์ข้อมูลข่าวสารทั้งหมด ...</span>
                </div>
              ) : (
                <div className="space-y-8">
                  {countryCodes.map((code) => {
                    const countryBulletins = groupedByCountry[code];
                    const countryName = getCountryName(code);
                    return (
                      <div key={code} className="space-y-4">
                        <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-slate-900 border border-cyan-500/30 text-cyan-300 font-bold text-sm shadow-md">
                          <div className="flex items-center gap-2.5">
                            {renderCountryFlag(code, "w-6 h-4")}
                            <span>{countryName} ({code})</span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                            {countryBulletins.length} ข่าว
                          </span>
                        </div>

                        <div className="space-y-4">
                          {countryBulletins.map((bulletin) => (
                            <div
                              key={bulletin.id}
                              className="glass-panel rounded-2xl p-5 border border-cyan-500/25 hover:border-cyan-400 transition-all duration-300 space-y-3 shadow-xl"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                                    {bulletin.headerLine}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                                    {bulletin.categoryLabel}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setIwxxmBulletin(bulletin)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-md shadow-purple-500/20 border border-purple-400/30 transition-all cursor-pointer"
                                  >
                                    <Code className="w-3.5 h-3.5 text-purple-200" />
                                    <span>แปลงเป็น IWXXM (XML)</span>
                                  </button>
                                  <button
                                    onClick={() => setDecodingBulletin(bulletin)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/30 transition-all cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>ถอดรหัสข่าว (Decode)</span>
                                  </button>
                                  <button
                                    onClick={() => handleCopy(bulletin.rawText, bulletin.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
                                  >
                                  {copiedId === bulletin.id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-300">คัดลอกรหัสแล้ว</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>คัดลอกข้อความข่าว</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              </div>

                              <pre className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner max-h-[360px] overflow-y-auto">
                                <code>{bulletin.rawText}</code>
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category Description Box */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2 text-center max-w-4xl mx-auto">
          <h3 className="font-bold text-sm text-cyan-300 tracking-wider uppercase">
            {activeTab === "synoptic" && "SYNOPTIC (Surface Synoptic Observations)"}
            {activeTab === "upperair" && "UPPER AIR (Wind & Sounding Observations)"}
            {activeTab === "warning" && "WARNING (Weather Warnings & SIGMET)"}
            {activeTab === "metar" && "METAR (Aviation Routine Weather Report)"}
            {activeTab === "notes" && "NOTE (GTS Bulletin Raw Text Notes)"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            {activeTab === "synoptic" && "ข้อมูลตรวจอากาศผิวพื้นแสดงสภาพอากาศบริเวณพื้นดิน ทุก 3 ชั่วโมง (00, 03, 06, 09, 12, 15, 18, 21 UTC)"}
            {activeTab === "upperair" && "ข้อมูลตรวจอากาศชั้นบนรายงานทิศทาง ความเร็วลม และบรรยากาศชั้นบน"}
            {activeTab === "warning" && "ประกาศเตือนภัยสภาพอากาศและพายุหมุนกะทันหัน หรือสภาวะอากาศร้ายแรงทางการบิน"}
            {activeTab === "metar" && "รายงานสภาพอากาศทางการบินสำหรับสนามบินและสายการบินต่างประเทศ"}
            {activeTab === "notes" && "หมายเหตุและข่าวสารประกอบส่วนท้ายโทรสารอุตุนิยมวิทยาระหว่างประเทศ"}
          </p>
        </div>
      </div>

        {/* SYNOP / GTS Decoder Modal Dialog */}
        {decodingBulletin && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-4xl rounded-3xl p-6 sm:p-8 border border-cyan-500/40 bg-slate-900/95 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                      {decodingBulletin.headerLine}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                      {decodingBulletin.categoryLabel}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      ระบบถอดรหัสข่าวสารอุตุนิยมวิทยา WMO SYNOP
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    ผลการถอดรหัสรหัสตัวเลข SYNOP 5-Digit Group
                  </h3>
                </div>

                <button
                  onClick={() => setDecodingBulletin(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Decoded Table */}
              <div className="overflow-x-auto overflow-y-auto max-h-[50vh] rounded-2xl border border-slate-800 bg-slate-950/60 p-2">
                {(() => {
                  const decodedList = parseSynopBulletin(decodingBulletin.rawText);
                  if (decodedList.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-400 space-y-2">
                        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                        <p className="text-sm font-medium">ไม่พบกลุ่มตัวเลขรหัส SYNOP ที่ตรงตามมาตรฐาน WMO FM 12 ในข่าวสารนี้</p>
                      </div>
                    );
                  }

                  return (
                    <table className="w-full text-left text-xs sm:text-sm text-slate-200">
                      <thead className="bg-slate-900/90 text-cyan-300 text-xs uppercase tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3 font-semibold">สถานีตรวจอากาศ</th>
                          <th className="px-4 py-3 font-semibold">อุณหภูมิ (Temp)</th>
                          <th className="px-4 py-3 font-semibold">จุดน้ำค้าง (Dew Point)</th>
                          <th className="px-4 py-3 font-semibold">ความกดอากาศ (Sea Level)</th>
                          <th className="px-4 py-3 font-semibold">ทิศทาง & ความเร็วลม</th>
                          <th className="px-4 py-3 font-semibold">สภาพอากาศปัจจุบัน</th>
                          <th className="px-4 py-3 font-semibold">ฝนสะสม</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {decodedList.map((st, idx) => (
                          <tr key={idx} className="hover:bg-cyan-500/5 transition-all">
                            <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{st.countryFlag}</span>
                                <div>
                                  <span className="text-white font-bold block">{st.stationName}</span>
                                  <span className="text-[11px] font-mono text-cyan-400">รหัส WMO: {st.stationId}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-amber-300 whitespace-nowrap">
                              {st.temp || "---"}
                              {st.maxTemp && <span className="text-[11px] text-amber-400/80 block font-normal">(สูงสุด {st.maxTemp})</span>}
                            </td>
                            <td className="px-4 py-3.5 text-sky-300 font-medium whitespace-nowrap">
                              {st.dewPoint || "---"}
                            </td>
                            <td className="px-4 py-3.5 text-cyan-300 font-mono whitespace-nowrap">
                              {st.seaPressure || st.stationPressure || "---"}
                            </td>
                            <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                              {st.windDir ? `${st.windDir} / ${st.windSpeed}` : "---"}
                            </td>
                            <td className="px-4 py-3.5 text-emerald-300 font-medium whitespace-nowrap">
                              {st.presentWeather || "ปกติ"}
                            </td>
                            <td className="px-4 py-3.5 text-blue-300 font-mono whitespace-nowrap">
                              {st.rainAmount || "---"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>

              {/* Raw Text Reference */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-slate-400 block">ข้อความข่าวสาร GTS ดั้งเดิม (Raw Text Reference):</span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-400/80 overflow-x-auto whitespace-pre-wrap max-h-[100px] overflow-y-auto">
                  <code>{decodingBulletin.rawText}</code>
                </pre>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setDecodingBulletin(null)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  ปิดหน้าต่างถอดรหัส
                </button>
              </div>
            </div>
          </div>
        )}


        {/* IWXXM 3.0 XML Converter Modal Dialog */}
        {iwxxmBulletin && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="glass-panel w-full max-w-4xl rounded-3xl p-6 sm:p-8 border border-purple-500/40 bg-slate-900/95 space-y-6 shadow-2xl relative max-h-[90vh] flex flex-col justify-between">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
                      {iwxxmBulletin.headerLine}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                      ICAO / WMO SWIM Standard
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      IWXXM 3.0 XML GML Standard
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    ผลการแปลงรหัสข่าว TAC ➔ เป็น IWXXM 3.0 XML (ICAO Annex 3)
                  </h3>
                </div>

                <button
                  onClick={() => setIwxxmBulletin(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* IWXXM XML Viewer */}
              {(() => {
                const res = convertTacToIwxxm(iwxxmBulletin.rawText);
                return (
                  <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                        <Code className="w-4 h-4 text-purple-400" />
                        ไฟล์โค้ด IWXXM XML Standard (GML Schema):
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(res.xml);
                            setCopiedIwxxm(true);
                            setTimeout(() => setCopiedIwxxm(false), 2000);
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedIwxxm ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">คัดลอก XML แล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>คัดลอกโค้ด XML</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDownloadIwxxm(res.xml, iwxxmBulletin.headerLine)}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>ดาวน์โหลดไฟล์ .xml</span>
                        </button>
                      </div>
                    </div>

                    <pre className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 font-mono text-xs text-purple-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner max-h-[45vh] overflow-y-auto flex-1">
                      <code>{res.xml}</code>
                    </pre>
                  </div>
                );
              })()}

              {/* Modal Footer */}
              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setIwxxmBulletin(null)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer"
                >
                  ปิดหน้าต่าง IWXXM
                </button>
              </div>
            </div>
          </div>
        )}

    </section>
  );
}
