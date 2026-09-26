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
    <section className="relative pt-24 sm:pt-28 lg:pt-44 pb-16 md:pb-32 overflow-hidden flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Main Hero Content */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight sm:leading-tight">
            {t("ศูนย์โทรคมนาคมอุตุนิยมวิทยา", "Telecommunication Center")}
            <br />
            <span className="text-emerald-700 dark:text-emerald-400 bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500 bg-clip-text text-transparent">
              {t("แห่งภูมิภาคเอเชียตะวันออกเฉียงใต้", "Regional Telecommunication Hub (RTH) Southeast Asia")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg max-w-2xl font-normal dark:font-light leading-relaxed">
            {t(
              "เชื่อมโยงและให้บริการข้อมูลข่าวสารอุตุนิยมวิทยาที่แม่นยำ รวดเร็ว และเป็นสากล เพื่อความปลอดภัยในการคมนาคมขนส่ง การเตือนภัย และการพัฒนาที่ยั่งยืน",
              "Interconnecting and delivering accurate, fast, and international meteorological data to safeguard transportation, early warning systems, and sustainable development."
            )}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-sm sm:text-base bg-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-600 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Activity className="w-5 h-5 shrink-0 text-white" />
              <span className="text-white font-bold">{t("เข้าสู่บริการข้อมูลข่าว GTS", "Access GTS Data Services")}</span>
              <ArrowUpRight className="w-5 h-5 shrink-0 text-white" />
            </Link>

            <Link
              href="/documents"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-sm sm:text-base bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/60 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-white shadow-sm transition-all cursor-pointer backdrop-blur-md"
            >
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold">{t("เอกสารและคู่มือการใช้งาน", "Documents & User Manuals")}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
