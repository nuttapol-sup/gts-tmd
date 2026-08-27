"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/language-context";
import {
  BarChart3,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  Eye,
  Globe,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface StatsData {
  today: number;
  month: number;
  year: number;
  total: number;
  online: number;
}

export default function VisitorStats() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<StatsData>({
    today: 0,
    month: 0,
    year: 0,
    total: 0,
    online: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchStats = async (isFirstVisit = false) => {
    try {
      const res = await fetch(`/api/stats?count=${isFirstVisit ? "true" : "false"}`);
      const data = await res.json();
      if (data.status === "success" && data.stats) {
        setStats(data.stats);
        setLastUpdated(new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }));
      }
    } catch (e) {
      console.error("Failed to fetch visitor stats", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true);

    // Auto refresh online count every 30 seconds
    const interval = setInterval(() => {
      fetchStats(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-3xl p-5 border border-cyan-500/30 bg-slate-900/90 shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-md">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-wide">
              {t("สถิติการเข้าชม", "Visitor Statistics")}
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">VISITOR STATISTICS</span>
          </div>
        </div>

        <button
          onClick={() => fetchStats(false)}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
          title={t("อัปเดตสถิติ", "Refresh Statistics")}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
        </button>
      </div>

      {/* Live Online Badge */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-300">
            {t("กำลังออนไลน์ขณะนี้", "Currently Online")}
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono font-extrabold text-sm text-emerald-400">
          <Users className="w-4 h-4" />
          <span>{isLoading ? "..." : `${stats.online.toLocaleString()} ${t("คน", "users")}`}</span>
        </div>
      </div>

      {/* Stats List Items */}
      <div className="space-y-2.5 text-xs">
        {/* Today */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{t("วันนี้ (Today):", "Today:")}</span>
          </div>
          <span className="font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            {isLoading ? "..." : `${stats.today.toLocaleString()} ${t("คน", "visits")}`}
          </span>
        </div>

        {/* This Month */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-blue-500/40 transition-colors">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{t("เดือนนี้ (This Month):", "This Month:")}</span>
          </div>
          <span className="font-mono font-bold text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
            {isLoading ? "..." : `${stats.month.toLocaleString()} ${t("คน", "visits")}`}
          </span>
        </div>

        {/* This Year */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/40 transition-colors">
          <div className="flex items-center gap-2 text-slate-300">
            <TrendingUp className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{t("ปีนี้ (This Year):", "This Year:")}</span>
          </div>
          <span className="font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
            {isLoading ? "..." : `${stats.year.toLocaleString()} ${t("คน", "visits")}`}
          </span>
        </div>

        {/* Total Visits */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-950 to-blue-950/40 border border-cyan-500/40 shadow-md">
          <div className="flex items-center gap-2 text-white font-bold">
            <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{t("รวมทั้งหมด (Total):", "Total Visits:")}</span>
          </div>
          <span className="font-mono font-extrabold text-sm text-cyan-300 bg-cyan-900/60 px-2.5 py-0.5 rounded-lg border border-cyan-500/50 shadow-inner">
            {isLoading ? "..." : `${stats.total.toLocaleString()} ${t("คน", "visits")}`}
          </span>
        </div>
      </div>

      {/* Widget Footer Info */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1">
          <Globe className="w-3 h-3 text-cyan-400" />
          <span>GTS Telecommunications</span>
        </div>
        {lastUpdated && <span>{t("อัปเดต:", "Updated:")} {lastUpdated}</span>}
      </div>
    </div>
  );
}
