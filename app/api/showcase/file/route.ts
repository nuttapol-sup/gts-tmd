import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SHOWCASE_DIRS, ABOUT_ROOT_DIR, resolveTargetDir } from "../route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");
    const folderParam = searchParams.get("folder");
    const relPath = searchParams.get("path");
    const download = searchParams.get("download") === "true";

    if (!relPath) {
      return NextResponse.json({ status: "error", message: "Path is required" }, { status: 400 });
    }

    const baseDir = resolveTargetDir(folderParam, typeParam);

    const fullPath = path.normalize(path.join(baseDir, relPath));

    if (!fullPath.startsWith(path.normalize(baseDir))) {
      return NextResponse.json({ status: "error", message: "Access denied" }, { status: 403 });
    }

    if (!fs.existsSync(/*turbopackIgnore: true*/ fullPath) || !fs.statSync(/*turbopackIgnore: true*/ fullPath).isFile()) {
      return NextResponse.json({ status: "error", message: "File not found" }, { status: 404 });
    }

    const stat = fs.statSync(/*turbopackIgnore: true*/ fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const fileName = path.basename(fullPath);

    let contentType = "application/octet-stream";
    if (ext === ".pdf") contentType = "application/pdf";
    else if ([".jpg", ".jpeg"].includes(ext)) contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".mp4") contentType = "video/mp4";
    else if (ext === ".webm") contentType = "video/webm";
    else if (ext === ".txt") contentType = "text/plain; charset=utf-8";

    const fileStream = fs.createReadStream(fullPath);

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
    };

    if (download) {
      headers["Content-Disposition"] = `attachment; filename="${encodeURIComponent(fileName)}"`;
    } else {
      headers["Content-Disposition"] = `inline; filename="${encodeURIComponent(fileName)}"`;
    }

    // @ts-ignore
    return new NextResponse(fileStream, { headers });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to serve file" },
      { status: 500 }
    );
  }
}
