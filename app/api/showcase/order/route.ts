import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { SHOWCASE_DIRS, ABOUT_ROOT_DIR, resolveTargetDir } from "../route";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, folder, orderedFileNames, subfolder } = body;

    const baseDir = resolveTargetDir(folder, type);

    if (!Array.isArray(orderedFileNames)) {
      return NextResponse.json(
        { status: "error", message: "กรุณาระบุรายการสั่งจัดลำดับไฟล์" },
        { status: 400 }
      );
    }

    const targetDir = subfolder
      ? path.join(baseDir, subfolder)
      : baseDir;

    if (!fs.existsSync(/*turbopackIgnore: true*/ targetDir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ targetDir, { recursive: true });
    }

    const orderFile = path.join(targetDir, "sort_order.json");
    fs.writeFileSync(/*turbopackIgnore: true*/ orderFile, JSON.stringify(orderedFileNames, null, 2), "utf-8");

    return NextResponse.json({
      status: "success",
      message: "บันทึกการจัดลำดับเรียบร้อยแล้ว",
      orderedFileNames,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to save file order" },
      { status: 500 }
    );
  }
}
