import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export interface DocFileItem {
  id: string;
  fileName: string;
  cleanTitle: string;
  numOrder: number;
  filePath: string;
  relativePath: string;
  subfolder: string;
  fileSize: string;
  sizeBytes: number;
  extension: string;
  fileType: "pdf" | "video" | "youtube" | "document" | "image" | "other";
  modifiedDate: string;
  youtubeId?: string;
  youtubeEmbedUrl?: string;
  youtubeThumbnail?: string;
  externalUrl?: string;
}

export interface DocTreeNode {
  name: string;
  relativePath: string;
  isFolder: boolean;
  fileCount: number;
  children?: DocTreeNode[];
  fileItem?: DocFileItem;
  numOrder?: number;
}

const DOC_DIR = process.env.DOC_DIR || path.join(process.cwd(), "doc");

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.trim().match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function parseFileForYouTube(filePath: string, ext: string): { url: string; youtubeId: string } | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const e = ext.toLowerCase();

    let targetUrl = "";

    if (e === ".url") {
      const lines = content.split(/\r?\n/);
      for (const l of lines) {
        if (l.toLowerCase().startsWith("url=")) {
          targetUrl = l.substring(4).trim();
          break;
        }
      }
    } else if (e === ".txt" || e === ".youtube") {
      const lines = content.split(/\r?\n/);
      for (const l of lines) {
        if (l.toLowerCase().includes("youtube.com") || l.toLowerCase().includes("youtu.be")) {
          targetUrl = l.trim();
          break;
        }
      }
    } else if (e === ".json") {
      try {
        const json = JSON.parse(content);
        if (json.url) targetUrl = json.url;
        else if (Array.isArray(json) && json[0]?.url) targetUrl = json[0].url;
      } catch (err) {
        // ignore
      }
    }

    if (targetUrl) {
      const ytId = extractYouTubeId(targetUrl);
      if (ytId) {
        return { url: targetUrl, youtubeId: ytId };
      }
    }
  } catch (err) {
    // ignore read errors
  }
  return null;
}

function getFileType(ext: string, isYouTube: boolean): "pdf" | "video" | "youtube" | "document" | "image" | "other" {
  if (isYouTube) return "youtube";
  const e = ext.toLowerCase();
  if (e === ".pdf") return "pdf";
  if ([".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"].includes(e)) return "video";
  if ([".docx", ".doc", ".pptx", ".ppt", ".xlsx", ".xls", ".txt", ".csv"].includes(e)) return "document";
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(e)) return "image";
  return "other";
}

function getCustomOrderMap(dirPath: string): Record<string, number> {
  const orderFile = path.join(dirPath, "sort_order.json");
  if (fs.existsSync(/*turbopackIgnore: true*/ orderFile)) {
    try {
      const content = fs.readFileSync(/*turbopackIgnore: true*/ orderFile, "utf-8");
      const list = JSON.parse(content);
      const map: Record<string, number> = {};
      if (Array.isArray(list)) {
        list.forEach((fn: string, idx: number) => {
          map[fn] = idx;
        });
      }
      return map;
    } catch (e) {
      // ignore
    }
  }
  return {};
}

function scanDirectoryRecursively(dirPath: string, rootDir: string): DocFileItem[] {
  let items: DocFileItem[] = [];
  if (!fs.existsSync(/*turbopackIgnore: true*/ dirPath)) return items;

  const orderMap = getCustomOrderMap(dirPath);
  const entries = fs.readdirSync(/*turbopackIgnore: true*/ dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "sort_order.json") continue;

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      items = items.concat(scanDirectoryRecursively(fullPath, rootDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const stat = fs.statSync(/*turbopackIgnore: true*/ fullPath);
      const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
      const parts = relPath.split("/");
      const subfolder = parts.length > 1 ? parts.slice(0, -1).join("/") : "Root";

      const modified = stat.mtime.toISOString().split("T")[0];

      const ytInfo = parseFileForYouTube(fullPath, ext);
      const isYouTube = !!ytInfo;
      const fileType = getFileType(ext, isYouTube);

      const numMatch = entry.name.match(/^(\d+)[\._\-\s]+/);
      let numOrder = numMatch ? parseInt(numMatch[1], 10) : 999;
      if (orderMap[entry.name] !== undefined) {
        numOrder = orderMap[entry.name];
      }

      const cleanTitle = entry.name
        .replace(/^(\d+)[\._\-\s]+/, "")
        .replace(/\.(url|youtube|txt)$/i, "")
        .replace(/\.[^/.]+$/, "");

      items.push({
        id: Buffer.from(relPath).toString("base64url"),
        fileName: entry.name,
        cleanTitle: cleanTitle || entry.name,
        numOrder,
        filePath: fullPath,
        relativePath: relPath,
        subfolder: subfolder || "Root",
        fileSize: isYouTube ? "YouTube Link" : formatFileSize(stat.size),
        sizeBytes: stat.size,
        extension: isYouTube ? "YOUTUBE" : ext.replace(".", "").toUpperCase(),
        fileType,
        modifiedDate: modified,
        youtubeId: ytInfo?.youtubeId,
        youtubeEmbedUrl: ytInfo ? `https://www.youtube.com/embed/${ytInfo.youtubeId}` : undefined,
        youtubeThumbnail: ytInfo ? `https://img.youtube.com/vi/${ytInfo.youtubeId}/hqdefault.jpg` : undefined,
        externalUrl: ytInfo?.url,
      });
    }
  }

  return items;
}

