"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  FileText,
  Download,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Search,
  Video,
  FileSpreadsheet,
  File,
  Eye,
  X,
  Play,
  RefreshCw,
  Info,
  FolderPlus,
  Sparkles,
  LayoutGrid,
  List,
  Home,
  HardDrive,
  Plus,
  ExternalLink,
} from "lucide-react";
import { DocFileItem, DocTreeNode } from "@/app/api/documents/route";

const YouTubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export default function DocumentsPage() {
  const [tree, setTree] = useState<DocTreeNode[]>([]);
  const [allFiles, setAllFiles] = useState<DocFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Selected folder path ("" means root "doc")
  const [currentFolderPath, setCurrentFolderPath] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ "": true });

  // Video / YouTube modal preview state
  const [activeMedia, setActiveMedia] = useState<DocFileItem | null>(null);

  // Add YouTube Link Modal state
  const [showAddYtModal, setShowAddYtModal] = useState(false);
  const [ytTitle, setYtTitle] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [isSavingYt, setIsSavingYt] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.status === "success") {
        setTree(data.tree || []);
        setAllFiles(data.files || []);
      }
    } catch (e) {
      console.error("Failed to fetch documents", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAddYouTubeLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytTitle || !ytUrl) return;
    setIsSavingYt(true);

    try {
      const res = await fetch("/api/documents/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ytTitle,
          url: ytUrl,
          subfolder: currentFolderPath,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setYtTitle("");
        setYtUrl("");
        setShowAddYtModal(false);
        fetchDocuments();
      } else {
        alert(data.message || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsSavingYt(false);
    }
  };

  const toggleFolderExpand = (pathStr: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [pathStr]: !prev[pathStr],
    }));
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
          f.relativePath.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentFolderPath === ""
    ? tree.filter((n) => !n.isFolder && n.fileItem).map((n) => n.fileItem!)
    : (currentNode?.children || []).filter((n) => !n.isFolder && n.fileItem).map((n) => n.fileItem!);

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "youtube":
        return <YouTubeIcon className="w-6 h-6 text-red-500 fill-red-500/20" />;
      case "pdf":
        return <FileText className="w-6 h-6 text-rose-400" />;
      case "video":
        return <Video className="w-6 h-6 text-purple-400" />;
      case "document":
        return <FileSpreadsheet className="w-6 h-6 text-emerald-400" />;
      default:
        return <File className="w-6 h-6 text-cyan-400" />;
    }
  };

  const renderSidebarTreeNode = (node: DocTreeNode, depth: number = 0) => {
    if (!node.isFolder) return null;

    const isExpanded = !!expandedFolders[node.relativePath];
    const isSelected = currentFolderPath === node.relativePath;
    const hasChildren = node.children && node.children.some((c) => c.isFolder);

    return (
      <div key={node.relativePath} className="space-y-1">
        <div
          onClick={() => selectFolder(node.relativePath)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`flex items-center justify-between py-2 pr-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            isSelected
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => toggleFolderExpand(node.relativePath, e)}
                className="p-0.5 rounded text-slate-400 hover:text-white shrink-0"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="w-3.5 shrink-0" />
            )}

            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-cyan-400/80 shrink-0" />
            )}

            <span className="truncate">{node.name}</span>
          </div>

          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 shrink-0 ml-1">
            {node.fileCount}
          </span>
        </div>

        {isExpanded && node.children && (
          <div className="space-y-1">
            {node.children.map((child) => renderSidebarTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const breadcrumbs = currentFolderPath ? currentFolderPath.split("/") : [];

  return (
    <main className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col pt-32 pb-16 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10 flex-1 w-full">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            คลังเอกสารและสื่อสารสนเทศ
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            คลังเอกสาร & สื่อวิดีโอ YouTube
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
            สืบค้นไฟล์เอกสาร PDF, วิดีโอคู่มือ (MP4) และคลิปวิดีโอ YouTube โดยตรงจากโฟลเดอร์ในระบบ
          </p>
        </div>

        {/* Top Control Bar: Search & Add YouTube & Actions */}
        <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อไฟล์ โฟลเดอร์ หรือคลิป YouTube..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">


            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "table" ? "bg-cyan-500 text-white" : "text-slate-400 hover:text-white"
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={fetchDocuments}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        {/* Main Explorer 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Root Folder Tree Sidebar (4 cols) */}
          <div className="lg:col-span-4 glass-panel rounded-3xl p-5 border border-cyan-500/30 bg-slate-900/90 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>โครงสร้างโฟลเดอร์ Root (doc)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {allFiles.length} รายการ
              </span>
            </div>

            {/* Root Folder Button */}
            <div className="space-y-1">
              <div
                onClick={() => setCurrentFolderPath("")}
                className={`flex items-center justify-between py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  currentFolderPath === ""
                    ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-md"
                    : "text-slate-200 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-cyan-400" />
                  <span>📁 Root (doc)</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                  {allFiles.length}
                </span>
              </div>

              {/* Subfolder Tree Nodes */}
              <div className="space-y-1 pt-1">
                {tree.filter((n) => n.isFolder).map((node) => renderSidebarTreeNode(node, 1))}
              </div>
            </div>
          </div>

          {/* Right Column: Folder Content View Area (8 cols) */}
          <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-cyan-500/30 bg-slate-900/90 space-y-6 shadow-2xl min-h-[500px] flex flex-col">
            {/* Breadcrumb Path Bar */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 text-xs font-semibold text-slate-300">
              <button
                onClick={() => setCurrentFolderPath("")}
                className="flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-cyan-400" />
                <span>doc</span>
              </button>

              {breadcrumbs.map((folderName, index) => {
                const subPath = breadcrumbs.slice(0, index + 1).join("/");
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <div key={subPath} className="flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    <button
                      onClick={() => setCurrentFolderPath(subPath)}
                      className={`cursor-pointer hover:text-cyan-300 transition-colors ${
                        isLast ? "text-cyan-400 font-bold" : "text-slate-300"
                      }`}
                    >
                      {folderName}
                    </button>
                  </div>
                );
              })}
            </div>

            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <span>กำลังอ่านรายการไฟล์ในโฟลเดอร์...</span>
              </div>
            ) : currentSubfolders.length === 0 && currentFiles.length === 0 ? (
              /* Empty Directory State */
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4 border border-dashed border-slate-800 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <FolderPlus className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    โฟลเดอร์นี้ยังไม่มีรายการไฟล์หรือวิดีโอ
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    ไม่พบรายการเอกสารในหมวดหมู่นี้
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 flex-1">
                {/* 1. Subfolders Grid */}
                {currentSubfolders.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-cyan-400" />
                      โฟลเดอร์ย่อย ({currentSubfolders.length}):
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {currentSubfolders.map((folder) => (
                        <div
                          key={folder.relativePath}
                          onClick={() => selectFolder(folder.relativePath)}
                          className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 group shadow-md"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Folder className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
                            <span className="font-semibold text-xs text-slate-200 group-hover:text-white truncate" title={folder.name}>
                              {folder.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800 shrink-0">
                            {folder.fileCount} รายการ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Files Display Section */}
                {currentFiles.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      รายการไฟล์ & วิดีโอ ({currentFiles.length}):
                    </h4>

                    {viewMode === "grid" ? (
                      /* GRID VIEW */
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentFiles.map((doc) => (
                          <div
                            key={doc.id}
                            className="glass-panel rounded-2xl p-4 border border-cyan-500/20 flex flex-col justify-between gap-3 hover:border-cyan-400 transition-all duration-300 shadow-xl group bg-slate-950/60 overflow-hidden"
                          >
                            {/* YouTube Thumbnail Preview */}
                            {doc.fileType === "youtube" && doc.youtubeThumbnail && (
                              <div
                                onClick={() => setActiveMedia(doc)}
                                className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer group/thumb"
                              >
                                <img
                                  src={doc.youtubeThumbnail}
                                  alt={doc.fileName}
                                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/thumb:bg-black/20 transition-colors">
                                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/50 group-hover/thumb:scale-110 transition-transform">
                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                  </div>
                                </div>
                                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white flex items-center gap-1 border border-white/20">
                                  <YouTubeIcon className="w-4 h-4 text-red-500 fill-red-500" />
                                  YouTube
                                </span>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 group-hover:border-cyan-500/40 transition-colors">
                                {getFileIcon(doc.fileType)}
                              </div>
                              <div className="space-y-1 flex-1 min-w-0">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                    doc.fileType === "youtube"
                                      ? "bg-red-950 text-red-300 border-red-800"
                                      : "bg-slate-900 text-cyan-300 border-slate-800"
                                  }`}
                                >
                                  {doc.extension}
                                </span>
                                <h5 className="font-bold text-xs text-white leading-snug group-hover:text-cyan-300 transition-colors truncate" title={doc.fileName}>
                                  {doc.fileName}
                                </h5>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                                  <span>{doc.fileSize}</span>
                                  <span>•</span>
                                  <span>{doc.modifiedDate}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                              {doc.fileType === "youtube" && (
                                <>
                                  <button
                                    onClick={() => setActiveMedia(doc)}
                                    className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-semibold border border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Play className="w-3.5 h-3.5 fill-current" />
                                    รับชมบนเว็บ
                                  </button>
                                  {doc.externalUrl && (
                                    <a
                                      href={doc.externalUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
                                      title="เปิดบน YouTube"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </>
                              )}

                              {doc.fileType === "video" && (
                                <button
                                  onClick={() => setActiveMedia(doc)}
                                  className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold border border-purple-500/30 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  เล่น VDO
                                </button>
                              )}

                              {doc.fileType === "pdf" && (
                                <a
                                  href={`/api/documents/file?path=${encodeURIComponent(doc.relativePath)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  เปิดดู
                                </a>
                              )}

                              {doc.fileType !== "youtube" && (
                                <a
                                  href={`/api/documents/file?path=${encodeURIComponent(doc.relativePath)}&download=true`}
                                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  ดาวน์โหลด
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* TABLE LIST VIEW */
                      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/80 shadow-xl">
                        <table className="w-full text-left text-xs text-slate-300 font-sans">
                          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                            <tr>
                              <th className="py-3 px-4">ชื่อไฟล์ / ลิงก์</th>
                              <th className="py-3 px-4">ประเภท</th>
                              <th className="py-3 px-4">ขนาด</th>
                              <th className="py-3 px-4 text-right">ดำเนินการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {currentFiles.map((doc) => (
                              <tr key={doc.id} className="hover:bg-slate-900/60 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {getFileIcon(doc.fileType)}
                                    <span className="font-medium text-white truncate max-w-xs" title={doc.fileName}>
                                      {doc.fileName}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-mono font-bold">
                                  <span className={doc.fileType === "youtube" ? "text-red-400" : "text-cyan-300"}>
                                    {doc.extension}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-400">
                                  {doc.fileSize}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {(doc.fileType === "video" || doc.fileType === "youtube") && (
                                      <button
                                        onClick={() => setActiveMedia(doc)}
                                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                          doc.fileType === "youtube"
                                            ? "bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white"
                                            : "bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white"
                                        }`}
                                        title="เล่นสื่อวิดีโอ"
                                      >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                      </button>
                                    )}

                                    {doc.fileType === "pdf" && (
                                      <a
                                        href={`/api/documents/file?path=${encodeURIComponent(doc.relativePath)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors cursor-pointer"
                                        title="เปิดดูเอกสาร"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </a>
                                    )}

                                    {doc.fileType !== "youtube" && (
                                      <a
                                        href={`/api/documents/file?path=${encodeURIComponent(doc.relativePath)}&download=true`}
                                        className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                                        title="ดาวน์โหลด"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video & YouTube Modal Player */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 border border-cyan-500/40 max-w-4xl w-full space-y-4 shadow-2xl relative overflow-hidden bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {activeMedia.fileType === "youtube" ? (
                  <YouTubeIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <Video className="w-5 h-5 text-purple-400" />
                )}
                <h3 className="font-bold text-sm text-white truncate max-w-lg">
                  {activeMedia.fileName}
                </h3>
              </div>
              <button
                onClick={() => setActiveMedia(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              {activeMedia.fileType === "youtube" && activeMedia.youtubeEmbedUrl ? (
                <iframe
                  className="w-full h-full"
                  src={`${activeMedia.youtubeEmbedUrl}?autoplay=1`}
                  title={activeMedia.fileName}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  src={`/api/documents/file?path=${encodeURIComponent(activeMedia.relativePath)}`}
                >
                  เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอนี้
                </video>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <span>ตำแหน่งไฟล์: {activeMedia.relativePath}</span>
              {activeMedia.fileType === "youtube" && activeMedia.externalUrl ? (
                <a
                  href={activeMedia.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  ดูบน YouTube
                </a>
              ) : (
                <a
                  href={`/api/documents/file?path=${encodeURIComponent(activeMedia.relativePath)}&download=true`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold flex items-center gap-1.5 hover:brightness-110 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลดวิดีโอ ({activeMedia.fileSize})
                </a>
              )}
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
