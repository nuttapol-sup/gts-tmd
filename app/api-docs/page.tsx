"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  Zap,
  Check,
  Copy,
  Terminal,
  ShieldCheck,
  Globe,
  Plane,
  AlertTriangle,
  Cloud,
  Play,
  Database,
  ExternalLink,
  Lock,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";

interface ApiEndpointInfo {
  name: string;
  nameEn: string;
  method: "GET";
  path: string;
  categoryKey: string;
  badgeColor: string;
  icon: any;
  description: string;
  descriptionEn: string;
}

const API_ENDPOINTS: ApiEndpointInfo[] = [
  {
    name: "API ข่าว Synoptic (Surface)",
    nameEn: "Synoptic Surface Weather API",
    method: "GET",
    path: "/api/ftp/synoptic",
    categoryKey: "synoptic",
    badgeColor: "from-cyan-500 to-blue-600",
    icon: Globe,
    description: "ดึงเฉพาะข้อมูลข่าวสารอุตุนิยมวิทยาตรวจอากาศผิวพื้น (AAXX/BBXX) พร้อมสกัดรหัสสถานี WMO 5 หลัก และข้อความข่าวรายสถานี",
    descriptionEn: "Fetches Surface Synoptic observation bulletins (AAXX/BBXX) with extracted 5-digit WMO station IDs.",
  },
  {
    name: "API ข่าว METAR (อากาศการบิน)",
    nameEn: "METAR Aviation Weather API",
    method: "GET",
    path: "/api/ftp/metar",
    categoryKey: "metar",
    badgeColor: "from-indigo-500 to-purple-600",
    icon: Plane,
    description: "ดึงเฉพาะข้อมูลข่าวสภาพอากาศการบิน (หัวข่าว SA, FT, SP, FC / METAR, TAF, SPECI) รายสนามบิน ICAO ทั่วโลก พร้อมสกัดรหัสสนามบิน 4 หลัก รองรับฉบับแก้ไข (COR, AMD, AUTO)",
    descriptionEn: "Fetches aeronautical METAR/TAF/SPECI bulletins (SA, FT, SP, FC headers) with extracted 4-letter ICAO airport IDs and modifier support (COR, AMD, AUTO).",
  },
  {
    name: "API ข่าวเตือนภัย (Weather Warning)",
    nameEn: "Weather Warning Bulletin API",
    method: "GET",
    path: "/api/ftp/warning",
    categoryKey: "warning",
    badgeColor: "from-amber-500 to-orange-600",
    icon: AlertTriangle,
    description: "ดึงเฉพาะข่าวประกาศเตือนภัยสภาพอากาศ พายุหมุนเขตร้อน และข่าว SIGMET ทางการบิน",
    descriptionEn: "Fetches severe weather warnings, tropical cyclone alerts, and aviation SIGMETs.",
  },
  {
    name: "API ข่าว Upper Air (ตรวจอากาศชั้นบน)",
    nameEn: "Upper Air Sounding API",
    method: "GET",
    path: "/api/ftp/upperair",
    categoryKey: "upperair",
    badgeColor: "from-sky-500 to-teal-600",
    icon: Cloud,
    description: "ดึงเฉพาะข้อมูลข่าวการตรวจอากาศชั้นบน (Wind / Sounding Data / TTAA)",
    descriptionEn: "Fetches upper-air sounding observation bulletins (Wind/Temp aloft).",
  },
  {
    name: "API รวมทุกหมวดหมู่ (Combined GTS Bulletin API)",
    nameEn: "Combined GTS Bulletin API",
    method: "GET",
    path: "/api/ftp",
    categoryKey: "all",
    badgeColor: "from-emerald-500 to-teal-600",
    icon: Database,
    description: "ดึงข้อมูลข่าวสารสภาพอากาศรวมทุกหมวดหมู่ สามารถกรองเพิ่มเติมด้วย date, country, utc ได้ตามต้องการ",
    descriptionEn: "Fetches all weather bulletins with optional date, country, and category filters.",
  },
];

