"use client";

import Link from "next/link";
import {
  CloudSun,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  ShieldCheck,
  Radio,
  ChevronRight
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#050b18] border-t border-cyan-500/20 pt-16 pb-8 relative z-10 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Col 1: About RTH Bangkok */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30">
                <div className="w-full h-full bg-[#0b132b] rounded-[10px] flex items-center justify-center">
                  <CloudSun className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">RTH BANGKOK</h2>
                <span className="text-xs text-cyan-400">GTS Thailand Telecommunications</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ศูนย์โทรคมนาคมอุตุนิยมวิทยาแห่งภูมิภาคเอเชียตะวันออกเฉียงใต้ (สื่อสารระหว่างประเทศ)
              สังกัดกองสื่อสาร กรมอุตุนิยมวิทยา ทำหน้าที่เชื่อมโยงแลกเปลี่ยนข้อมูลข่าวสารอุตุนิยมวิทยาระดับโลก
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ระบบเครือข่ายสื่อสารทำงานปกติ (GTS Status: ONLINE)
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-bold text-sm text-white tracking-wider">ลิงก์ที่เป็นประโยชน์</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-cyan-400" />
                  หน้าหลัก
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-cyan-400" />
                  บริการข้อมูล GTS สด
                </Link>
              </li>
              <li>
                <Link href="/documents" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-cyan-400" />
                  เอกสารที่เกี่ยวข้อง
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-cyan-400" />
                  เกี่ยวกับเรา & NOC
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-cyan-400" />
                  ติดต่อเรา
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-bold text-sm text-white tracking-wider">ข้อมูลการติดต่อ</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>4353 ถ.สุขุมวิท แขวงบางนา เขตบางนา กรุงเทพมหานคร 10260</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>02-399-4596</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>gtsbkk@metnet.tmd.go.th</span>
              </li>
              <li className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white">เวลาทำการ:</div>
                  <div>จันทร์ - ศุกร์: 08:30 - 16:30 น.</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Interactive Map Embed */}
          <div className="lg:col-span-3 space-y-2">
            <h3 className="font-bold text-sm text-white tracking-wider">ที่ตั้งสำนักงาน (บางนา)</h3>
            <div className="w-full h-36 rounded-xl overflow-hidden border border-cyan-500/20 shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1630.0085031789472!2d100.60535995181904!3d13.667769618527403!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e2a01106372d9f%3A0x557fa516d8be1f96!2z4LiB4Lij4Lih4Lit4Li44LiV4Li44LiZ4Li04Lii4Lih4Lin4Li04LiX4Lii4Liy!5e0!3m2!1sth!2sth!4v1747106127484!5m2!1sth!2sth"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="TMD Location Map"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-4">
          <p>© 2026 ศูนย์โทรคมนาคมอุตุนิยมวิทยาแห่งภูมิภาคเอเชียตะวันออกเฉียงใต้ (RTH Bangkok). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://www.tmd.go.th" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-cyan-300 flex items-center gap-1">
              เว็บไซต์หลักกรมอุตุนิยมวิทยา <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
