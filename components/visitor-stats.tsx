"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/language-context";
import {
  BarChart3,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Eye,
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
    <div className="glass-panel rounded-3xl p-5 border border-slate-200 dark:border-emerald-500/30 bg-white/95 dark:bg-slate-900/90 shadow-md dark:shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-md transition-colors">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-wide">
              {t("สถิติการเข้าชม", "Visitor Statistics")}
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">VISITOR STATISTICS</span>
          </div>
        </div>

        <button
          onClick={() => fetchStats(false)}
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
          title={t("อัปเดตสถิติ", "Refresh Statistics")}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-600 dark:text-emerald-400" : ""}`} />
        </button>
      </div>

      {/* Live Online Badge */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950/60 dark:to-teal-950/60 border border-emerald-200 dark:border-emerald-500/30 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            {t("กำลังออนไลน์ขณะนี้", "Currently Online")}
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
          <Users className="w-4 h-4" />
          <span>{isLoading ? "..." : `${stats.online.toLocaleString()} ${t("คน", "users")}`}</span>
        </div>
      </div>

      {/* Stats List Items */}
      <div className="space-y-2.5 text-xs">
        {/* Today */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-400 dark:hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t("วันนี้ (Today):", "Today:")}</span>
          </div>
          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            {isLoading ? "..." : `${stats.today.toLocaleString()} ${t("คน", "visits")}`}
          </span>
        </div>

        {/* This Month */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-teal-400 dark:hover:border-teal-500/40 transition-colors">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>{t("เดือนนี้ (This Month):", "This Month:")}</span>
          </div>
          <span className="font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
            {isLoading ? "..." : `${stats.month.toLocaleString()} ${t("คน", "visits")}`}
          </span>
        </div>

        {/* This Year */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-purple-400 dark:hover:border-purple-500/40 transition-colors">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>{t("ปีนี้ (This Year):", "This Year:")}</span>
          </div>
          <span className="font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
            {isLoading ? "..." : `${stats.year.toLocaleString()} ${t("คน", "visits")}`}
          </span>
        </div>

        {/* Total Visits */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-slate-950 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-500/40 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-white font-bold">
            <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t("รวมทั้งหมด (Total):", "Total Visits:")}</span>
          </div>
          <span className="font-mono font-extrabold text-sm text-emerald-800 dark:text-emerald-300 bg-white dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-500/50 shadow-inner">
            {isLoading ? "..." : `${stats.total.toLocaleString()} ${t("ครั้ง", "visits")}`}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>{t("ระบบทำงานปกติ", "System Active")}</span>
        </div>
        {lastUpdated && (
          <span className="font-mono text-slate-400 dark:text-slate-500">
            {t("อัปเดต", "Updated")}: {lastUpdated}
          </span>
        )}
      </div>
    </div>
  );
}
