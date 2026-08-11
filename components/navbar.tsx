"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CloudSun,
  Home,
  FileText,
  Info,
  Menu,
  X,
  ChevronDown,
  Globe,
  Radio,
  Plane,
  ShieldCheck,
  Award,
  Zap,
  Satellite,
  Cloud,
  AlertTriangle,
  RadioTower,
  StickyNote,
  Folder,
  Camera,
  Upload,
  RotateCcw,
  Image as ImageIcon,
  PhoneCall,
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  iconColor?: string;
}

const ICON_MAP: Record<string, any> = {
  Plane,
  Award,
  ShieldCheck,
  Zap,
  Globe,
  FileText,
  Info,
  Home,
  Folder,
  Satellite,
  Cloud,
  AlertTriangle,
  RadioTower,
  StickyNote,
};

const DEFAULT_ABOUT_SUBMENU: MenuItem[] = [];

export const SERVICES_SUBMENU = [
  {
    label: "ข้อมูลข่าว Synoptic",
    href: "/services#synoptic",
    icon: Satellite,
    iconColor: "text-cyan-400",
  },
  {
    label: "ข้อมูลข่าว UpperAir",
    href: "/services#upperair",
    icon: Cloud,
    iconColor: "text-sky-400",
  },
  {
    label: "ข้อมูลข่าวเตือนภัย",
    href: "/services#warning",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
  },
  {
    label: "ข้อมูลข่าว Metar (อากาศการบิน)",
    href: "/services#metar",
    icon: RadioTower,
    iconColor: "text-indigo-400",
  },
  {
    label: "Note ท้ายข่าว (Raw GTS Format)",
    href: "/services#notes",
    icon: StickyNote,
    iconColor: "text-pink-400",
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  // Submenu Items for "เกี่ยวกับเรา" (Read-Only)
  const [aboutSubmenu, setAboutSubmenu] = useState<MenuItem[]>(DEFAULT_ABOUT_SUBMENU);

  // Dynamic Logo State
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoStatusMsg, setLogoStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLogo = async () => {
    try {
      const res = await fetch("/api/logo");
      const data = await res.json();
      if (data.hasCustomLogo && data.logoUrl) {
        setCustomLogoUrl(data.logoUrl);
      } else {
        setCustomLogoUrl(null);
      }
    } catch (e) {
      console.error("Failed to fetch custom logo", e);
    }
  };

  useEffect(() => {
    const fetchMenuConfig = async () => {
      try {
        const res = await fetch("/api/menu");
        const data = await res.json();
        if (data.status === "success" && data.menu?.aboutSubmenu) {
          setAboutSubmenu(data.menu.aboutSubmenu);
        }
      } catch (e) {
        console.error("Failed to fetch menu config", e);
      }
    };

    fetchMenuConfig();
    fetchLogo();

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoStatusMsg({ type: "error", text: "กรุณาเลือกไฟล์รูปภาพเท่านั้น (PNG, JPG, SVG, WEBP)" });
      return;
    }

    setIsUploadingLogo(true);
    setLogoStatusMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.status === "success" && data.logoUrl) {
        setCustomLogoUrl(data.logoUrl);
        setLogoStatusMsg({ type: "success", text: "อัปโหลดโลโก้ใหม่สำเร็จแล้ว!" });
        setTimeout(() => setIsLogoModalOpen(false), 1200);
      } else {
        setLogoStatusMsg({ type: "error", text: data.message || "ไม่สามารถอัปโหลดโลโก้ได้" });
      }
    } catch (err: any) {
      setLogoStatusMsg({ type: "error", text: "เกิดข้อผิดพลาดขณะอัปโหลดโลโก้" });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleResetLogo = async () => {
    if (!confirm("คุณต้องการรีเซ็ตโลโก้กลับเป็นค่าเริ่มต้นใช่หรือไม่?")) return;

    setIsUploadingLogo(true);
    setLogoStatusMsg(null);

    try {
      const res = await fetch("/api/logo", { method: "DELETE" });
      const data = await res.json();
      if (data.status === "success") {
        setCustomLogoUrl(null);
        setLogoStatusMsg({ type: "success", text: "รีเซ็ตกลับเป็นโลโก้เริ่มต้นเรียบร้อยแล้ว" });
        setTimeout(() => setIsLogoModalOpen(false), 1200);
      }
    } catch (err) {
      setLogoStatusMsg({ type: "error", text: "เกิดข้อผิดพลาดในการรีเซ็ตโลโก้" });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0b132b]/90 backdrop-blur-md border-b border-cyan-500/20 py-3 shadow-lg shadow-cyan-950/20"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-3 group">
              {/* Clickable Logo Avatar Button */}
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden"
                title="คลิกเพื่ออัปโหลด/เปลี่ยนโลโก้"
              >
                <div className="w-full h-full bg-[#0b132b] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                  {customLogoUrl ? (
                    <img
                      src={customLogoUrl}
                      alt="GTS Logo"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <CloudSun className="w-6 h-6 text-cyan-400 animate-pulse-glow" />
                  )}

                  {/* Camera overlay icon badge */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-cyan-300">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
              </button>

              <Link href="/" className="flex flex-col">
                <span className="font-bold text-lg tracking-wider text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                  RTH BANGKOK
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    <Radio className="w-2.5 h-2.5 mr-1 animate-ping text-cyan-400" />
                    GTS Thailand
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-light truncate max-w-[240px] sm:max-w-none">
                  ศูนย์โทรคมนาคมอุตุนิยมวิทยาแห่งภูมิภาคเอเชียตะวันออกเฉียงใต้
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Home className="w-4 h-4 text-cyan-400" />
                หน้าหลัก
              </Link>

              <Link
                href="/documents"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/documents"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                เอกสารที่เกี่ยวข้อง
              </Link>

              {/* Dropdown: เกี่ยวกับเรา (Read-Only Menu) */}
              <div className="relative group">
                <button
                  onClick={() => toggleDropdown("about")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
                >
                  <Info className="w-4 h-4 text-cyan-400" />
                  เกี่ยวกับเรา
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
                </button>

                <div className="absolute left-0 top-full pt-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                  <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-cyan-500/20 rounded-xl shadow-2xl p-2 space-y-1">
                    {aboutSubmenu.map((item) => {
                      const IconComp = (item.icon && ICON_MAP[item.icon]) || FileText;
                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-cyan-500/20 transition-all"
                        >
                          <IconComp className={`w-4 h-4 ${item.iconColor || "text-cyan-400"}`} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dropdown: บริการ GTS */}
              <div className="relative group">
                <button
                  onClick={() => toggleDropdown("services")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-cyan-400" />
                  บริการ GTS
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
                </button>

                <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                  <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-cyan-500/20 rounded-xl shadow-2xl p-2 space-y-1">
                    {SERVICES_SUBMENU.map((item, idx) => {
                      const IconComp = item.icon;
                      return (
                        <Link
                          key={idx}
                          href={item.href}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-cyan-500/20 transition-all"
                        >
                          <IconComp className={`w-4 h-4 ${item.iconColor}`} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Link
                href="/contact"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/contact"
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <PhoneCall className="w-4 h-4 text-cyan-400" />
                ติดต่อเรา
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl p-4 space-y-2 shadow-2xl">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              หน้าหลัก
            </Link>

            <Link
              href="/documents"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              เอกสารที่เกี่ยวข้อง
            </Link>

            {/* Mobile เกี่ยวกับเรา Submenu */}
            <div className="space-y-1 pl-3 border-l-2 border-cyan-500/30 my-2">
              <div className="text-xs font-semibold text-cyan-400 px-3 py-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                เกี่ยวกับเรา
              </div>
              {aboutSubmenu.map((item) => {
                const IconComp = (item.icon && ICON_MAP[item.icon]) || FileText;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-cyan-500/20"
                  >
                    <IconComp className={`w-4 h-4 ${item.iconColor || "text-cyan-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile บริการ GTS */}
            <div className="space-y-1 pl-3 border-l-2 border-cyan-500/30 my-2">
              <div className="text-xs font-semibold text-cyan-400 px-3 py-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                บริการ GTS
              </div>
              {SERVICES_SUBMENU.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-cyan-500/20"
                  >
                    <IconComp className={`w-4 h-4 ${item.iconColor}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              ติดต่อเรา
            </Link>
          </div>
        )}
      </header>

      {/* Upload Logo Modal */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0f172a] border border-cyan-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
            <button
              onClick={() => setIsLogoModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">อัปโหลดโลโก้ใหม่</h3>
                <p className="text-xs text-slate-400">เปลี่ยนรูปภาพโลโก้ประจำเว็บไซต์ GTS Thailand</p>
              </div>
            </div>

            {/* Current Logo Preview Box */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-900/80 border border-dashed border-slate-700 rounded-2xl space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-[#0b132b] border border-cyan-500/30 p-2 flex items-center justify-center shadow-xl relative overflow-hidden">
                {customLogoUrl ? (
                  <img src={customLogoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : (
                  <CloudSun className="w-10 h-10 text-cyan-400 animate-pulse-glow" />
                )}
              </div>
              <span className="text-xs text-slate-300 font-medium">
                {customLogoUrl ? "โลโก้ปัจจุบัน (Custom Logo)" : "โลโก้เริ่มต้น (Default Icon)"}
              </span>
            </div>

            {/* Status Message Alert */}
            {logoStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  logoStatusMsg.type === "success"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {logoStatusMsg.text}
              </div>
            )}

            {/* Actions Buttons */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="hidden"
              />

              <button
                type="button"
                disabled={isUploadingLogo}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {isUploadingLogo ? "กำลังอัปโหลด..." : "เลือกไฟล์รูปภาพใหม่ (PNG, JPG, SVG)"}
              </button>

              {customLogoUrl && (
                <button
                  type="button"
                  disabled={isUploadingLogo}
                  onClick={handleResetLogo}
                  className="w-full py-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  รีเซ็ตกลับเป็นโลโก้เริ่มต้น
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
