"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useLanguage } from "@/context/language-context";
import {
  PhoneCall,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  ShieldCheck,
  Building2,
  Radio,
  Train,
  Bus,
  Compass,
  CheckCircle2,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const { lang, t } = useLanguage();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col pt-36 sm:pt-40 lg:pt-44 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg">
            <PhoneCall className="w-4 h-4 text-cyan-400" />
            {t(
              "ศูนย์บริการและติดต่อประสานงานข้อมูลอุตุนิยมวิทยา",
              "Meteorological Data Service & Coordination Center"
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {t("ติดต่อศูนย์โทรคมนาคมอุตุนิยมวิทยา", "Contact Telecommunication Center")}
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              (RTH Bangkok / GTS Thailand)
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t(
              "กองสื่อสาร กรมอุตุนิยมวิทยา 4353 ถนนสุขุมวิท แขวงบางนา เขตบางนา กรุงเทพมหานคร 10260",
              "Telecommunication Division, Thai Meteorological Department, 4353 Sukhumvit Road, Bangna, Bangkok 10260, Thailand"
            )}
          </p>
        </div>

        {/* 4 Main Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Office Location */}
          <div className="glass-panel rounded-3xl p-6 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/40 space-y-4 shadow-xl hover:border-cyan-400 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {t("ที่อยู่สำนักงานหลัก", "Head Office Address")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t("กองสื่อสาร กรมอุตุนิยมวิทยา", "Telecommunication Division, TMD")} <br />
                {t("4353 ถนนสุขุมวิท แขวงบางนา", "4353 Sukhumvit Road, Bangna")} <br />
                {t("เขตบางนา กรุงเทพฯ 10260", "Bangna, Bangkok 10260")}
              </p>
            </div>
            <button
              onClick={() => handleCopy(
                lang === "th" 
                  ? "4353 ถนนสุขุมวิท แขวงบางนา เขตบางนา กรุงเทพมหานคร 10260" 
                  : "4353 Sukhumvit Road, Bangna, Bangkok 10260, Thailand",
                "address"
              )}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedText === "address" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">{t("คัดลอกที่อยู่แล้ว", "Address Copied!")}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t("คัดลอกที่อยู่ภาษาไทย", "Copy Address")}</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Phone & Hotlines */}
          <div className="glass-panel rounded-3xl p-6 border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/40 space-y-4 shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {t("โทรศัพท์ & สายด่วน", "Phone & Hotlines")}
              </h3>
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                <div className="flex justify-between items-center">
                  <span>{t("สายตรงกองสื่อสาร:", "Direct Line:")}</span>
                  <span className="font-bold text-cyan-300">02-399-4596</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span>{t("สายด่วนเตือนภัย:", "Emergency Hotline:")}</span>
                  <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">1182</span>
                </div>
              </div>
            </div>
            <a
              href="tel:023994596"
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110 text-xs text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer text-center"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              {t("โทรออก 02-399-4596", "Call 02-399-4596")}
            </a>
          </div>

          {/* Card 3: Digital & Email */}
          <div className="glass-panel rounded-3xl p-6 border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 space-y-4 shadow-xl hover:border-purple-400 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {t("อีเมล & เว็บไซต์", "Email & Website")}
              </h3>
              <div className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                <div className="flex justify-between items-center">
                  <span>GTS Operations:</span>
                  <span className="text-purple-300 font-mono text-[11px]">gtsbkk@metnet.tmd.go.th</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span>{t("เว็บไซต์หลัก:", "Official Website:")}</span>
                  <span className="text-slate-300 font-medium">gts.tmd.go.th</span>
                </div>
              </div>
            </div>
            <a
              href="mailto:gtsbkk@metnet.tmd.go.th"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs text-purple-300 font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
            >
              <Mail className="w-3.5 h-3.5" />
              {t("ส่งอีเมล gtsbkk@metnet.tmd.go.th", "Email gtsbkk@metnet.tmd.go.th")}
            </a>
          </div>

          {/* Card 4: Operating Hours */}
          <div className="glass-panel rounded-3xl p-6 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40 space-y-4 shadow-xl hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {t("เวลาทำการ & NOC", "Office Hours & NOC")}
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                <div>
                  <span className="font-semibold text-white block">
                    {t("งานสารบรรณและติดต่อราชการ:", "Administration & Government Contact:")}
                  </span>
                  <span className="text-slate-300">
                    {t("จันทร์ - ศุกร์: 08:30 - 16:30 น.", "Monday - Friday: 08:30 - 16:30 hrs")}
                  </span>
                </div>
                <div className="pt-1 border-t border-slate-800">
                  <span className="font-semibold text-emerald-300 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    {t("ศูนย์ RTH Bangkok NOC:", "RTH Bangkok NOC Center:")}
                  </span>
                  <span className="text-xs text-emerald-200">
                    {t("ปฏิบัติงานรับส่งข่าวสด 24 ชั่วโมง (24/7)", "24/7 Continuous Live Operations")}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 text-center font-medium">
              {t("ศูนย์โทรคมนาคมเปิดให้บริการทุกวัน", "Telecommunication Center Open Daily")}
            </div>
          </div>
        </div>

        {/* Full-Width Interactive Google Maps Frame */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                {t(
                  "แผนที่เดินทางและพิกัดสำนักงาน (กรมอุตุนิยมวิทยา บางนา)",
                  "Location Map & Coordinates (Thai Meteorological Dept, Bangna)"
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t(
                  "พิกัดละติจูด: 13.6677° N, ลองจิจูด: 100.6053° E",
                  "Latitude: 13.6677° N, Longitude: 100.6053° E"
                )}
              </p>
            </div>

            <a
              href="https://maps.google.com/?q=Thai+Meteorological+Department+Bangna"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:brightness-110 transition-all cursor-pointer shrink-0"
            >
              {t("เปิดใน Google Maps แอปพลิเคชัน", "Open in Google Maps App")}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1630.0085031789472!2d100.60535995181904!3d13.667769618527403!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e2a01106372d9f%3A0x557fa516d8be1f96!2z4LiB4Lij4Lih4Lit4Li44LiV4Li44LiZ4Li04Lii4Lih4Lin4Li04LiX4Lii4Liy!5e0!3m2!1sth!2sth!4v1747106127484!5m2!1sth!2sth"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Thai Meteorological Department Google Map"
            />
          </div>
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </main>
  );
}
