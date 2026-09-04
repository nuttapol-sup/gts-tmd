"use client";

import Link from "next/link";
import { useLanguage } from "@/context/language-context";
import {
  Radio,
  Activity,
  ArrowUpRight,
  Building2,
} from "lucide-react";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 md:py-32 overflow-hidden flex items-center justify-center">
      {/* Dynamic Meteorological Radar Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Radar Grid Lines SVG overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.25) 0%, transparent 70%), linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 40px 40px, 40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Main Hero Content */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
            {t("ศูนย์โทรคมนาคมอุตุนิยมวิทยา", "Telecommunication Center")}
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              {t("แห่งภูมิภาคเอเชียตะวันออกเฉียงใต้", "Regional Telecommunication Hub (RTH) Southeast Asia")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl font-light leading-relaxed">
            {t(
              "เชื่อมโยงและให้บริการข้อมูลข่าวสารอุตุนิยมวิทยาที่แม่นยำ รวดเร็ว และเป็นสากล เพื่อความปลอดภัยในการคมนาคมขนส่ง การเตือนภัย และการพัฒนาที่ยั่งยืน",
              "Interconnecting and delivering accurate, fast, and international meteorological data to safeguard transportation, early warning systems, and sustainable development."
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Activity className="w-5 h-5" />
              {t("เข้าสู่บริการข้อมูลข่าว GTS", "Access GTS Data Services")}
              <ArrowUpRight className="w-5 h-5" />
            </Link>

            <Link
              href="/documents"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-sm sm:text-base bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-700 hover:text-white transition-all cursor-pointer backdrop-blur-md"
            >
              <Building2 className="w-5 h-5 text-cyan-400" />
              {t("เอกสารและคู่มือการใช้งาน", "Documents & User Manuals")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
