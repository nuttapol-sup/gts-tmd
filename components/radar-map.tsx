"use client";

import { useState } from "react";
import {
  Radio,
  Layers,
  Globe,
  Maximize2,
  RefreshCw,
  Compass,
  Zap,
  MapPin,
  CheckCircle2
} from "lucide-react";

const RADAR_STATIONS = [
  {
    id: "bkk",
    name: "เรดาร์สุวรรณภูมิ / กรุงเทพฯ",
    range: "240 km",
    freq: "C-Band Doppler",
    coords: "13.69° N, 100.75° E",
    bgGradient: "from-blue-950 via-slate-900 to-cyan-950",
    dBz: "35 - 45 dBZ (กลุ่มฝนปานกลางถึงหนัก)",
  },
  {
    id: "cnx",
    name: "เรดาร์เชียงใหม่",
    range: "240 km",
    freq: "S-Band Doppler",
    coords: "18.77° N, 98.96° E",
    bgGradient: "from-indigo-950 via-slate-900 to-cyan-950",
    dBz: "25 - 35 dBZ (กลุ่มฝนเล็กน้อยถึงปานกลาง)",
  },
  {
    id: "phs",
    name: "เรดาร์พิษณุโลก",
    range: "240 km",
    freq: "C-Band Doppler",
    coords: "16.78° N, 100.27° E",
    bgGradient: "from-sky-950 via-slate-900 to-blue-950",
    dBz: "20 - 30 dBZ (ท้องฟ้าโปร่งถึงมีฝนบางแห่ง)",
  },
  {
    id: "hkt",
    name: "เรดาร์ภูเก็ต / สงขลา",
    range: "240 km",
    freq: "Dual Polarization",
    coords: "7.08° N, 100.61° E",
    bgGradient: "from-teal-950 via-slate-900 to-cyan-950",
    dBz: "40 - 50 dBZ (ฝนฟ้าคะนองในทะเลอันดามัน)",
  },
];

