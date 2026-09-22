"use client";

import { useState } from "react";
import { useLanguage } from "@/context/language-context";
import {
  Award,
  Target,
  HeartHandshake,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users2,
  Sparkles
} from "lucide-react";

export default function SmartValues() {
  const { t } = useLanguage();
  const [activeValue, setActiveValue] = useState<number>(0);

  const values = [
    {
      letter: "S",
      title: "Self development",
      titleTh: t("พัฒนาตนเอง", "Self Development"),
      desc: t(
        "ใฝ่หาความรู้และทักษะใหม่ๆ เพื่อพัฒนาตนเองอย่างต่อเนื่อง ให้ทันต่อเทคโนโลยีอุตุนิยมวิทยาระดับสากล",
        "Continuously seek new knowledge and skills to keep pace with international meteorological technology."
      ),
      icon: Award,
      color: "from-blue-50/80 to-sky-50/50 dark:from-blue-500/20 dark:to-cyan-500/20",
      badgeColor: "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
    },
    {
      letter: "O",
      title: "On Target",
      titleTh: t("มุ่งผลสัมฤทธิ์", "On Target"),
      desc: t(
        "ทำงานให้แล้วเสร็จตามกำหนด เกิดผลดีแก่องค์กรและส่วนรวม เน้นการประเมินผลลัพธ์ที่เป็นรูปธรรม",
        "Deliver results on schedule for the benefit of the organization and public, focusing on concrete outcomes."
      ),
      icon: Target,
      color: "from-emerald-50/80 to-teal-50/50 dark:from-emerald-500/20 dark:to-teal-500/20",
      badgeColor: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
    },
    {
      letter: "S",
      title: "Service mind",
      titleTh: t("มีจิตบริการ", "Service Mind"),
      desc: t(
        "ให้บริการข้อมูลข่าวสารอุตุนิยมวิทยาที่ดี มีคุณภาพ และรวดเร็ว ด้วยความเต็มใจแก่ทุกภาคส่วน",
        "Provide high-quality, fast, and dedicated weather information services to all stakeholders."
      ),
      icon: HeartHandshake,
      color: "from-pink-50/80 to-rose-50/50 dark:from-pink-500/20 dark:to-rose-500/20",
      badgeColor: "bg-pink-100 dark:bg-pink-500/20 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-500/30",
    },
    {
      letter: "M",
      title: "Moral",
      titleTh: t("มีคุณธรรม จริยธรรม", "Moral & Ethics"),
      desc: t(
        "ยึดมั่นในความซื่อสัตย์ สุจริต มีจิตสำนึกที่ดีในการปฏิบัติงาน และคิดถึงประโยชน์ส่วนรวมเป็นสำคัญ",
        "Uphold integrity, ethical standards, and public interest in all duties and operations."
      ),
      icon: ShieldCheck,
      color: "from-purple-50/80 to-indigo-50/50 dark:from-purple-500/20 dark:to-indigo-500/20",
      badgeColor: "bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30",
    },
    {
      letter: "A",
      title: "Active",
      titleTh: t("กระตือรือร้น", "Active & Ready"),
      desc: t(
        "มีความมุ่งมั่น กระตือรือร้น พร้อมรับมือกับทุกสถานการณ์เตือนภัยเพื่อความปลอดภัยของประชาชน",
        "Stay proactive and prepared to handle weather warning situations for public safety."
      ),
      icon: Zap,
      color: "from-amber-50/80 to-yellow-50/50 dark:from-amber-500/20 dark:to-yellow-500/20",
      badgeColor: "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
    },
    {
      letter: "R",
      title: "Responsibility",
      titleTh: t("มีความรับผิดชอบ", "Responsibility"),
      desc: t(
        "เอาใจใส่ มุ่งมั่น ปฏิบัติหน้าที่ด้วยความอดทนและรับผิดชอบต่อผลงานเพื่อปรับปรุงให้ดียิ่งขึ้น",
        "Perform duties with dedication, patience, and accountability for continuous improvement."
      ),
      icon: CheckCircle2,
      color: "from-sky-50/80 to-blue-50/50 dark:from-sky-500/20 dark:to-blue-500/20",
      badgeColor: "bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-500/30",
    },
    {
      letter: "T",
      title: "Team Work",
      titleTh: t("ทำงานเป็นทีม", "Teamwork"),
      desc: t(
        "ร่วมมือร่วมใจ ประสานงานอย่างมีประสิทธิภาพระหว่างสมาชิก เพื่อบรรลุเป้าหมายเดียวกัน",
        "Foster strong teamwork and efficient coordination to achieve shared organizational goals."
      ),
      icon: Users2,
      color: "from-cyan-50/80 to-teal-50/50 dark:from-cyan-500/20 dark:to-teal-500/20",
      badgeColor: "bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30",
    },
  ];

  return (
    <section className="py-20 relative z-10 bg-slate-100/60 dark:bg-[#040e0c]/90 border-t border-b border-slate-200/80 dark:border-emerald-500/10 transition-colors" id="smart-values">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            TMD Organizational Culture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("ค่านิยมกรมอุตุนิยมวิทยา", "TMD Core Values")}{" "}
            <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
              SO-SMART
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-normal dark:font-light">
            {t(
              "หลักการและค่านิยมหลักในการปฏิบัติงานของเจ้าหน้าที่กรมอุตุนิยมวิทยา เพื่อประโยชน์สูงสุดแก่ประเทศชาติ",
              "Core values and operational principles of TMD staff dedicated to national excellence."
            )}
          </p>
        </div>

        {/* Letter Selector Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {values.map((v, idx) => (
            <button
              key={idx}
              onClick={() => setActiveValue(idx)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-black text-lg sm:text-xl transition-all cursor-pointer flex flex-col items-center justify-center border shadow-sm ${
                activeValue === idx
                  ? "bg-gradient-to-tr from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-600 text-white border-emerald-400 dark:border-emerald-300 scale-110 shadow-emerald-500/25 dark:shadow-emerald-500/30"
                  : "bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-emerald-700 dark:hover:text-white hover:border-emerald-300 dark:hover:border-slate-700"
              }`}
            >
              <span>{v.letter}</span>
            </button>
          ))}
        </div>

        {/* Selected Value Card Highlight */}
        <div className="max-w-4xl mx-auto">
          {(() => {
            const current = values[activeValue];
            const Icon = current.icon;
            return (
              <div className={`glass-panel rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-emerald-500/30 bg-white dark:bg-slate-900/90 shadow-lg dark:shadow-2xl relative overflow-hidden transition-all duration-300`}>
                <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-slate-900/80 border border-emerald-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                    <Icon className="w-10 h-10" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${current.badgeColor}`}>
                        {current.letter} - {current.title}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                        {current.titleTh}
                      </h3>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal dark:font-light">
                      {current.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
