import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DOC_DIR = process.env.DOC_DIR || path.join(process.cwd(), "doc");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderedFileNames, subfolder } = body;

    if (!Array.isArray(orderedFileNames)) {
      return NextResponse.json(
        { status: "error", message: "กรุณาระบุรายการสั่งจัดลำดับไฟล์" },
        { status: 400 }
      );
    }

    const targetDir = subfolder && subfolder !== "Root"
      ? path.join(DOC_DIR, subfolder)
      : DOC_DIR;

    if (!fs.existsSync(/*turbopackIgnore: true*/ targetDir)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ targetDir, { recursive: true });
    }

    const orderFile = path.join(targetDir, "sort_order.json");
    fs.writeFileSync(/*turbopackIgnore: true*/ orderFile, JSON.stringify(orderedFileNames, null, 2), "utf-8");

    return NextResponse.json({
      status: "success",
      message: "บันทึกการจัดลำดับเอกสารเรียบร้อยแล้ว",
      orderedFileNames,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to save document order" },
      { status: 500 }
    );
  }
}
