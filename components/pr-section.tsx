"use client";

import {
  Megaphone,
  Calendar,
  FileCheck,
  Award,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

const NEWS_ITEMS = [
  {
    id: 1,
    title: "ประกาศนโยบาย No Gift Policy จากการปฏิบัติหน้าที่ ประจำปี พ.ศ. 2569",
    category: "นโยบายองค์กร",
    date: "2026-01-15",
    desc: "กรมอุตุนิยมวิทยา งดรับ งดให้ ของขวัญและของกำนัลทุกชนิดในฤดูกาลและโอกาสต่างๆ เพื่อสร้างวัฒนธรรมองค์กรที่ซื่อสัตย์สุจริต",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    id: 2,
    title: "กิจกรรมแลกเปลี่ยนเรียนรู้ Knowledge Management (KM) ด้านสื่อสารอุตุนิยมวิทยา",
    category: "กิจกรรม KM",
    date: "2026-03-10",
    desc: "ถ่ายทอดความรู้เทคโนโลยีการรับส่งข้อมูลผ่านระบบ SWIM และมาตรฐานการเชื่อมโยงข้อมูลข่าวสาร GTS ยุคใหม่",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  {
    id: 3,
    title: "การจัดทำแผนที่และการใช้งานระบบ GIBFC สำหรับเจ้าหน้าที่อุตุนิยมวิทยา",
    category: "ระบบสารสนเทศ",
    date: "2026-04-22",
    desc: "การอบรมการประยุกต์ใช้ภูมิสารสนเทศและการวิเคราะห์ข้อมูลพายุเขตร้อนเพื่อเพิ่มประสิทธิภาพการเตือนภัย",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
];

export default function PRSection() {
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
              ข่าวประชาสัมพันธ์ & ประกาศสำคัญ
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              ติดตามข่าวสาร นโยบายองค์กรใสสะอาด และกิจกรรมการแลกเปลี่ยนเรียนรู้ (KM)
            </p>
          </div>

          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ดูเอกสารและประกาศทั้งหมด
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* News Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NEWS_ITEMS.map((item) => (
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
                <span className="text-slate-400">กองสื่อสาร กรมอุตุนิยมวิทยา</span>
                <span className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-medium">
                  อ่านเพิ่มเติม <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