export default function RadarMap() {
  const [selectedStation, setSelectedStation] = useState(RADAR_STATIONS[0]);
  const [activeMode, setActiveMode] = useState<"radar" | "satellite" | "gts-network">("radar");
  const [isScanning, setIsScanning] = useState(true);

  return (
    <section className="py-16 relative z-10 bg-[#070d1e]/80 border-y border-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-ping" />
              Doppler Weather Radar & Satellite Network
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              ระบบภาพเรดาร์ตรวจอากาศ & โครงข่ายดาวเทียม
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              ติดตามกลุ่มฝนและภาพถ่ายดาวเทียมอุตุนิยมวิทยาเรียลไทม์จากสถานีตรวจอากาศครอบคลุมทั่วประเทศ
            </p>
          </div>

          {/* Mode switch */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveMode("radar")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeMode === "radar"
                  ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ภาพเรดาร์ (Radar)
            </button>
            <button
              onClick={() => setActiveMode("satellite")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeMode === "satellite"
                  ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ภาพดาวเทียม (Himawari-9)
            </button>
            <button
              onClick={() => setActiveMode("gts-network")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeMode === "gts-network"
                  ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ผังการเชื่อมโยง GTS Network
            </button>
          </div>
        </div>

        {/* Main Radar Screen Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Bar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                เลือกสถานีเรดาร์ตรวจอากาศ
              </h3>

              <div className="space-y-2">
                {RADAR_STATIONS.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStation(st)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedStation.id === st.id
                        ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs sm:text-sm">{st.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{st.freq}</span>
                        <span>•</span>
                        <span>{st.range}</span>
                      </div>
                    </div>

                    {selectedStation.id === st.id && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Technical Specifications */}
              <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>สถานะสแกน:</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    กำลังกวาดสัญญาณแบบเรียลไทม์
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ค่าการสะท้อน (Reflectivity):</span>
                  <span className="text-cyan-300 font-mono">{selectedStation.dBz}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>พิกัดสถานีเรดาร์:</span>
                  <span className="text-slate-300 font-mono">{selectedStation.coords}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Display Screen */}
          <div className="lg:col-span-8">
            <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 relative min-h-[420px] flex flex-col justify-between overflow-hidden">
              {/* Radar Sweeper Visual Container */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                {/* Concentric Radar Rings */}
                <div className="w-[360px] h-[360px] rounded-full border border-cyan-500/30 flex items-center justify-center relative">
                  <div className="w-[260px] h-[260px] rounded-full border border-cyan-500/30 flex items-center justify-center">
                    <div className="w-[160px] h-[160px] rounded-full border border-cyan-500/30 flex items-center justify-center">
                      <div className="w-[60px] h-[60px] rounded-full border border-cyan-500/40 bg-cyan-500/10" />
                    </div>
                  </div>

                  {/* Crosshair lines */}
                  <div className="absolute w-full h-[1px] bg-cyan-500/30" />
                  <div className="absolute h-full w-[1px] bg-cyan-500/30" />

                  {/* Radar Sweeping Beam animation */}
                  {isScanning && (
                    <div className="absolute inset-0 rounded-full animate-radar-sweep bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(6,182,212,0.45)_360deg)]" />
                  )}
                </div>
              </div>

              {/* Screen Top Status Bar */}
              <div className="relative z-10 flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{selectedStation.name}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 font-mono">
                  <span>MODE: {activeMode.toUpperCase()}</span>
                  <span>|</span>
                  <span className="text-cyan-400">FPS: 60</span>
                </div>
              </div>

              {/* Central Weather Reflectivity & Network Nodes Visualization */}
              <div className="relative z-10 my-auto text-center space-y-4 py-8">
                {activeMode === "radar" && (
                  <div className="inline-block p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
                      <span className="font-bold text-lg text-white">ผลการตรวจเรดาร์ Doppler สด</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      กลุ่มฝนกำลังเคลื่อนตัวทางทิศตะวันตกเฉียงใต้ ความเร็วลมเฉลี่ย 15-20 กม./ชม. 
                      ความเข้มสะท้อนคลื่น <span className="text-cyan-300 font-bold">{selectedStation.dBz}</span>
                    </p>
                  </div>
                )}

                {activeMode === "satellite" && (
                  <div className="inline-block p-6 rounded-2xl bg-slate-900/90 border border-blue-500/30 backdrop-blur-md shadow-2xl max-w-md mx-auto">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Globe className="w-6 h-6 text-blue-400 animate-spin" />
                      <span className="font-bold text-lg text-white">ดาวเทียม Himawari-9 (Infrared)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      กลุ่มเมฆชั้นสูงและมวลอากาศความกดอากาศต่ำบริเวณอ่าวไทยและทะเลจีนใต้ 
                      อัปเดตข้อมูลภาพถ่ายทุก 10 นาที ผ่านระบบสื่อสาร RTH
                    </p>
                  </div>
                )}

                {activeMode === "gts-network" && (
                  <div className="inline-block p-6 rounded-2xl bg-slate-900/90 border border-purple-500/30 backdrop-blur-md shadow-2xl max-w-lg mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span className="font-bold text-base text-white">เส้นทางเชื่อมโยงข่าว RTH Bangkok (GTS Main Trunk)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <div className="p-2 rounded bg-purple-950/60 border border-purple-800 text-purple-200">Tokyo (RTH)</div>
                      <div className="p-2 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-200">Bangkok (RTH)</div>
                      <div className="p-2 rounded bg-purple-950/60 border border-purple-800 text-purple-200">Beijing (RTH)</div>
                      <div className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-300">Singapore</div>
                      <div className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-300">New Delhi</div>
                      <div className="p-2 rounded bg-slate-800 border border-slate-700 text-slate-300">Melbourne</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Legend */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">ระดับความเข้มกลุ่มฝน (dBZ):</span>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-cyan-500" title="Light" />
                    <span className="w-3 h-3 rounded bg-green-500" title="Moderate" />
                    <span className="w-3 h-3 rounded bg-yellow-500" title="Heavy" />
                    <span className="w-3 h-3 rounded bg-red-500" title="Severe" />
                  </div>
                </div>

                <div className="text-slate-400">
                  มาตรฐานข้อมูล: <span className="text-cyan-300 font-mono">WMO GTS Telecommunication Standard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
