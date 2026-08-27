"use client";

import { useLanguage } from "@/context/language-context";
import {
  Megaphone,
  Calendar,
  FileCheck,
  Award,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function PRSection() {
  const { t } = useLanguage();

  const newsItems = [
    {
      id: 1,
      title: t("ประกาศนโยบาย No Gift Policy จากการปฏิบัติหน้าที่ ประจำปี พ.ศ. 2569", "No Gift Policy Announcement 2026"),
      category: t("นโยบายองค์กร", "Corporate Policy"),
      date: "2026-01-15",
      desc: t(
        "กรมอุตุนิยมวิทยา งดรับ งดให้ ของขวัญและของกำนัลทุกชนิดในฤดูกาลและโอกาสต่างๆ เพื่อสร้างวัฒนธรรมองค์กรที่ซื่อสัตย์สุจริต",
        "Thai Meteorological Department enforces No Gift Policy on all occasions to foster corporate integrity and transparency."
      ),
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: 2,
      title: t("กิจกรรมแลกเปลี่ยนเรียนรู้ Knowledge Management (KM) ด้านสื่อสารอุตุนิยมวิทยา", "Knowledge Management (KM) Activity on Weather Telecommunications"),
      category: t("กิจกรรม KM", "KM Activity"),
      date: "2026-03-10",
      desc: t(
        "ถ่ายทอดความรู้เทคโนโลยีการรับส่งข้อมูลผ่านระบบ SWIM และมาตรฐานการเชื่อมโยงข้อมูลข่าวสาร GTS ยุคใหม่",
        "Knowledge sharing session on SWIM data exchange technology and next-generation GTS data connectivity standards."
      ),
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    },
    {
      id: 3,
      title: t("การจัดทำแผนที่และการใช้งานระบบ GIBFC สำหรับเจ้าหน้าที่อุตุนิยมวิทยา", "GIBFC System & Mapping Training for Meteorological Staff"),
      category: t("ระบบสารสนเทศ", "IT Systems"),
      date: "2026-04-22",
      desc: t(
        "การอบรมการประยุกต์ใช้ภูมิสารสนเทศและการวิเคราะห์ข้อมูลพายุเขตร้อนเพื่อเพิ่มประสิทธิภาพการเตือนภัย",
        "Training on GIS applications and tropical cyclone analysis to enhance early warning capabilities."
      ),
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
  ];

  return (
    <section className="py-20 relative z-10" id="pr-news">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
              <Megaphone className="w-3.5 h-3.5 text-cyan-400" />
              Public Relations & Announcements
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {t("ข่าวประชาสัมพันธ์ & ประกาศสำคัญ", "PR News & Announcements")}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {t("ติดตามข่าวสาร นโยบายองค์กรใสสะอาด และกิจกรรมการแลกเปลี่ยนเรียนรู้ (KM)", "Stay updated with corporate news, integrity policies, and Knowledge Management (KM) activities")}
            </p>
          </div>

          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {t("ดูเอกสารและประกาศทั้งหมด", "View All Documents & Announcements")}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* News Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel rounded-2xl p-6 border border-cyan-500/20 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${item.badgeColor}`}>
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    {item.date}
                  </div>
                </div>

                <h3 className="font-bold text-base text-white leading-snug hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{t("กองสื่อสาร กรมอุตุนิยมวิทยา", "Telecommunication Division, TMD")}</span>
                <span className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-medium">
                  {t("อ่านเพิ่มเติม", "Read More")} <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
