"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/language-context";
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

export default function Navbar() {
  const { lang, toggleLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const servicesSubmenu = [
    {
      label: t("ข้อมูลข่าว Synoptic", "Synoptic Bulletins"),
      href: "/services?tab=synoptic",
      icon: Satellite,
      iconColor: "text-cyan-400",
    },
    {
      label: t("ข้อมูลข่าว UpperAir", "Upper Air Bulletins (Wind)"),
      href: "/services?tab=upperair",
      icon: Cloud,
      iconColor: "text-sky-400",
    },
    {
      label: t("ข้อมูลข่าวเตือนภัย", "Weather Warnings"),
      href: "/services?tab=warning",
      icon: AlertTriangle,
      iconColor: "text-amber-400",
    },
    {
      label: t("ข้อมูลข่าว Metar (อากาศการบิน)", "METAR Bulletins (Aeronautical)"),
      href: "/services?tab=metar",
      icon: RadioTower,
      iconColor: "text-indigo-400",
    },
    {
      label: t("Note ท้ายข่าว (Raw GTS Format)", "Raw GTS Notes"),
      href: "/services?tab=notes",
      icon: StickyNote,
      iconColor: "text-pink-400",
    },
    {
      label: t("บริการ API (API Developer Hub)", "API Developer Hub"),
      href: "/api-docs",
      icon: Zap,
      iconColor: "text-emerald-400",
    },
  ];

  // Submenu Items for "เกี่ยวกับเรา" (Read-Only)
  const [aboutSubmenu, setAboutSubmenu] = useState<MenuItem[]>(DEFAULT_ABOUT_SUBMENU);

  // Dynamic Logo State
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

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

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0b132b]/95 backdrop-blur-xl border-b border-cyan-500/30 py-2.5 sm:py-3 shadow-xl shadow-cyan-950/40"
            : "bg-[#0b132b]/85 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-b border-cyan-500/20 lg:border-transparent py-2.5 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2">
            {/* Logo & Title */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink min-w-0">
              {/* Static Logo Emblem */}
              <Link
                href="/"
                aria-label="RTH Bangkok GTS Thailand"
                className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform duration-300 overflow-hidden shrink-0"
              >
                <div className="w-full h-full bg-[#0b132b] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                  {customLogoUrl ? (
                    <img
                      src={customLogoUrl}
                      alt="GTS Logo"
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <CloudSun className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse-glow" />
                  )}
                </div>
              </Link>

              <Link href="/" className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                    RTH BANGKOK
                  </span>
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                    <Radio className="w-2.5 h-2.5 mr-1 animate-ping text-cyan-400" />
                    GTS Thailand
                  </span>
                </div>
                <span className="hidden md:block text-[10px] sm:text-[11px] text-slate-400 font-light truncate max-w-[280px] lg:max-w-none">
                  {t(
                    "ศูนย์โทรคมนาคมอุตุนิยมวิทยาแห่งภูมิภาคเอเชียตะวันออกเฉียงใต้",
                    "Regional Telecommunication Hub Southeast Asia"
                  )}
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
                {t("หน้าหลัก", "Home")}
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
                {t("เอกสารที่เกี่ยวข้อง", "Documents")}
              </Link>

              {/* Dropdown: เกี่ยวกับเรา (Read-Only Menu) */}
              <div className="relative group">
                <button
                  onClick={() => toggleDropdown("about")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
                >
                  <Info className="w-4 h-4 text-cyan-400" />
                  {t("เกี่ยวกับเรา", "About Us")}
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
                  {t("บริการ GTS", "GTS Services")}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
                </button>

                <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                  <div className="bg-[#0f172a]/95 backdrop-blur-xl border border-cyan-500/20 rounded-xl shadow-2xl p-2 space-y-1">
                    {servicesSubmenu.map((item, idx) => {
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
                {t("ติดต่อเรา", "Contact Us")}
              </Link>

              {/* TH / EN Language Switcher Pill */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-xs font-bold text-cyan-300 shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer"
                title={lang === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className={lang === "th" ? "text-cyan-300 font-black" : "text-slate-500"}>TH</span>
                <span className="text-slate-600 font-normal">/</span>
                <span className={lang === "en" ? "text-cyan-300 font-black" : "text-slate-500"}>EN</span>
              </button>
            </nav>

            {/* Mobile Menu & Language Button */}
            <div className="lg:hidden flex items-center gap-1.5 sm:gap-2 shrink-0 z-10">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-xs font-bold text-cyan-300 cursor-pointer shadow-sm shrink-0"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400 mr-0.5" />
                <span className={lang === "th" ? "text-cyan-300 font-black" : "text-slate-500"}>TH</span>
                <span className="text-slate-600">/</span>
                <span className={lang === "en" ? "text-cyan-300 font-black" : "text-slate-500"}>EN</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-cyan-300 bg-slate-900/90 hover:text-white hover:bg-slate-800 border border-cyan-500/40 transition-colors shadow-sm cursor-pointer shrink-0"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-rose-400" /> : <Menu className="w-6 h-6 text-cyan-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-cyan-500/20 bg-[#0b132b]/98 backdrop-blur-2xl rounded-2xl p-3 space-y-2 shadow-2xl max-h-[80vh] overflow-y-auto mx-4">
            {/* 1. หน้าหลัก */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-cyan-500/20 transition-all border border-transparent hover:border-cyan-500/30"
            >
              <Home className="w-4 h-4 text-cyan-400" />
              {t("หน้าหลัก", "Home")}
            </Link>

            {/* 2. เอกสารที่เกี่ยวข้อง */}
            <Link
              href="/documents"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-cyan-500/20 transition-all border border-transparent hover:border-cyan-500/30"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              {t("เอกสารที่เกี่ยวข้อง", "Documents")}
            </Link>

            {/* 4. เกี่ยวกับเรา */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                className="w-full flex items-center justify-between px-3.5 py-3 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>{t("เกี่ยวกับเรา", "About Us")}</span>
                  {aboutSubmenu.length > 0 && (
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-medium">
                      {aboutSubmenu.length}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    mobileAboutOpen ? "rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>

              {mobileAboutOpen && (
                <div className="p-2 space-y-1 bg-[#070d1e] border-t border-slate-800">
                  {aboutSubmenu.map((item) => {
                    const IconComp = (item.icon && ICON_MAP[item.icon]) || FileText;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-cyan-500/20 transition-all border border-transparent hover:border-cyan-500/30"
                      >
                        <IconComp className={`w-4 h-4 shrink-0 ${item.iconColor || "text-cyan-400"}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. บริการ GTS */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full flex items-center justify-between px-3.5 py-3 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>{t("บริการ GTS", "GTS Services")}</span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-medium">
                    {servicesSubmenu.length}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    mobileServicesOpen ? "rotate-180 text-cyan-400" : ""
                  }`}
                />
              </button>

              {mobileServicesOpen && (
                <div className="p-2 space-y-1 bg-[#070d1e] border-t border-slate-800">
                  {servicesSubmenu.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-cyan-500/20 transition-all border border-transparent hover:border-cyan-500/30"
                      >
                        <IconComp className={`w-4 h-4 shrink-0 ${item.iconColor}`} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. ติดต่อเรา */}
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-cyan-500/20 transition-all border border-transparent hover:border-cyan-500/30"
            >
              <PhoneCall className="w-4 h-4 text-cyan-400" />
              {t("ติดต่อเรา", "Contact Us")}
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
