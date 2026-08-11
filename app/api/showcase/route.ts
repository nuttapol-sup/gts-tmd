import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export interface DocFileItem {
  id: string;
  fileName: string;
  cleanTitle: string;
  filePath: string;
  relativePath: string;
  subfolder: string;
  fileSize: string;
  sizeBytes: number;
  extension: string;
  fileType: "pdf" | "video" | "youtube" | "gdrive" | "document" | "image" | "text" | "other";
  modifiedDate: string;
  sortOrder: number;
  youtubeId?: string;
  youtubeEmbedUrl?: string;
  youtubeThumbnail?: string;
  gdriveId?: string;
  gdriveEmbedUrl?: string;
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

export const ABOUT_ROOT_DIR = process.env.ABOUT_DIR || path.join(process.cwd(), "About");

export const SHOWCASE_DIRS: Record<string, string> = {
  noc: process.env.NOC_DIR || path.join(process.cwd(), "Thailand NOC"),
  smart: process.env.SMART_DIR || path.join(process.cwd(), "So Smart"),
  moral: process.env.MORAL_DIR || path.join(process.cwd(), "Moral"),
  gov4: process.env.GOV4_DIR || path.join(process.cwd(), "Gov4"),
  swim: process.env.SWIM_DIR || path.join(process.cwd(), "SWIM"),
};

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

function extractGoogleDriveId(url: string): string | null {
  const match = url.trim().match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.trim().match(/[\?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function parseFileForExternalLink(filePath: string, ext: string): { url: string; youtubeId?: string; gdriveId?: string } | null {
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
    } else if (e === ".txt" || e === ".youtube" || e === ".gdrive") {
      const lines = content.split(/\r?\n/);
      for (const l of lines) {
        const lineTrim = l.trim().toLowerCase();
        if (lineTrim.includes("youtube.com") || lineTrim.includes("youtu.be") || lineTrim.includes("drive.google.com")) {
          targetUrl = l.trim();
          break;
        }
      }
    }

    if (targetUrl) {
      const ytId = extractYouTubeId(targetUrl);
      if (ytId) {
        return { url: targetUrl, youtubeId: ytId };
      }

      const gdId = extractGoogleDriveId(targetUrl);
      if (gdId) {
        return { url: targetUrl, gdriveId: gdId };
      }
    }
  } catch (err) {
    // ignore
  }
  return null;
}

function getFileType(ext: string, isYouTube: boolean, isGDrive: boolean): "pdf" | "video" | "youtube" | "gdrive" | "document" | "image" | "text" | "other" {
  if (isYouTube) return "youtube";
  if (isGDrive) return "gdrive";
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
  if (fs.existsSync(/*turbopackIgnore: true*/ orderFile)) {
    try {
      const arr: string[] = JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ orderFile, "utf-8"));
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

      const extLinkInfo = parseFileForExternalLink(fullPath, ext);
      const isYouTube = !!extLinkInfo?.youtubeId;
      const isGDrive = !!extLinkInfo?.gdriveId;
      const fileType = getFileType(ext, isYouTube, isGDrive);

      const numMatch = entry.name.match(/^(\d+)[\._\-\s]+/);
      let numOrder = numMatch ? parseInt(numMatch[1], 10) : 999;
      if (orderMap[entry.name] !== undefined) {
        numOrder = orderMap[entry.name];
      }

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
        fileSize: isYouTube ? "YouTube Link" : isGDrive ? "Google Drive Link" : formatFileSize(stat.size),
        sizeBytes: stat.size,
        extension: isYouTube ? "YOUTUBE" : isGDrive ? "G-DRIVE" : ext.replace(".", "").toUpperCase(),
        fileType,
        modifiedDate: modified,
        sortOrder: numOrder,
        youtubeId: extLinkInfo?.youtubeId,
        youtubeEmbedUrl: extLinkInfo?.youtubeId ? `https://www.youtube.com/embed/${extLinkInfo.youtubeId}` : undefined,
        youtubeThumbnail: extLinkInfo?.youtubeId ? `https://img.youtube.com/vi/${extLinkInfo.youtubeId}/hqdefault.jpg` : undefined,
        gdriveId: extLinkInfo?.gdriveId,
        gdriveEmbedUrl: extLinkInfo?.gdriveId ? `https://drive.google.com/file/d/${extLinkInfo.gdriveId}/preview` : undefined,
        externalUrl: extLinkInfo?.url,
        textContent,
      });
    }
  }

  return items.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.cleanTitle.localeCompare(b.cleanTitle, "th");
  });
}

function buildDirectoryTree(dirPath: string, rootDir: string): DocTreeNode[] {
  if (!fs.existsSync(/*turbopackIgnore: true*/ dirPath)) return [];
  const entries = fs.readdirSync(/*turbopackIgnore: true*/ dirPath, { withFileTypes: true });

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
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");
    const folderParam = searchParams.get("folder");
    const sortMode = searchParams.get("sort") || "custom";

    let targetDir = "";

    if (folderParam) {
      const candidateAbout = path.normalize(path.join(ABOUT_ROOT_DIR, folderParam));
      if (fs.existsSync(/*turbopackIgnore: true*/ candidateAbout)) {
        targetDir = candidateAbout;
      } else if (fs.existsSync(/*turbopackIgnore: true*/ folderParam)) {
        targetDir = folderParam;
      }
    }

    if (!targetDir && typeParam) {
      targetDir = SHOWCASE_DIRS[typeParam] || SHOWCASE_DIRS["noc"];
    }

    if (!targetDir) {
      targetDir = SHOWCASE_DIRS["noc"];
    }

    if (!fs.existsSync(/*turbopackIgnore: true*/ targetDir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ targetDir, { recursive: true });
    }

    let files = scanDirectoryRecursively(targetDir, targetDir);
    const tree = buildDirectoryTree(targetDir, targetDir);

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
      targetDir,
      folderName: path.basename(targetDir),
      tree,
      files,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to scan showcase directory",
        files: [],
        tree: [],
      },
      { status: 500 }
    );
  }
}