function buildDirectoryTree(dirPath: string, rootDir: string): DocTreeNode[] {
  if (!fs.existsSync(/*turbopackIgnore: true*/ dirPath)) return [];
  const orderMap = getCustomOrderMap(dirPath);
  const entries = fs.readdirSync(/*turbopackIgnore: true*/ dirPath, { withFileTypes: true });

  const nodes: DocTreeNode[] = [];

  for (const entry of entries) {
    if (entry.name === "sort_order.json") continue;

    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");

    const numMatch = entry.name.match(/^(\d+)[\._\-\s]+/);
    let numOrder = numMatch ? parseInt(numMatch[1], 10) : 999;
    if (orderMap[entry.name] !== undefined) {
      numOrder = orderMap[entry.name];
    }

    if (entry.isDirectory()) {
      const children = buildDirectoryTree(fullPath, rootDir);
      const countFiles = (items: DocTreeNode[]): number => {
        return items.reduce((acc, curr) => {
          if (curr.isFolder) return acc + countFiles(curr.children || []);
          return acc + 1;
        }, 0);
      };

      nodes.push({
        name: entry.name.replace(/^(\d+)[\._\-\s]+/, ""),
        relativePath: relPath,
        isFolder: true,
        fileCount: countFiles(children),
        children,
        numOrder,
      });
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const stat = fs.statSync(/*turbopackIgnore: true*/ fullPath);
      const modified = stat.mtime.toISOString().split("T")[0];

      const parentDir = path.relative(rootDir, dirPath).replace(/\\/g, "/");
      const ytInfo = parseFileForYouTube(fullPath, ext);
      const isYouTube = !!ytInfo;
      const fileType = getFileType(ext, isYouTube);

      const cleanTitle = entry.name
        .replace(/^(\d+)[\._\-\s]+/, "")
        .replace(/\.(url|youtube|txt)$/i, "")
        .replace(/\.[^/.]+$/, "");

      const fileItem: DocFileItem = {
        id: Buffer.from(relPath).toString("base64url"),
        fileName: entry.name,
        cleanTitle: cleanTitle || entry.name,
        numOrder,
        filePath: fullPath,
        relativePath: relPath,
        subfolder: parentDir || "Root",
        fileSize: isYouTube ? "YouTube Link" : formatFileSize(stat.size),
        sizeBytes: stat.size,
        extension: isYouTube ? "YOUTUBE" : ext.replace(".", "").toUpperCase(),
        fileType,
        modifiedDate: modified,
        youtubeId: ytInfo?.youtubeId,
        youtubeEmbedUrl: ytInfo ? `https://www.youtube.com/embed/${ytInfo.youtubeId}` : undefined,
        youtubeThumbnail: ytInfo ? `https://img.youtube.com/vi/${ytInfo.youtubeId}/hqdefault.jpg` : undefined,
        externalUrl: ytInfo?.url,
      };

      nodes.push({
        name: cleanTitle || entry.name,
        relativePath: relPath,
        isFolder: false,
        fileCount: 0,
        fileItem,
        numOrder,
      });
    }
  }

  return nodes.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    if ((a.numOrder ?? 999) !== (b.numOrder ?? 999)) {
      return (a.numOrder ?? 999) - (b.numOrder ?? 999);
    }
    return a.name.localeCompare(b.name, "th");
  });
}

export async function GET(request: Request) {
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.IS_BUILD === "true") {
    return NextResponse.json({ status: "success", count: 0, tree: [], files: [] });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sortMode = searchParams.get("sort") || "custom";

    if (!fs.existsSync(/*turbopackIgnore: true*/ DOC_DIR)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ DOC_DIR, { recursive: true });
    }

    let files = scanDirectoryRecursively(DOC_DIR, DOC_DIR);
    const tree = buildDirectoryTree(DOC_DIR, DOC_DIR);

    if (sortMode === "name") {
      files.sort((a, b) => a.cleanTitle.localeCompare(b.cleanTitle, "th"));
    } else if (sortMode === "date") {
      files.sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate));
    } else {
      files.sort((a, b) => {
        if (a.numOrder !== b.numOrder) return a.numOrder - b.numOrder;
        return a.fileName.localeCompare(b.fileName, "th");
      });
    }

    return NextResponse.json({
      status: "success",
      count: files.length,
      docDir: DOC_DIR,
      tree,
      files,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to scan doc directory",
        files: [],
        tree: [],
      },
      { status: 500 }
    );
  }
}
