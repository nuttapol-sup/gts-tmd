"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  FileText,
  Download,
  Folder,
  ChevronRight,
  Search,
  Video,
  FileSpreadsheet,
  File,
  Eye,
  X,
  RefreshCw,
  Info,
  FolderPlus,
  Home,
  Maximize2,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  LucideIcon,
  ExternalLink,
} from "lucide-react";
import { DocFileItem, DocTreeNode } from "@/app/api/showcase/route";

const YouTubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const GDriveIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 87.3 78">
    <path fill="#0066DA" d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z"/>
    <path fill="#00AC47" d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5L43.65 25z"/>
    <path fill="#EA4335" d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l5.4-9.35c.8-1.4 1.2-2.95 1.2-4.5H55.9l17.65 17.15z"/>
    <path fill="#00832D" d="M43.65 25l13.75 23.8h29.9c0-1.55-.4-3.1-1.2-4.5l-25.4-44c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25z"/>
    <path fill="#2684FC" d="M27.5 53L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.4 4.5-1.2L59.8 53H27.5z"/>
    <path fill="#FFBA00" d="M59.8 53L43.65 25 29.9 53h29.9z"/>
  </svg>
);

interface ShowcaseViewerProps {
  type?: "noc" | "smart" | "moral" | "gov4" | "swim";
  folder?: string;
  title?: string;
  badgeText?: string;
  description?: string;
  folderPathDisplay?: string;
  HeaderIcon?: LucideIcon;
}

