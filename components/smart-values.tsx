"use client";

import { useState } from "react";
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

const VALUES = [
  {
    letter: "S",
    title: "Self development",
    titleTh: "พัฒนาตนเอง",
    desc: "ใฝ่หาความรู้และทักษะใหม่ๆ เพื่อพัฒนาตนเองอย่างต่อเนื่อง ให้ทันต่อเทคโนโลยีอุตุนิยมวิทยาระดับสากล",
    icon: Award,
    color: "from-blue-500/20 to-cyan-500/20",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  {
    letter: "O",
    title: "On Target",
    titleTh: "มุ่งผลสัมฤทธิ์",
    desc: "ทำงานให้แล้วเสร็จตามกำหนด เกิดผลดีแก่องค์กรและส่วนรวม เน้นการประเมินผลลัพธ์ที่เป็นรูปธรรม",
    icon: Target,
    color: "from-emerald-500/20 to-teal-500/20",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    letter: "S",
    title: "Service mind",
    titleTh: "มีจิตบริการ",
    desc: "ให้บริการข้อมูลข่าวสารอุตุนิยมวิทยาที่ดี มีคุณภาพ และรวดเร็ว ด้วยความเต็มใจแก่ทุกภาคส่วน",
    icon: HeartHandshake,
    color: "from-pink-500/20 to-rose-500/20",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
  {
    letter: "M",
    title: "Moral",
    titleTh: "มีคุณธรรม จริยธรรม",
    desc: "ยึดมั่นในความซื่อสัตย์ สุจริต มีจิตสำนึกที่ดีในการปฏิบัติงาน และคิดถึงประโยชน์ส่วนรวมเป็นสำคัญ",
    icon: ShieldCheck,
    color: "from-purple-500/20 to-indigo-500/20",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    letter: "A",
    title: "Active",
    titleTh: "กระตือรือร้น",
    desc: "มีความมุ่งมั่น กระตือรือร้น พร้อมรับมือกับทุกสถานการณ์เตือนภัยเพื่อความปลอดภัยของประชาชน",
    icon: Zap,
    color: "from-amber-500/20 to-yellow-500/20",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    letter: "R",
    title: "Responsibility",
    titleTh: "มีความรับผิดชอบ",
    desc: "เอาใจใส่ มุ่งมั่น ปฏิบัติหน้าที่ด้วยความอดทนและรับผิดชอบต่อผลงานเพื่อปรับปรุงให้ดียิ่งขึ้น",
    icon: CheckCircle2,
    color: "from-sky-500/20 to-blue-500/20",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  },
  {
    letter: "T",
    title: "Team Work",
    titleTh: "ทำงานเป็นทีม",
    desc: "ร่วมมือร่วมใจ ประสานงานอย่างมีประสิทธิภาพระหว่างสมาชิก เพื่อบรรลุเป้าหมายเดียวกัน",
    icon: Users2,
    color: "from-cyan-500/20 to-teal-500/20",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
];

export default function SmartValues() {
  const [activeValue, setActiveValue] = useState<number>(0);

  return (
    <section className="py-20 relative z-10 bg-[#070d1e]/90 border-t border-cyan-500/10" id="smart-values">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            TMD Organizational Culture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ค่านิยมกรมอุตุนิยมวิทยา{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-400 bg-clip-text text-transparent">
              SO-SMART
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            หลักการและค่านิยมหลักในการปฏิบัติงานของเจ้าหน้าที่กรมอุตุนิยมวิทยา เพื่อประโยชน์สูงสุดแก่ประเทศชาติ
          </p>
        </div>

        {/* Letter Selector Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {VALUES.map((v, idx) => (
            <button
              key={idx}
              onClick={() => setActiveValue(idx)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-black text-lg sm:text-xl transition-all cursor-pointer flex flex-col items-center justify-center border shadow-lg ${
                activeValue === idx
                  ? "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white border-cyan-300 scale-110 shadow-cyan-500/30"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              <span>{v.letter}</span>
            </button>
          ))}
        </div>

        {/* Selected Value Card Highlight */}
        <div className="max-w-4xl mx-auto">
          {(() => {
            const current = VALUES[activeValue];
            const Icon = current.icon;
            return (
              <div className={`glass-panel rounded-3xl p-8 sm:p-10 border border-cyan-500/30 bg-gradient-to-br ${current.color} shadow-2xl relative overflow-hidden transition-all duration-300`}>
                <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-cyan-400 shrink-0">
                    <Icon className="w-10 h-10" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${current.badgeColor}`}>
                        {current.letter} : {current.title}
                      </span>
                      <span className="text-xl font-bold text-white">
                        ({current.titleTh})
                      </span>
                    </div>

                    <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
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
