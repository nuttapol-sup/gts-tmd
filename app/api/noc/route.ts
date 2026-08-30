import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface DocFileItem {
  id: string;
  fileName: string;
  cleanTitle: string; // File name stripped of extension and numeric prefix
  filePath: string;
  relativePath: string;
  subfolder: string;
  fileSize: string;
  sizeBytes: number;
  extension: string;
  fileType: "pdf" | "video" | "youtube" | "document" | "image" | "text" | "other";
  modifiedDate: string;
  sortOrder: number; // Order index
  youtubeId?: string;
  youtubeEmbedUrl?: string;
  youtubeThumbnail?: string;
  externalUrl?: string;
  textContent?: string;
}

export interface DocTreeNode {
  name: string;
  relativePath: string;
  isFolder: boolean;
  fileCount: number;
  children?: DocTreeNode[];
  fileItem?: DocFileItem;
}

const NOC_DIR = "D:\\React\\gts-tmd\\Thailand NOC";

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

function getFileType(ext: string, isYouTube: boolean): "pdf" | "video" | "youtube" | "document" | "image" | "text" | "other" {
  if (isYouTube) return "youtube";
  const e = ext.toLowerCase();
  if (e === ".pdf") return "pdf";
  if ([".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"].includes(e)) return "video";
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(e)) return "image";
  if ([".txt", ".md", ".log"].includes(e)) return "text";
  if ([".docx", ".doc", ".pptx", ".ppt", ".xlsx", ".xls", ".csv"].includes(e)) return "document";
  return "other";
}

function getCustomOrderMap(dirPath: string): Record<string, number> {
  const orderFile = path.join(dirPath, "sort_order.json");
  if (fs.existsSync(orderFile)) {
    try {
      const arr: string[] = JSON.parse(fs.readFileSync(orderFile, "utf-8"));
      const map: Record<string, number> = {};
      arr.forEach((filename, idx) => {
        map[filename] = idx + 1;
      });
      return map;
    } catch (e) {
      // ignore
    }
  }
  return {};
}

function scanDirectoryRecursively(dirPath: string, rootDir: string): DocFileItem[] {
  let items: DocFileItem[] = [];
  if (!fs.existsSync(dirPath)) return items;

  const orderMap = getCustomOrderMap(dirPath);
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "sort_order.json") continue;

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      items = items.concat(scanDirectoryRecursively(fullPath, rootDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const stat = fs.statSync(fullPath);
      const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
      const parts = relPath.split("/");
      const subfolder = parts.length > 1 ? parts.slice(0, -1).join("/") : "Root";

      const modified = stat.mtime.toISOString().split("T")[0];

      const ytInfo = parseFileForYouTube(fullPath, ext);
      const isYouTube = !!ytInfo;
      const fileType = getFileType(ext, isYouTube);

      // Check numeric prefix e.g. "01_Title.png" -> order 1, cleanTitle "Title"
      const numMatch = entry.name.match(/^(\d+)[\._\-\s]+/);
      let numOrder = numMatch ? parseInt(numMatch[1], 10) : 999;
      if (orderMap[entry.name] !== undefined) {
        numOrder = orderMap[entry.name];
      }

      // Strip numeric prefix and file extension for heading title
      const cleanTitle = entry.name
        .replace(/^(\d+)[\._\-\s]+/, "")
        .replace(/\.[^/.]+$/, "");

      let textContent: string | undefined = undefined;
      if (fileType === "text" && stat.size < 100000) {
        try {
          textContent = fs.readFileSync(fullPath, "utf-8");
        } catch (e) {
          // ignore
        }
      }

      items.push({
        id: Buffer.from(relPath).toString("base64url"),
        fileName: entry.name,
        cleanTitle,
        filePath: fullPath,
        relativePath: relPath,
        subfolder: subfolder || "Root",
        fileSize: isYouTube ? "YouTube Link" : formatFileSize(stat.size),
        sizeBytes: stat.size,
        extension: isYouTube ? "YOUTUBE" : ext.replace(".", "").toUpperCase(),
        fileType,
        modifiedDate: modified,
        sortOrder: numOrder,
        youtubeId: ytInfo?.youtubeId,
        youtubeEmbedUrl: ytInfo ? `https://www.youtube.com/embed/${ytInfo.youtubeId}` : undefined,
        youtubeThumbnail: ytInfo ? `https://img.youtube.com/vi/${ytInfo.youtubeId}/hqdefault.jpg` : undefined,
        externalUrl: ytInfo?.url,
        textContent,
      });
    }
  }

  // Default sorting: sortOrder asc, then cleanTitle asc
  return items.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.cleanTitle.localeCompare(b.cleanTitle, "th");
  });
}

function buildDirectoryTree(dirPath: string, rootDir: string): DocTreeNode[] {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  const nodes: DocTreeNode[] = [];

  for (const entry of entries) {
    if (entry.name === "sort_order.json") continue;

    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      const children = buildDirectoryTree(fullPath, rootDir);
      const countFiles = (items: DocTreeNode[]): number => {
        return items.reduce((acc, curr) => {
          if (curr.isFolder) return acc + countFiles(curr.children || []);
          return acc + 1;
        }, 0);
      };

      nodes.push({
        name: entry.name,
        relativePath: relPath,
        isFolder: true,
        fileCount: countFiles(children),
        children,
      });
    }
  }

  return nodes.sort((a, b) => a.name.localeCompare(b.name, "th"));
}

export async function GET(request: Request) {
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.IS_BUILD === "true") {
    return NextResponse.json({ status: "success", count: 0, tree: [], files: [] });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sortMode = searchParams.get("sort") || "custom";

    if (!fs.existsSync(NOC_DIR)) {
      fs.mkdirSync(NOC_DIR, { recursive: true });
    }

    let files = scanDirectoryRecursively(NOC_DIR, NOC_DIR);
    const tree = buildDirectoryTree(NOC_DIR, NOC_DIR);

    if (sortMode === "name") {
      files = files.sort((a, b) => a.cleanTitle.localeCompare(b.cleanTitle, "th"));
    } else if (sortMode === "newest") {
      files = files.sort((a, b) => b.modifiedDate.localeCompare(a.modifiedDate));
    } else if (sortMode === "oldest") {
      files = files.sort((a, b) => a.modifiedDate.localeCompare(b.modifiedDate));
    }

    return NextResponse.json({
      status: "success",
      count: files.length,
      nocDir: NOC_DIR,
      tree,
      files,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to scan Thailand NOC directory",
        files: [],
        tree: [],
      },
      { status: 500 }
    );
  }
}
