import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DOC_DIR = path.join(process.cwd(), "doc");

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "_").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, url, subfolder } = body;

    if (!title || !url) {
      return NextResponse.json(
        { status: "error", message: "กรุณาระบุชื่อวิดีโอและลิงก์ YouTube" },
        { status: 400 }
      );
    }

    const targetDir = subfolder
      ? path.join(DOC_DIR, subfolder)
      : DOC_DIR;

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const cleanTitle = sanitizeFilename(title);
    const fileName = `${cleanTitle}.url`;
    const filePath = path.join(targetDir, fileName);

    const fileContent = `[InternetShortcut]\nURL=${url.trim()}\n`;
    fs.writeFileSync(filePath, fileContent, "utf-8");

    return NextResponse.json({
      status: "success",
      message: `บันทึกลิงก์ YouTube ${fileName} เรียบร้อยแล้ว`,
      filePath,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to save YouTube link" },
      { status: 500 }
    );
  }
}
