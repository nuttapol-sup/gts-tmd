"use client";

import { useLanguage } from "@/context/language-context";
import {
  Globe2,
  Radio,
  Cpu,
  Wrench,
  ShieldCheck,
  Users,
  Building
} from "lucide-react";

export default function MissionSection() {
  const { t } = useLanguage();

  const missions = [
    {
      num: "01",
      title: t("รวบรวม ตรวจสอบ และแลกเปลี่ยนข้อมูล GTS", "Collect, Verify & Exchange GTS Data"),
      desc: t(
        "รวบรวม ตรวจสอบ ควบคุม ดำเนินการ และพัฒนาเกี่ยวกับเครือข่ายสื่อสารอุตุนิยมวิทยาเพื่อรับส่งและแลกเปลี่ยนข้อมูลข่าวสารด้านอุตุนิยมวิทยาและแผ่นดินไหวทั้งในและต่างประเทศ",
        "Collect, verify, control, operate, and enhance meteorological communication networks for exchanging national and international weather and seismic data."
      ),
      icon: Globe2,
      color: "from-cyan-500/20 to-blue-500/20",
      borderColor: "border-cyan-500/30",
      iconColor: "text-cyan-400",
    },
    {
      num: "02",
      title: t("กระจายข่าวอากาศเพื่อการคมนาคมขนส่ง", "Disseminate Weather Data for Transportation"),
      desc: t(
        "กระจายข่าวอากาศเพื่อความปลอดภัยและการดำเนินงานของการคมนาคมขนส่งทุกสาขา (การบิน การเดินเรือ การขนส่งทางบก) และธุรกิจสาขาอื่นๆ",
        "Disseminate meteorological information for safety and operational efficiency across aviation, maritime, land transport, and other sectors."
      ),
      icon: Radio,
      color: "from-blue-500/20 to-indigo-500/20",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
    },
    {
      num: "03",
      title: t("ศึกษาและพัฒนาระบบสื่อสารให้ทันสมัย", "Develop & Modernize Telecommunication Systems"),
      desc: t(
        "ศึกษาและพัฒนาระบบสื่อสารอุตุนิยมวิทยาให้ทันสมัย รองรับปริมาณข้อมูลขนาดใหญ่ (Big Data) และรับส่งข้อมูลอุตุนิยมวิทยาและแผ่นดินไหวอย่างทันท่วงที",
        "Research and modernize weather telecommunications to support Big Data and real-time transmission of meteorological and earthquake data."
      ),
      icon: Cpu,
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-400",
    },
    {
      num: "04",
      title: t("ให้คำปรึกษา ติดตั้ง และบำรุงรักษาอุปกรณ์", "Consultation, Installation & Maintenance"),
      desc: t(
        "ให้คำปรึกษา ศึกษา พัฒนา ดำเนินการ และจัดทำคู่มือในการติดตั้ง บำรุงรักษา และซ่อมแซมเครื่องมือและอุปกรณ์การสื่อสารอุตุนิยมวิทยา",
        "Provide consultation, development, manuals, installation, maintenance, and repair services for weather telecommunications equipment."
      ),
      icon: Wrench,
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/30",
      iconColor: "text-amber-400",
    },
    {
      num: "05",
      title: t("ศูนย์โทรคมนาคมประจำภูมิภาค (RTH Bangkok)", "Regional Telecommunication Hub (RTH Bangkok)"),
      desc: t(
        "ดำเนินการเป็นศูนย์โทรคมนาคมอุตุนิยมวิทยาประจำภูมิภาคเอเชียตะวันออกเฉียงใต้ ตามกรอบความร่วมมือขององค์การอุตุนิยมวิทยาโลก (WMO)",
        "Operate as the Regional Telecommunication Hub for Southeast Asia under the World Meteorological Organization (WMO) framework."
      ),
      icon: ShieldCheck,
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
    },
    {
      num: "06",
      title: t("สนับสนุนและบูรณาการร่วมกับหน่วยงานภายนอก", "Inter-Agency Support & Integration"),
      desc: t(
        "ปฏิบัติงานร่วมกับหรือสนับสนุนการปฏิบัติงานของหน่วยงานอื่นที่เกี่ยวข้องหรือที่ได้รับมอบหมายเพื่อประโยชน์สูงสุดแก่ประชาชนและประเทศชาติ",
        "Collaborate with and support partner agencies for the maximum safety and benefit of the public and the nation."
      ),
      icon: Users,
      color: "from-sky-500/20 to-cyan-500/20",
      borderColor: "border-sky-500/30",
      iconColor: "text-sky-400",
    },
  ];

  return (
    <section className="py-20 relative z-10" id="missions">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Building className="w-3.5 h-3.5 text-cyan-400" />
            {t("กองสื่อสาร กรมอุตุนิยมวิทยา", "Telecommunication Division, TMD")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t("หน้าที่และความรับผิดชอบหลัก", "Core Responsibilities & Missions")}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {t(
              "ความมุ่งมั่นและพันธกิจของกองสื่อสาร ในการบริหารจัดการระบบโทรคมนาคมอุตุนิยมวิทยาแห่งชาติและภูมิภาค",
              "Commitment and mission of the Telecommunication Division in managing national and regional meteorological telecommunication systems."
            )}
          </p>
        </div>

        {/* 6 Missions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.num}
                className={`glass-panel rounded-2xl p-6 border ${m.borderColor} bg-gradient-to-br ${m.color} relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 shadow-xl`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-slate-900/80 border border-white/10 ${m.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-500/40 group-hover:text-cyan-400/40 transition-colors font-mono">
                    {m.num}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {m.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
