import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const NOC_DIR = "D:\\React\\gts-tmd\\Thailand NOC";

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

    const targetDir = subfolder
      ? path.join(NOC_DIR, subfolder)
      : NOC_DIR;

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const orderFile = path.join(targetDir, "sort_order.json");
    fs.writeFileSync(orderFile, JSON.stringify(orderedFileNames, null, 2), "utf-8");

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
