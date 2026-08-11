import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const LOGO_FILENAME = "custom-logo.png";
const LOGO_PATH = path.join(PUBLIC_DIR, LOGO_FILENAME);

export async function GET() {
  try {
    const exists = fs.existsSync(/*turbopackIgnore: true*/ LOGO_PATH);
    if (exists) {
      const stat = fs.statSync(/*turbopackIgnore: true*/ LOGO_PATH);
      return NextResponse.json({
        hasCustomLogo: true,
        logoUrl: `/custom-logo.png?v=${stat.mtimeMs}`,
      });
    }
  } catch (e) {
    // ignore
  }
  return NextResponse.json({
    hasCustomLogo: false,
    logoUrl: null,
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ status: "error", message: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!fs.existsSync(/*turbopackIgnore: true*/ PUBLIC_DIR)) {
      fs.mkdirSync(/*turbopackIgnore: true*/ PUBLIC_DIR, { recursive: true });
    }

    fs.writeFileSync(/*turbopackIgnore: true*/ LOGO_PATH, buffer);

    const stat = fs.statSync(/*turbopackIgnore: true*/ LOGO_PATH);

    return NextResponse.json({
      status: "success",
      message: "Logo updated successfully",
      logoUrl: `/custom-logo.png?v=${stat.mtimeMs}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to upload logo" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ LOGO_PATH)) {
      fs.unlinkSync(/*turbopackIgnore: true*/ LOGO_PATH);
    }
    return NextResponse.json({
      status: "success",
      message: "Logo reset to default",
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to reset logo" },
      { status: 500 }
    );
  }
}
