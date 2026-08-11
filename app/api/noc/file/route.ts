import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const NOC_DIR = "D:\\React\\gts-tmd\\Thailand NOC";

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".mkv": "video/x-matroska",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const relPath = searchParams.get("path") || "";
  const isDownload = searchParams.get("download") === "true";

  if (!relPath) {
    return new NextResponse("Missing file path", { status: 400 });
  }

  // Prevent directory traversal attacks
  const targetPath = path.normalize(path.join(NOC_DIR, relPath));
  if (!targetPath.toLowerCase().startsWith(NOC_DIR.toLowerCase())) {
    return new NextResponse("Forbidden path access", { status: 403 });
  }

  if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
    return new NextResponse("File not found", { status: 404 });
  }

  const stat = fs.statSync(targetPath);
  const ext = path.extname(targetPath).toLowerCase();
  const mimeType = MIME_TYPES[ext] || "application/octet-stream";
  const fileName = path.basename(targetPath);

  // Handle Range Requests for Video Streaming
  const rangeHeader = request.headers.get("range");

  if (rangeHeader && mimeType.startsWith("video/")) {
    const parts = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = end - start + 1;

    const fileStream = fs.createReadStream(targetPath, { start, end });
    const stream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(stream as any, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunksize),
        "Content-Type": mimeType,
      },
    });
  }

  // Regular File Response
  const fileBuffer = fs.readFileSync(targetPath);
  const headers = new Headers();
  headers.set("Content-Type", mimeType);
  headers.set("Content-Length", String(stat.size));

  if (isDownload) {
    headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
  } else {
    headers.set("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
  }

  return new NextResponse(fileBuffer, {
    status: 200,
    headers,
  });
}
