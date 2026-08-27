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
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { DocFileItem, DocTreeNode } from "@/app/api/documents/route";
import { useLanguage } from "@/context/language-context";

const YouTubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export default function DocumentsPage() {
  const { lang, t } = useLanguage();
  const [tree, setTree] = useState<DocTreeNode[]>([]);
  const [allFiles, setAllFiles] = useState<DocFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortMode, setSortMode] = useState<string>("custom");

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
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/documents?sort=${sortMode}`);
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
  }, [sortMode]);

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
      const res = await fetch("/api/documents/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          (f.cleanTitle && f.cleanTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
          f.relativePath.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentFolderPath === ""
    ? allFiles.filter((f) => f.subfolder === "Root")
    : allFiles.filter((f) => f.subfolder === currentFolderPath);

  const getFileIcon = (type: DocFileItem["fileType"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-rose-400" />;
      case "video":
        return <Video className="w-5 h-5 text-purple-400" />;
      case "youtube":
        return <YouTubeIcon className="w-5 h-5 text-red-500" />;
      case "document":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case "image":
        return <FileText className="w-5 h-5 text-cyan-400" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  const breadcrumbs = currentFolderPath ? currentFolderPath.split("/") : [];

  const renderSidebarTreeNode = (node: DocTreeNode, depth = 0) => {
    const isSelected = currentFolderPath === node.relativePath;
    const isExpanded = !!expandedFolders[node.relativePath];
    const hasChildren = node.children && node.children.some((c) => c.isFolder);

    return (
      <div key={node.relativePath} className="space-y-0.5">
        <div
          onClick={() => selectFolder(node.relativePath)}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={`flex items-center justify-between py-1.5 pr-2 rounded-xl text-xs cursor-pointer transition-all ${
            isSelected
              ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm"
              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => toggleFolderExpand(node.relativePath, e)}
                className="p-0.5 hover:text-cyan-400 text-slate-400 transition-colors shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-3.5 h-3.5 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-cyan-500/80 shrink-0" />
            )}
            <span className="truncate" title={node.name}>
              {node.name}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">
            {node.fileCount}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {node.children
              ?.filter((c) => c.isFolder)
              .map((child) => renderSidebarTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b132b] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8 relative z-10">
        {/* Background Decorative Glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Page Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-lg">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            {t("คลังเอกสาร & สื่อประชาสัมพันธ์ (Document Repository)", "Document Repository & Media")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t("เอกสารที่เกี่ยวข้อง", "Related Documents")}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-light">
            {t(
              "รวบรวมคู่มือ เอกสารวิชาการ รายงานการประชุม แบบฟอร์ม และคลิปวิดีโอแนะนำการใช้งาน",
              "Collection of manuals, technical documents, meeting reports, forms, and video tutorials"
            )}
          </p>
        </div>

        {/* Top Control Toolbar & Search */}
        <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t("ค้นหาชื่อไฟล์ โฟลเดอร์ หรือคลิป YouTube...", "Search file name, folder, or YouTube video...")}
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

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Sort Mode Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value)}
                className="bg-transparent text-xs text-cyan-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="custom" className="bg-slate-900 text-white">🔢 ลำดับที่กำหนด (01_, 02_)</option>
                <option value="name" className="bg-slate-900 text-white">🔤 ชื่อหัวข้อ (A-Z)</option>
                <option value="date" className="bg-slate-900 text-white">📅 ใหม่ล่าสุด</option>
              </select>
            </div>

            {/* View Mode Toggle */}
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
              disabled={isLoading || isSavingOrder}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isSavingOrder ? "animate-spin text-cyan-400" : ""}`} />
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
                <span>เอกสารที่เกี่ยวข้อง</span>
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
                  <span>📁 เอกสารที่เกี่ยวข้อง</span>
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
            {currentFolderPath !== "" && (
              <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-cyan-500/20 text-xs font-semibold text-slate-300">
                <button
                  onClick={() => setCurrentFolderPath("")}
                  className="flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5 text-cyan-400" />
                  <span>เอกสารที่เกี่ยวข้อง</span>
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
            )}

            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-sm">กำลังดาวน์โหลดข้อมูลเอกสาร...</span>
              </div>
            ) : currentSubfolders.length === 0 && currentFiles.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3 border border-dashed border-slate-800 rounded-2xl">
                <FolderPlus className="w-10 h-10 text-cyan-500/40" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">ไม่พบไฟล์ในโฟลเดอร์นี้</h4>
                  <p className="text-xs text-slate-400">ยังไม่มีเอกสารหรือคลิปวิดีโอในหมวดหมู่นี้</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Subfolders Display Section */}
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
                        {currentFiles.map((doc, idx) => (
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
                                  alt={doc.cleanTitle || doc.fileName}
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
                                <h5 className="font-bold text-xs text-white leading-snug group-hover:text-cyan-300 transition-colors truncate" title={doc.cleanTitle || doc.fileName}>
                                  {doc.cleanTitle || doc.fileName}
                                </h5>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                                  <span>{doc.fileSize}</span>
                                  <span>•</span>
                                  <span>{doc.modifiedDate}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons & Order Movement */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                              {/* Order Movement Controls */}
                              {sortMode === "custom" && !searchQuery ? (
                                <div className="flex items-center gap-1 bg-slate-900/90 rounded-lg p-1 border border-slate-800">
                                  <button
                                    onClick={() => handleMoveFile(idx, "up")}
                                    disabled={idx === 0 || isSavingOrder}
                                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 disabled:opacity-20 cursor-pointer transition-colors"
                                    title="เลื่อนขึ้น"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveFile(idx, "down")}
                                    disabled={idx === currentFiles.length - 1 || isSavingOrder}
                                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 disabled:opacity-20 cursor-pointer transition-colors"
                                    title="เลื่อนลง"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div />
                              )}

                              <div className="flex items-center gap-2">
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
                                    เล่นวิดีโอ
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
                                    ดูเอกสาร
                                  </a>
                                )}

                                {doc.fileType !== "youtube" && (
                                  <a
                                    href={`/api/documents/file?path=${encodeURIComponent(doc.relativePath)}&download=true`}
                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    ดาวน์โหลด
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* TABLE LIST VIEW */
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-xl">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/60">
                              <th className="py-3 px-4">ชนิดไฟล์</th>
                              <th className="py-3 px-4">ชื่อเอกสาร</th>
                              <th className="py-3 px-4">ขนาด</th>
                              <th className="py-3 px-4">วันที่แก้ไข</th>
                              <th className="py-3 px-4 text-right">ดำเนินการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-xs">
                            {currentFiles.map((doc, idx) => (
                              <tr key={doc.id} className="hover:bg-slate-900/50 transition-colors group">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    {getFileIcon(doc.fileType)}
                                    <span className="font-mono text-[10px] font-bold text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                      {doc.extension}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                                  {doc.cleanTitle || doc.fileName}
                                </td>
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                                  {doc.fileSize}
                                </td>
                                <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                                  {doc.modifiedDate}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {sortMode === "custom" && !searchQuery && (
                                      <div className="flex items-center gap-1 bg-slate-900/90 rounded-lg p-1 border border-slate-800">
                                        <button
                                          onClick={() => handleMoveFile(idx, "up")}
                                          disabled={idx === 0 || isSavingOrder}
                                          className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 disabled:opacity-20 cursor-pointer transition-colors"
                                          title="เลื่อนขึ้น"
                                        >
                                          <ArrowUp className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleMoveFile(idx, "down")}
                                          disabled={idx === currentFiles.length - 1 || isSavingOrder}
                                          className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 disabled:opacity-20 cursor-pointer transition-colors"
                                          title="เลื่อนลง"
                                        >
                                          <ArrowDown className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}

                                    {doc.fileType === "youtube" && (
                                      <button
                                        onClick={() => setActiveMedia(doc)}
                                        className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-semibold border border-red-500/30 transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <Play className="w-3 h-3 fill-current" />
                                        รับชม
                                      </button>
                                    )}
                                    {doc.fileType === "video" && (
                                      <button
                                        onClick={() => setActiveMedia(doc)}
                                        className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold border border-purple-500/30 transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <Play className="w-3 h-3 fill-current" />
                                        เล่น
                                      </button>
                                    )}
                                    {doc.fileType === "pdf" && (
                                      <a
                                        href={`/api/documents/file?path=${encodeURIComponent(doc.relativePath)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <Eye className="w-3 h-3" />
                                        ดู
                                      </a>
                                    )}
                                    {doc.fileType !== "youtube" && (
                                      <a
                                        href={`/api/documents/file?path=${encodeURIComponent(doc.relativePath)}&download=true`}
                                        className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <Download className="w-3 h-3" />
                                        โหลด
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
      </main>

      {/* Video Preview Modal */}
      {activeMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-cyan-500/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                {getFileIcon(activeMedia.fileType)}
                <h3 className="font-bold text-sm text-white truncate" title={activeMedia.cleanTitle || activeMedia.fileName}>
                  {activeMedia.cleanTitle || activeMedia.fileName}
                </h3>
              </div>
              <button
                onClick={() => setActiveMedia(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-slate-950 flex items-center justify-center">
              {activeMedia.fileType === "youtube" && activeMedia.youtubeEmbedUrl ? (
                <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                  <iframe
                    src={activeMedia.youtubeEmbedUrl}
                    title={activeMedia.cleanTitle || activeMedia.fileName}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : activeMedia.fileType === "video" ? (
                <video
                  src={`/api/documents/file?path=${encodeURIComponent(activeMedia.relativePath)}`}
                  controls
                  autoPlay
                  className="w-full max-h-[70vh] rounded-2xl bg-black shadow-2xl"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Add YouTube Link Modal */}
      {showAddYtModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-cyan-500/40 p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddYtModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold">
                <YouTubeIcon className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                เพิ่มลิงก์ YouTube
              </div>
              <h3 className="text-xl font-extrabold text-white">แทรกวิดีโอ YouTube</h3>
              <p className="text-xs text-slate-400">
                ระบบจะสร้างไฟล์ทางลัดเพื่อแสดงผลคลิปวิดีโอในหมวดหมู่{" "}
                <span className="text-cyan-300 font-semibold font-mono">
                  {currentFolderPath || "Root"}
                </span>
              </p>
            </div>

            <form onSubmit={handleAddYouTubeLink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  หัวข้อ / ชื่อคลิปวิดีโอ:
                </label>
                <input
                  type="text"
                  placeholder="เช่น คู่มือการใช้งานระบบ GTS..."
                  value={ytTitle}
                  onChange={(e) => setYtTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  URL คลิปวิดีโอ YouTube:
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddYtModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSavingYt}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingYt && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>บันทึกวิดีโอ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
