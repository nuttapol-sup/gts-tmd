"use client";

import { useState, useEffect } from "react";
import {
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
  ArrowLeft
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

const COUNTRIES = [
  { value: "zero", name: "--- All (ทั้งหมด) ---", flag: "🌐" },
  { value: "AMMC", name: "Australia", flag: "🇦🇺" },
  { value: "VGDC", name: "Bangladesh", flag: "🇧🇩" },
  { value: "WBSB", name: "Brunei", flag: "🇧🇳" },
  { value: "BABJ", name: "China", flag: "🇨🇳" },
  { value: "VHHH", name: "Hong Kong", flag: "🇭🇰" },
  { value: "DEMS", name: "India", flag: "🇮🇳" },
  { value: "WIIX", name: "Indonesia", flag: "🇮🇩" },
  { value: "OLLL", name: "Iran", flag: "🇮🇷" },
  { value: "RJTD", name: "Japan", flag: "🇯🇵" },
  { value: "UAAA", name: "Kazakhstan", flag: "🇰🇿" },
  { value: "OKBK", name: "Kuwait", flag: "🇰🇼" },
  { value: "UAFF", name: "Kyrgyzstan", flag: "🇰🇬" },
  { value: "VLIV", name: "Laos", flag: "🇱🇦" },
  { value: "VMMC", name: "Macao", flag: "🇲🇴" },
  { value: "FMMI", name: "Madagascar", flag: "🇲🇬" },
  { value: "WMKK", name: "Malaysia", flag: "🇲🇾" },
  { value: "VRMM", name: "Maldives", flag: "🇲🇻" },
  { value: "MNUB", name: "Mongolia", flag: "🇲🇳" },
  { value: "VBRR", name: "Myanmar", flag: "🇲🇲" },
  { value: "VNKT", name: "Nepal", flag: "🇳🇵" },
  { value: "DKPY", name: "North Korea", flag: "🇰🇵" },
  { value: "OOMS", name: "Oman", flag: "🇴🇲" },
  { value: "OCEAN", name: "Pacific Ocean", flag: "🌊" },
  { value: "RPLL", name: "Philippines", flag: "🇵🇭" },
  { value: "ROAH", name: "Ryukyu Islands", flag: "🇯🇵" },
  { value: "RIII", name: "Russian Federation (Asia)", flag: "🇷🇺" },
  { value: "WSSS", name: "Singapore", flag: "🇸🇬" },
  { value: "VCCC", name: "Sri Lanka", flag: "🇱🇰" },
  { value: "RCAA", name: "Taiwan", flag: "🇹🇼" },
  { value: "VTBB", name: "Thailand", flag: "🇹🇭" },
  { value: "UTTT", name: "Uzbekistan", flag: "🇺🇿" },
  { value: "VVGL", name: "Vietnam", flag: "🇻🇳" },
];

export default function DataHub() {
  const [activeTab, setActiveTab] = useState<WeatherCategory>("synoptic");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedUtc, setSelectedUtc] = useState<string>("00");
  const [selectedCountry, setSelectedCountry] = useState<string>("zero");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  useEffect(() => {
    setViewMode("headers");
    setSelectedBulletinId(null);
    fetchFtpData(false);
  }, [selectedCountry, selectedDate, selectedUtc, activeTab]);

  const handleAllData = () => {
    setViewMode("all");
    setSelectedBulletinId(null);
    fetchFtpData(true);
  };

  const handleReset = () => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    setSelectedUtc("00");
    setSelectedCountry("zero");
    setViewMode("headers");
    setSelectedBulletinId(null);
  };

  const handleSelectSingleHeader = (id: string) => {
    setSelectedBulletinId(id);
    setViewMode("all");
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
    const found = COUNTRIES.find((c) => c.value.toUpperCase() === code.toUpperCase());
    return found ? found.name : code;
  };

  const getCountryFlag = (code: string) => {
    const found = COUNTRIES.find((c) => c.value.toUpperCase() === code.toUpperCase());
    return found ? found.flag : "🌐";
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Group bulletins by countryCode
  const groupedByCountry = ftpBulletins.reduce<Record<string, GTSBulletin[]>>((acc, item) => {
    const code = item.countryCode || "OTHER";
    if (!acc[code]) {
      acc[code] = [];
    }
    acc[code].push(item);
    return acc;
  }, {});

  const countryCodes = Object.keys(groupedByCountry);

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
                        {c.value === "zero" ? `${c.flag} ${c.name}` : `${c.flag} ${c.name} (${c.value})`}
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
                  พบ {ftpBulletins.length} รายการ (แยก {countryCodes.length} ประเทศ)
                </span>
              </div>

              {isLoading ? (
                <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                  <span>กำลังดึงรายการหัวข่าวสาร ...</span>
                </div>
              ) : ftpBulletins.length === 0 ? (
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
                      return (
                        <div key={code} className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-3 shadow-lg">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base sm:text-lg leading-none">{getCountryFlag(code)}</span>
                              <span className="font-bold text-sm text-cyan-200">
                                {countryName} ({code})
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                              {countryBulletins.length} รายการ
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
                            {countryBulletins.map((item, idx) => (
                              <div key={item.id} className="inline-flex items-center gap-1.5 my-1">
                                <span className="text-slate-600 font-bold">|</span>
                                <button
                                  onClick={() => handleSelectSingleHeader(item.id)}
                                  className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-600 hover:text-white text-cyan-300 font-semibold border border-cyan-500/40 hover:border-cyan-300 transition-all cursor-pointer shadow-md text-xs sm:text-sm"
                                  title={`กดเพื่ออ่านเนื้อหาข่าว ${item.headerLine}`}
                                >
                                  {item.headerLine || item.dataType}
                                </button>
                                {idx === countryBulletins.length - 1 && (
                                  <span className="text-slate-600 font-bold">|</span>
                                )}
                              </div>
                            ))}
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
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setViewMode("headers")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                  กลับไปหน้ารวมหัวข่าว (Back to Headers List)
                </button>

                <span className="text-xs text-cyan-400 font-mono font-bold bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-800">
                  แสดงเฉพาะหัวข่าวที่กดเลือก: {selectedBulletin.headerLine}
                </span>
              </div>

              <div className="glass-panel rounded-3xl p-6 border border-cyan-400 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-sm font-bold border border-cyan-500/40">
                      {selectedBulletin.headerLine}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-xs font-bold border border-blue-500/30 flex items-center gap-1.5">
                      <span className="text-sm leading-none">{getCountryFlag(selectedBulletin.countryCode)}</span>
                      <span>รหัสประเทศ: {getCountryName(selectedBulletin.countryCode)} ({selectedBulletin.countryCode})</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                      {selectedBulletin.categoryLabel}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(selectedBulletin.rawText, selectedBulletin.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer shrink-0"
                  >
                    {copiedId === selectedBulletin.id ? (
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

                <pre className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner max-h-[500px] overflow-y-auto">
                  <code>{selectedBulletin.rawText}</code>
                </pre>
              </div>
            </div>
          )}

          {/* ----------------- MODE 3: ALL DATA EXPANDED VIEW (เมื่อกด All Data) ----------------- */}
          {viewMode === "all" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  แสดงข้อมูลทั้งหมด (พบ {ftpBulletins.length} ข่าว - แยก {countryCodes.length} ประเทศ)
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
                          <div className="flex items-center gap-2">
                            <span className="text-base sm:text-lg leading-none">{getCountryFlag(code)}</span>
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
    </section>
  );
}