const COUNTRY_OPTIONS = [
  { value: "", label: "--- All (ทั้งหมด) ---" },
  { value: "AMMC", label: "Australia (AMMC)" },
  { value: "VGDC", label: "Bangladesh (VGDC)" },
  { value: "VQPR", label: "Bhutan (VQPR)" },
  { value: "WBSB", label: "Brunei (WBSB)" },
  { value: "VDPP", label: "Cambodia (VDPP)" },
  { value: "BABJ", label: "China (BABJ)" },
  { value: "VHHH", label: "Hong Kong (VHHH)" },
  { value: "DEMS", label: "India (DEMS)" },
  { value: "WIIX", label: "Indonesia (WIIX)" },
  { value: "OLLL", label: "Iran (OLLL)" },
  { value: "RJTD", label: "Japan (RJTD)" },
  { value: "UAAA", label: "Kazakhstan (UAAA)" },
  { value: "OKBK", label: "Kuwait (OKBK)" },
  { value: "UAFF", label: "Kyrgyzstan (UAFF)" },
  { value: "VLIV", label: "Laos (VLIV)" },
  { value: "VMMC", label: "Macao (VMMC)" },
  { value: "FMMI", label: "Madagascar (FMMI)" },
  { value: "WMKK", label: "Malaysia (WMKK)" },
  { value: "VRMM", label: "Maldives (VRMM)" },
  { value: "MNUB", label: "Mongolia (MNUB)" },
  { value: "VBRR", label: "Myanmar (VBRR)" },
  { value: "VNKT", label: "Nepal (VNKT)" },
  { value: "DKPY", label: "North Korea (DKPY)" },
  { value: "OOMS", label: "Oman (OOMS)" },
  { value: "OCEAN", label: "Pacific Ocean (OCEAN)" },
  { value: "RPLL", label: "Philippines (RPLL)" },
  { value: "ROAH", label: "Ryukyu Islands (ROAH)" },
  { value: "RUSSIA", label: "Russia (รัสเซีย)" },
  { value: "WSSS", label: "Singapore (WSSS)" },
  { value: "VCCC", label: "Sri Lanka (VCCC)" },
  { value: "RCAA", label: "Taiwan (RCAA)" },
  { value: "VTBB", label: "Thailand (VTBB)" },
  { value: "UTTT", label: "Uzbekistan (UTTT)" },
  { value: "VVGL", label: "Vietnam (VVGL)" },
];

function getTodayDateStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ApiDocsPage() {
  const { lang, t } = useLanguage();
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointInfo>(API_ENDPOINTS[0]);
  const [paramDate, setParamDate] = useState<string>(getTodayDateStr());
  const [paramCountry, setParamCountry] = useState<string>("");
  const [paramUtc, setParamUtc] = useState<string>("");

  const [testResult, setTestResult] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  // Construct query string for tester
  const buildQueryUrl = (path: string) => {
    const params = new URLSearchParams();
    if (paramDate) params.set("date", paramDate);
    if (paramCountry) params.set("country", paramCountry);
    if (paramUtc) params.set("utc", paramUtc);

    const q = params.toString();
    return q ? `${path}?${q}` : path;
  };

  const handleExecuteTest = async () => {
    setIsExecuting(true);
    setTestResult(null);

    const testUrl = buildQueryUrl(selectedEndpoint.path);
    try {
      const res = await fetch(testUrl);
      const data = await res.json();
      setTestResult({
        status: res.status,
        statusText: res.statusText,
        url: res.url,
        data,
      });
    } catch (err: any) {
      setTestResult({
        status: 500,
        statusText: "Fetch Error",
        error: err.message || "Failed to fetch API endpoint",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyJson = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0b132b] text-slate-900 dark:text-slate-100 flex flex-col pt-24 sm:pt-28 lg:pt-44 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
        {/* Header Hero Section */}
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-white dark:bg-gradient-to-br dark:from-[#0d1b3e] dark:via-[#0f274c] dark:to-[#0b132b] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl transition-colors">
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>{t("บริการข้อมูลข่าวสารอุตุนิยมวิทยา API", "GTS TMD RESTful API Services")}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {t("ศูนย์บริการเชื่อมต่อข้อมูล API อุตุนิยมวิทยา", "Meteorological API Developer Hub")}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {t(
                "เปิดให้บริการเชื่อมต่อดึงข้อมูลข่าวสารสภาพอากาศ GTS (Synoptic, METAR, Warning, UpperAir) ผ่านมาตรฐาน RESTful API ในรูปแบบ JSON สำหรับนักพัฒนา, หน่วยงาน และแอปพลิเคชันภายนอก",
                "Provides high-performance RESTful JSON APIs for real-time GTS weather bulletins (Synoptic, METAR, Warnings, UpperAir) for developers and partner agencies."
              )}
            </p>

            {/* Server Security & Compliance Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {t("เซิร์ฟเวอร์เปิดใช้งาน (HTTPS Status: 200 OK)", "Server Status: 200 OK (Active)")}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t("OWASP Cybersecurity Hardened", "OWASP Cybersecurity Hardened")}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t("สกัดรหัสสนามบิน ICAO 4 หลัก & COR", "4-Letter ICAO Airport & COR Parsed")}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold">
                <Plane className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {t("กรองหัวข่าว METAR (SA, FT, SP, FC)", "METAR Headers: SA, FT, SP, FC")}
              </span>
            </div>
          </div>
        </div>

        {/* API Endpoint Showcase Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span>{t("รายการ API ที่เปิดให้บริการ (Active Endpoints)", "Active API Service Endpoints")}</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Total {API_ENDPOINTS.length} Endpoints</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {API_ENDPOINTS.map((endpoint, idx) => {
              const IconComp = endpoint.icon;
              const isSelected = selectedEndpoint.path === endpoint.path;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  className={`group rounded-2xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/60 dark:bg-slate-900 shadow-md ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-emerald-400"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold font-mono uppercase bg-emerald-600 text-white shadow-xs">
                        {endpoint.method}
                      </span>
                      <IconComp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {t(endpoint.name, endpoint.nameEn)}
                      </h3>
                      <p className="text-xs font-mono text-emerald-800 dark:text-emerald-300 font-semibold mt-1 break-all bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                        {endpoint.path}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {t(endpoint.description, endpoint.descriptionEn)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {t("คลิกเพื่อทดสอบยิง API", "Click to Test API")}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Try-It-Out Developer Console Workspace */}
        <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6 bg-white dark:bg-slate-900 shadow-sm dark:shadow-2xl">
          {/* Workspace Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {t("คำสั่ง API", "API Commands")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("กำลังทดสอบ API:", "Selected API:")}{" "}
                  <span className="text-emerald-800 dark:text-emerald-300 font-mono font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    {selectedEndpoint.path}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* LIVE TESTER */}
          <div className="space-y-6">
            {/* Parameters Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  {t("1. วันที่ (date - YYYY-MM-DD)", "1. Date (YYYY-MM-DD)")}
                </label>
                <input
                  type="date"
                  value={paramDate}
                  onChange={(e) => setParamDate(e.target.value)}
                  placeholder="เช่น 2026-09-03"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">* ละเว้นเพื่อดึงวันปัจจุบัน</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  {t("2. รหัสประเทศ (country)", "2. Country Code")}
                </label>
                <select
                  value={paramCountry}
                  onChange={(e) => setParamCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-1">
                      {c.label}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">* เลือกประเทศที่ต้องการกรอง</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  {t("3. รหัสเวลา UTC (utc)", "3. UTC Hour (00, 06, 12)")}
                </label>
                <input
                  type="text"
                  value={paramUtc}
                  onChange={(e) => setParamUtc(e.target.value)}
                  placeholder="เช่น 00, 06, 12, 18"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">* ละเว้นเพื่อดึงทุกช่วงเวลา</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="font-mono text-xs text-slate-800 dark:text-emerald-300 overflow-x-auto py-1 flex items-center">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 mr-2 shrink-0">
                  GET
                </span>
                <span className="break-all">{buildQueryUrl(selectedEndpoint.path)}</span>
              </div>

              <button
                onClick={handleExecuteTest}
                disabled={isExecuting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer disabled:opacity-50 shrink-0 transition-colors"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังยิง API...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{t("ยิงคำสั่งทดสอบ (Execute Request)", "Execute Request")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Result JSON Window */}
            {testResult && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                      Status: {testResult.status} {testResult.statusText}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Response JSON</span>
                  </div>

                  <button
                    onClick={() => handleCopyJson(JSON.stringify(testResult.data, null, 2))}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer transition-colors"
                  >
                    {copiedResponse ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold">คัดลอก JSON แล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>คัดลอกผลลัพธ์ JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-5 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner max-h-[500px] overflow-y-auto">
                  <code>{JSON.stringify(testResult.data, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
