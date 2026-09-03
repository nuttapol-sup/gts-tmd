"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  Zap,
  Code,
  Check,
  Copy,
  Terminal,
  ShieldCheck,
  Globe,
  Radio,
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
    description: "ดึงเฉพาะข้อมูลข่าวสภาพอากาศการบิน รายสนามบิน ICAO ทั่วโลก (ทิศทางลม ทัศนวิสัย ฐานเมฆ อุณหภูมิ ความกดอากาศ QNH)",
    descriptionEn: "Fetches aeronautical METAR/SPECI bulletins for international airports.",
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

export default function ApiDocsPage() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("tryout");
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointInfo>(API_ENDPOINTS[0]);
  const [paramDate, setParamDate] = useState<string>("");
  const [paramCountry, setParamCountry] = useState<string>("");
  const [paramUtc, setParamUtc] = useState<string>("");

  const [testResult, setTestResult] = useState<any | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copiedCodeLang, setCopiedCodeLang] = useState<string | null>(null);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [codeLang, setCodeLang] = useState<"curl" | "javascript" | "python" | "php" | "csharp">("curl");

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

  const getCodeSnippet = (endpoint: ApiEndpointInfo, langType: typeof codeLang) => {
    const fullUrl = `https://telecom.tmd.go.th${buildQueryUrl(endpoint.path)}`;

    switch (langType) {
      case "curl":
        return `curl -X GET "${fullUrl}" \\
  -H "Accept: application/json"`;

      case "javascript":
        return `// JavaScript (Fetch API)
async function fetchWeatherData() {
  const response = await fetch("${fullUrl}");
  const data = await response.json();
  console.log("Total bulletins:", data.count);
  console.log("Bulletins:", data.bulletins);
}

fetchWeatherData();`;

      case "python":
        return `# Python (Requests Library)
import requests

url = "${fullUrl}"
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    print(f"Total count: {data.get('count')}")
    for item in data.get("bulletins", []):
        print(f"ID: {item['id']} | Header: {item['headerLine']}")
        for st in item.get("stations", []):
            print(f"  Station {st['stationId']}: {st['rawLine']}")`;

      case "php":
        return `<?php
// PHP cURL / file_get_contents
$url = "${fullUrl}";
$json = file_get_contents($url);
$data = json_decode($json, true);

echo "Total count: " . $data['count'] . "\n";
foreach ($data['bulletins'] as $b) {
    echo "Header: " . $b['headerLine'] . "\n";
    foreach ($b['stations'] as $st) {
        echo " - " . $st['stationId'] . ": " . $st['rawLine'] . "\n";
    }
}
?>`;

      case "csharp":
        return `// C# (.NET HttpClient)
using System;
using System.Net.Http;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using HttpClient client = new HttpClient();
        string json = await client.GetStringAsync("${fullUrl}");
        Console.WriteLine(json);
    }
}`;
    }
  };

  const handleCopyCode = (text: string, langName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeLang(langName);
    setTimeout(() => setCopiedCodeLang(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col pt-24">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
        {/* Header Hero Section */}
        <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-br from-[#0d1b3e] via-[#0f274c] to-[#0b132b] border border-cyan-500/30 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-400/40">
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{t("บริการข้อมูลข่าวสารอุตุนิยมวิทยา API", "GTS TMD RESTful API Services")}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {t("ศูนย์บริการเชื่อมต่อข้อมูล API อุตุนิยมวิทยา", "Meteorological API Developer Hub")}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {t(
                "เปิดให้บริการเชื่อมต่อดึงข้อมูลข่าวสารสภาพอากาศ GTS (Synoptic, METAR, Warning, UpperAir) ผ่านมาตรฐาน RESTful API ในรูปแบบ JSON สำหรับนักพัฒนา, หน่วยงาน และแอปพลิเคชันภายนอก",
                "Provides high-performance RESTful JSON APIs for real-time GTS weather bulletins (Synoptic, METAR, Warnings, UpperAir) for developers and partner agencies."
              )}
            </p>

            {/* Server Security & Compliance Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {t("เซิร์ฟเวอร์เปิดใช้งาน (HTTPS Status: 200 OK)", "Server Status: 200 OK (Active)")}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                {t("OWASP Cybersecurity Hardened", "OWASP Cybersecurity Hardened")}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                {t("รหัสสถานี WMO & ID 6 หลัก", "6-Digit ID & WMO Station Parsed")}
              </span>
            </div>
          </div>
        </div>

        {/* API Endpoint Showcase Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <span>{t("รายการ API ที่เปิดให้บริการ (Active Endpoints)", "Active API Service Endpoints")}</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Total {API_ENDPOINTS.length} Endpoints</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {API_ENDPOINTS.map((endpoint, idx) => {
              const IconComp = endpoint.icon;
              const isSelected = selectedEndpoint.path === endpoint.path;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedEndpoint(endpoint);
                    setActiveTab("tryout");
                  }}
                  className={`glass-panel rounded-2xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 hover:border-cyan-400/60 ${
                    isSelected
                      ? "border-cyan-400 bg-gradient-to-b from-[#0f2b45]/90 to-[#0b132b]/95 shadow-xl shadow-cyan-500/20 scale-[1.02]"
                      : "border-cyan-500/20 bg-slate-900/80 hover:bg-slate-900/95"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {endpoint.method}
                      </span>
                      <IconComp className="w-5 h-5 text-cyan-400" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {t(endpoint.name, endpoint.nameEn)}
                      </h3>
                      <p className="text-xs font-mono text-cyan-300 mt-1 break-all bg-slate-950/80 px-2.5 py-1 rounded-md border border-cyan-500/30">
                        {endpoint.path}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {t(endpoint.description, endpoint.descriptionEn)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-cyan-400 font-semibold flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {t("คลิกเพื่อยิงทดสอบ (Try Out)", "Click to Try Out")}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Try-It-Out & Code Generator Workspace */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 space-y-6 bg-slate-900/90 shadow-2xl">
          {/* Workspace Tabs Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {t("ห้องทดลองยิง API (Interactive Developer Console)", "API Developer Console & Tester")}
                </h3>
                <p className="text-xs text-slate-400">
                  {t("กำลังทดสอบ API:", "Selected API:")}{" "}
                  <span className="text-cyan-300 font-mono font-bold">{selectedEndpoint.path}</span>
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-cyan-500/30 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("tryout")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "tryout"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>{t("ทดสอบยิง API สด (Live Try Out)", "Live Tester")}</span>
              </button>

              <button
                onClick={() => setActiveTab("code")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "code"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>{t("ตัวอย่างโค้ด (Code Snippets)", "Code Snippets")}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: LIVE TESTER */}
          {activeTab === "tryout" && (
            <div className="space-y-6">
              {/* Parameters Input Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/80 p-5 rounded-2xl border border-cyan-500/30">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t("1. วันที่ (date - YYYY-MM-DD)", "1. Date (YYYY-MM-DD)")}
                  </label>
                  <input
                    type="date"
                    value={paramDate}
                    onChange={(e) => setParamDate(e.target.value)}
                    placeholder="เช่น 2026-09-03"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">* ละเว้นเพื่อดึงวันปัจจุบัน</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t("2. รหัสประเทศ (country)", "2. Country Code")}
                  </label>
                  <input
                    type="text"
                    value={paramCountry}
                    onChange={(e) => setParamCountry(e.target.value.toUpperCase())}
                    placeholder="เช่น VLIV (สปป.ลาว), VTBB (ไทย)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">* ละเว้นเพื่อดึงทุกประเทศ</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t("3. รหัสเวลา UTC (utc)", "3. UTC Hour (00, 06, 12)")}
                  </label>
                  <input
                    type="text"
                    value={paramUtc}
                    onChange={(e) => setParamUtc(e.target.value)}
                    placeholder="เช่น 00, 06, 12, 18"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">* ละเว้นเพื่อดึงทุกช่วงเวลา</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-cyan-500/20">
                <div className="font-mono text-xs text-cyan-300 overflow-x-auto py-1">
                  <span className="text-emerald-400 font-bold">GET</span> {buildQueryUrl(selectedEndpoint.path)}
                </div>

                <button
                  onClick={handleExecuteTest}
                  disabled={isExecuting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>กำลังยิง API...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
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
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                        Status: {testResult.status} {testResult.statusText}
                      </span>
                      <span className="text-xs text-slate-400">Response JSON</span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(JSON.stringify(testResult.data, null, 2), "json")}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-cyan-500/30 cursor-pointer"
                    >
                      {copiedCodeLang === "json" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">คัดลอก JSON แล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอกผลลัพธ์ JSON</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner max-h-[500px] overflow-y-auto">
                    <code>{JSON.stringify(testResult.data, null, 2)}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CODE SNIPPETS GENERATOR */}
          {activeTab === "code" && (
            <div className="space-y-4">
              {/* Language Switcher */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                {[
                  { id: "curl", label: "cURL (Terminal)" },
                  { id: "javascript", label: "JavaScript (Fetch)" },
                  { id: "python", label: "Python (Requests)" },
                  { id: "php", label: "PHP (cURL)" },
                  { id: "csharp", label: "C# (.NET)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCodeLang(item.id as any)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      codeLang === item.id
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Code Box */}
              <div className="relative">
                <button
                  onClick={() =>
                    handleCopyCode(getCodeSnippet(selectedEndpoint, codeLang), codeLang)
                  }
                  className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-cyan-500/40 cursor-pointer shadow-lg"
                >
                  {copiedCodeLang === codeLang ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">คัดลอกโค้ดแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอกโค้ด</span>
                    </>
                  )}
                </button>

                <pre className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
                  <code>{getCodeSnippet(selectedEndpoint, codeLang)}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
