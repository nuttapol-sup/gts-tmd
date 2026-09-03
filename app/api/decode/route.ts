import { NextResponse } from "next/server";
import { decodeGtsBulletin } from "@/lib/gts-decoder";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawText = body.rawText || body.text || "";
    const categoryParam = body.category || body.type || undefined;

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          status: "error",
          message: "กรุณาระบุข้อความข่าว GTS (rawText) ใน Request Body",
        },
        { status: 400 }
      );
    }

    const decoded = decodeGtsBulletin(rawText, categoryParam);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...decoded,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to decode GTS bulletin",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawText = searchParams.get("rawText") || searchParams.get("text") || "";
  const categoryParam = searchParams.get("category") || searchParams.get("type") || undefined;

  if (!rawText.trim()) {
    return NextResponse.json({
      status: "info",
      message: "GTS Unified Decode API - รองรับการถอดรหัสข่าว 4 หมวดหมู่หลัก (synoptic, metar, warning, notes)",
      supportedCategories: [
        { key: "synoptic", label: "ข่าว Synoptic (Surface observation AAXX/BBXX)" },
        { key: "metar", label: "ข้อมูลข่าว Metar (อากาศการบิน METAR/SPECI)" },
        { key: "warning", label: "ข้อมูลข่าวเตือนภัย (Warning / SIGMET / Tropical Cyclone)" },
        { key: "notes", label: "Note ท้ายข่าว (Raw GTS Administrative Notes)" }
      ],
      usageExample: {
        method: "POST",
        url: "/api/decode",
        headers: { "Content-Type": "application/json" },
        body: {
          category: "synoptic",
          rawText: "SMLA01 VLIV 030000\\nAAXX 03001\\n48921 31457 53602 10200 20192 38579 48082 5//// 710// 86200\\n 333 20190 59001="
        }
      }
    });
  }

  const decoded = decodeGtsBulletin(rawText, categoryParam);
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ...decoded,
  });
}