export default function ShowcaseViewer({
  type,
  folder,
  title,
  badgeText,
  description,
  folderPathDisplay,
  HeaderIcon = Folder,
}: ShowcaseViewerProps) {
  const [tree, setTree] = useState<DocTreeNode[]>([]);
  const [allFiles, setAllFiles] = useState<DocFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<string>("custom");

  const [dynamicTitle, setDynamicTitle] = useState<string>(title || "");
  const [dynamicBadge, setDynamicBadge] = useState<string>(badgeText || "");

  const [currentFolderPath, setCurrentFolderPath] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ "": true });

  const [lightboxImage, setLightboxImage] = useState<DocFileItem | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const getQueryUrl = () => {
    if (folder) {
      return `/api/showcase?folder=${encodeURIComponent(folder)}&sort=${sortMode}`;
    }
    return `/api/showcase?type=${type || "noc"}&sort=${sortMode}`;
  };

  const getFileStreamUrl = (relPath: string, download = false) => {
    const params = new URLSearchParams();
    if (folder) params.set("folder", folder);
    else params.set("type", type || "noc");
    params.set("path", relPath);
    if (download) params.set("download", "true");
    return `/api/showcase/file?${params.toString()}`;
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getQueryUrl());
      const data = await res.json();
      if (data.status === "success") {
        setTree(data.tree || []);
        setAllFiles(data.files || []);

        if (folder) {
          const cleanName = (data.folderName || folder).replace(/^(\d+)[\._\-\s]+/, "");
          if (!title) setDynamicTitle(cleanName);
          if (!badgeText) setDynamicBadge(cleanName);
        }
      }
    } catch (e) {
      console.error(`Failed to fetch showcase documents`, e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [type, folder, sortMode]);

  const handleMoveFile = async (index: number, direction: "up" | "down") => {
    const filesToOrder = [...currentFiles];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= filesToOrder.length) return;

    const temp = filesToOrder[index];
    filesToOrder[index] = filesToOrder[targetIdx];
    filesToOrder[targetIdx] = temp;

    setIsSavingOrder(true);
    const orderedFileNames = filesToOrder.map((f) => f.fileName);

    try {
      const res = await fetch("/api/showcase/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: type || undefined,
          folder: folder || undefined,
          orderedFileNames,
          subfolder: currentFolderPath,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        fetchDocuments();
      }
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการบันทึกการจัดลำดับ");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const selectFolder = (pathStr: string) => {
    setCurrentFolderPath(pathStr);
    setExpandedFolders((prev) => ({
      ...prev,
      [pathStr]: true,
    }));
  };

  const findNodeByPath = (nodes: DocTreeNode[], targetPath: string): DocTreeNode | null => {
    if (!targetPath) return null;
    for (const node of nodes) {
      if (node.relativePath === targetPath) return node;
      if (node.children) {
        const found = findNodeByPath(node.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  const currentNode = currentFolderPath ? findNodeByPath(tree, currentFolderPath) : null;

  const currentSubfolders: DocTreeNode[] = searchQuery
    ? []
    : currentFolderPath === ""
    ? tree.filter((n) => n.isFolder)
    : (currentNode?.children || []).filter((n) => n.isFolder);

  const currentFiles: DocFileItem[] = searchQuery
    ? allFiles.filter(
        (f) =>
          f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.cleanTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.relativePath.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentFolderPath === ""
    ? allFiles.filter((f) => f.subfolder === "Root")
    : allFiles.filter((f) => f.subfolder === currentFolderPath);

  const getFileBadgeIcon = (fileType: string) => {
    switch (fileType) {
      case "image":
        return <ImageIcon className="w-5 h-5 text-cyan-400" />;
      case "pdf":
        return <FileText className="w-5 h-5 text-rose-400" />;
      case "video":
        return <Video className="w-5 h-5 text-purple-400" />;
      case "youtube":
        return <YouTubeIcon className="w-5 h-5 text-red-500" />;
      case "gdrive":
        return <GDriveIcon className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5 text-cyan-400" />;
    }
  };

  const breadcrumbs = currentFolderPath ? currentFolderPath.split("/") : [];

  const cleanFolderName = folder ? folder.replace(/^(\d+)[\._\-\s]+/, "") : "";
  const displayTitle = title || dynamicTitle || cleanFolderName || "ศูนย์ข้อมูลเอกสาร";
  const displayBadge = badgeText || dynamicBadge || folderPathDisplay || cleanFolderName || "ศูนย์ข้อมูลเอกสาร";
  const displayDescription = description || `ศูนย์รวมข้อมูลเอกสารและสื่อประชาสัมพันธ์ กรมอุตุนิยมวิทยา`;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#040e0c] text-slate-900 dark:text-slate-100 flex flex-col pt-32 pb-16 relative overflow-hidden transition-colors duration-300">
      {/* Background Glow Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10 flex-1 w-full">
        {/* Page Header */}
        <div className="text-center max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-sm">
            <HeaderIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {displayBadge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {displayTitle}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-normal dark:font-light leading-relaxed">
            {displayDescription}
          </p>
        </div>

        {/* Top Control Bar: Search & Sort & Refresh */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-emerald-500/30 bg-white/95 dark:bg-slate-900/80 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-md dark:shadow-xl transition-colors">
          <div className="relative w-full lg:max-w-md">
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อหัวข้อ หรือข้อมูลไฟล์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-emerald-500/30 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-slate-500 dark:text-slate-400">เรียงตาม:</span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                className="bg-transparent text-xs text-emerald-800 dark:text-emerald-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="custom" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">🔢 ลำดับที่กำหนด (01_, 02_)</option>
                <option value="name" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">🔤 ชื่อหัวข้อ (A-Z)</option>
                <option value="newest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">📅 ใหม่ล่าสุด</option>
                <option value="oldest" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">📅 เก่าที่สุด</option>
              </select>
            </div>

            <button
              onClick={fetchDocuments}
              disabled={isLoading || isSavingOrder}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isSavingOrder ? "animate-spin text-emerald-600 dark:text-emerald-400" : ""}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>
        </div>

        {/* Main Full-Width Content Layout */}
        <div className="w-full space-y-8">
          {/* Breadcrumb Path Bar */}
          {currentFolderPath !== "" && (
            <div className="glass-panel rounded-2xl p-4 border border-slate-200 dark:border-emerald-500/20 bg-white/95 dark:bg-slate-900/80 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-colors">
              <button
                onClick={() => setCurrentFolderPath("")}
                className="flex items-center gap-1 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{displayTitle}</span>
              </button>

              {breadcrumbs.map((folderName, index) => {
                const subPath = breadcrumbs.slice(0, index + 1).join("/");
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <div key={subPath} className="flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                    <button
                      onClick={() => setCurrentFolderPath(subPath)}
                      className={`cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors ${
                        isLast ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {folderName}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <div className="glass-panel rounded-3xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
              <span>กำลังโหลดข้อมูลเอกสาร...</span>
            </div>
          ) : currentSubfolders.length === 0 && currentFiles.length === 0 ? (
            /* Empty Directory State */
            <div className="glass-panel rounded-3xl p-10 text-center space-y-4 border border-dashed border-slate-300 dark:border-slate-800">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                <FolderPlus className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  ยังไม่มีข้อมูลในหมวดหมู่นี้
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  ไม่พบรายการเอกสารหรือสื่อประชาสัมพันธ์ในหมวดหมู่นี้
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {/* 1. Subfolders Cards Grid */}
              {currentSubfolders.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    หมวดหมู่ย่อย ({currentSubfolders.length}):
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {currentSubfolders.map((fNode) => (
                      <div
                        key={fNode.relativePath}
                        onClick={() => selectFolder(fNode.relativePath)}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Folder className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-white truncate" title={fNode.name}>
                            {fNode.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                          {fNode.fileCount} รายการ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Direct Content Stream (Full Inline Viewers with Order Controls) */}
              {currentFiles.map((doc, idx) => (
                <div
                  key={doc.id}
                  id={`file-${doc.id}`}
                  className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-emerald-500/30 bg-white dark:bg-slate-900/95 space-y-6 shadow-md dark:shadow-2xl scroll-mt-32 hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-all duration-300"
                >
                  {/* SECTION HEADER: File Name as Title + Order Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {getFileBadgeIcon(doc.fileType)}
                          {doc.extension}
                        </span>

                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          ลำดับที่ {idx + 1}
                        </span>

                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          ขนาด: {doc.fileSize}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          แก้ไขล่าสุด: {doc.modifiedDate}
                        </span>
                      </div>

                      {/* SECTION TITLE: Clean file name without numeric prefix */}
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                        {doc.cleanTitle}
                      </h2>
                    </div>

                    {/* Header Action Buttons & Re-order Controls */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {/* Move Up / Down Buttons */}
                      {sortMode === "custom" && (
                        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mr-2">
                          <button
                            onClick={() => handleMoveFile(idx, "up")}
                            disabled={idx === 0 || isSavingOrder}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
                            title="เลื่อนขึ้น"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveFile(idx, "down")}
                            disabled={idx === currentFiles.length - 1 || isSavingOrder}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer transition-colors"
                            title="เลื่อนลง"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {doc.fileType === "image" && (
                        <button
                          onClick={() => setLightboxImage(doc)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          ซูมขยายภาพ
                        </button>
                      )}

                      {doc.fileType === "pdf" && (
                        <a
                          href={getFileStreamUrl(doc.relativePath)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          เปิดแท็บใหม่
                        </a>
                      )}

                      {doc.fileType === "gdrive" && doc.externalUrl && (
                        <a
                          href={doc.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          เปิดบน Google Drive
                        </a>
                      )}

                      {doc.fileType !== "youtube" && doc.fileType !== "gdrive" && (
                        <a
                          href={getFileStreamUrl(doc.relativePath, true)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-emerald-500/20 dark:shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          ดาวน์โหลด
                        </a>
                      )}
                    </div>
                  </div>

                  {/* DIRECT INLINE CONTENT RENDERER */}
                  <div className="pt-2">
                    {/* A. IMAGE RENDERER */}
                    {doc.fileType === "image" && (
                      <div className="space-y-3">
                        <div
                          onClick={() => setLightboxImage(doc)}
                          className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 group cursor-pointer shadow-inner flex items-center justify-center"
                        >
                          <img
                            src={getFileStreamUrl(doc.relativePath)}
                            alt={doc.cleanTitle}
                            className="max-w-full h-auto rounded-xl object-contain group-hover:scale-[1.01] transition-transform duration-300 max-h-[800px]"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="px-4 py-2 rounded-full bg-white/95 dark:bg-slate-900/90 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-500/40 flex items-center gap-2 shadow-2xl">
                              <Maximize2 className="w-4 h-4" />
                              คลิกเพื่อซูมดูภาพขนาดเต็ม
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* B. PDF INLINE EMBEDDED VIEWER */}
                    {doc.fileType === "pdf" && (
                      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner">
                        <iframe
                          src={getFileStreamUrl(doc.relativePath)}
                          className="w-full h-[650px] sm:h-[800px] border-none"
                          title={doc.cleanTitle}
                        />
                      </div>
                    )}

                    {/* C. VIDEO INLINE PLAYER */}
                    {doc.fileType === "video" && (
                      <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow-xl">
                        <video
                          controls
                          className="w-full h-full"
                          src={getFileStreamUrl(doc.relativePath)}
                        >
                          เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอนี้
                        </video>
                      </div>
                    )}

                    {/* D. YOUTUBE INLINE EMBEDDED PLAYER */}
                    {doc.fileType === "youtube" && doc.youtubeEmbedUrl && (
                      <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-red-500/30 shadow-xl">
                        <iframe
                          className="w-full h-full"
                          src={doc.youtubeEmbedUrl}
                          title={doc.cleanTitle}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* E. GOOGLE DRIVE EMBEDDED VIDEO/DOC PLAYER */}
                    {doc.fileType === "gdrive" && doc.gdriveEmbedUrl && (
                      <div className="aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-emerald-500/30 shadow-xl">
                        <iframe
                          className="w-full h-full border-none"
                          src={doc.gdriveEmbedUrl}
                          title={doc.cleanTitle}
                          allow="autoplay"
                        />
                      </div>
                    )}

                    {/* F. TEXT CONTENT RENDERER */}
                    {doc.fileType === "text" && doc.textContent && (
                      <div className="p-5 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 dark:border-emerald-500/40 font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-[500px]">
                        {doc.textContent}
                      </div>
                    )}

                    {/* G. OFFICE DOCUMENT CARD */}
                    {doc.fileType === "document" && (
                      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white">{doc.fileName}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">ไฟล์เอกสารประมวลผล ({doc.fileSize})</div>
                          </div>
                        </div>
                        <a
                          href={getFileStreamUrl(doc.relativePath, true)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          ดาวน์โหลดเอกสาร
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Image Zoom Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-emerald-500/40 max-w-6xl w-full max-h-[92vh] flex flex-col space-y-4 shadow-2xl relative overflow-hidden bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-xl">
                  {lightboxImage.cleanTitle}
                </h3>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-slate-900/50 rounded-2xl border border-slate-800">
              <img
                src={getFileStreamUrl(lightboxImage.relativePath)}
                alt={lightboxImage.cleanTitle}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>ตำแหน่งไฟล์: {lightboxImage.relativePath}</span>
              <a
                href={getFileStreamUrl(lightboxImage.relativePath, true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold flex items-center gap-1.5 hover:brightness-110 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                ดาวน์โหลดรูปภาพภาพเต็ม ({lightboxImage.fileSize})
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="mt-20">
        <Footer />
      </div>
    </main>
  );
}
