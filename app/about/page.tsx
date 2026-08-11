import Navbar from "@/components/navbar";
import MissionSection from "@/components/mission-section";
import SmartValues from "@/components/smart-values";
import Footer from "@/components/footer";
import { Info, Plane, Globe, ShieldCheck, Zap, Building } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col pt-32">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            About RTH Bangkok & Telecommunication Division
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            เกี่ยวกับเรา & Thailand NOC
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            ศูนย์โทรคมนาคมอุตุนิยมวิทยาแห่งภูมิภาคเอเชียตะวันออกเฉียงใต้ กรมอุตุนิยมวิทยา
          </p>
        </div>

        {/* Thailand NOC & SWIM Highlight Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="noc">
          <div className="glass-panel rounded-3xl p-8 border border-cyan-500/30 space-y-4 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/40">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 w-fit border border-cyan-500/20">
              <Plane className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Thailand NOC (Network Operations Center)</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              ทำหน้าที่เฝ้าระวัง ควบคุม และบริหารจัดการโครงข่ายสื่อสารอุตุนิยมวิทยาการบิน 
              และระบบสื่อสารโทรคมนาคมอุตุนิยมวิทยาแห่งชาติ ตลอด 24 ชั่วโมง เพื่อให้การรับส่งข้อมูลการบิน 
              (IWXXM / METAR / TAF / SIGMET) เป็นไปอย่างต่อเนื่อง เที่ยงตรง และปลอดภัย
            </p>
            <div className="pt-2">
              <a
                href="/noc"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <span>เข้าสู่คลังเอกสาร & สื่อ Thailand NOC (`D:\React\gts-tmd\Thailand NOC`)</span>
              </a>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-8 border border-purple-500/30 space-y-4 bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40" id="swim">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit border border-purple-500/20">
              <Globe className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">System Wide Information Management (SWIM)</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              ระบบแลกเปลี่ยนข้อมูลการบินอุตุนิยมวิทยาตามมาตรฐานสากล ICAO SWIM 
              เชื่อมโยงข้อมูลการบินแบบดิจิทัลแบบเรียลไทม์ระหว่างหน่วยงานการบิน กรมการบินพลเรือน 
              และศูนย์อุตุนิยมวิทยาการบินทั่วโลก
            </p>
          </div>
        </div>

        {/* Ethics & Gov 4.0 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="moral">
          <div className="glass-panel rounded-3xl p-8 border border-emerald-500/30 space-y-4 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit border border-emerald-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">องค์กรคุณธรรม & No Gift Policy</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              มุ่งสู่การเป็นองค์กรคุณธรรมต้นแบบ บริหารงานด้วยความโปร่งใส สุจริต เป็นธรรม 
              และยึดมั่นในผลประโยชน์ของประชาชนและประเทศชาติเป็นสำคัญ
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-8 border border-amber-500/30 space-y-4 bg-gradient-to-br from-amber-950/40 via-slate-900 to-orange-950/40" id="gov4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 w-fit border border-amber-500/20">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">การยกระดับสู่ระบบราชการ 4.0</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              นำเทคโนโลยีดิจิทัล ออโตเมชัน และ AI มาปรับใช้ในกระบวนการทำงานเพื่อเพิ่มความรวดเร็ว 
              ลดระยะเวลาการประมวลผลข้อมูล และให้บริการข้อมูลเปิดแก่ภาคส่วนต่างๆ (Open Meteorological Data)
            </p>
          </div>
        </div>
      </div>

      <MissionSection />
      <SmartValues />

      <Footer />
    </main>
  );
}
