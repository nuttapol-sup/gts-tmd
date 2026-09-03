import { NextResponse } from "next/server";
import { parseSynopBulletin } from "@/lib/synop-decoder";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawText = body.rawText || body.text || "";

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          status: "error",
          message: "กรุณาระบุข้อความข่าว Synoptic TAC (rawText) ใน Request Body",
        },
        { status: 400 }
      );
    }

    // Extract Header line if present (e.g. SMLA01 VLIV 030000)
    const lines = rawText.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    let headerLine = "";
    let countryCode = "";
    let utcTime = "";

    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length >= 3 && /^[A-Z0-9]{4,6}$/i.test(parts[0]) && /^\d{6}$/.test(parts[2])) {
        headerLine = line;
        countryCode = parts[1];
        utcTime = parts[2];
        break;
      }
    }

    // Decode all WMO stations in the raw TAC text
    const stations = parseSynopBulletin(rawText);

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      headerLine: headerLine || "N/A",
      countryCode: countryCode || "N/A",
      utcTime: utcTime || "N/A",
      totalStations: stations.length,
      stations,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to decode Synoptic TAC data",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawText = searchParams.get("rawText") || searchParams.get("text") || "";

  if (!rawText.trim()) {
    return NextResponse.json({
      status: "info",
      message: "Synoptic TAC Decode API - ส่งข้อมูลแบบ POST { \"rawText\": \"...\" } เพื่อถอดรหัสข่าวเป็น JSON",
      usageExample: {
        method: "POST",
        url: "/api/decode/synop",
        headers: { "Content-Type": "application/json" },
        body: {
          rawText: "SMLA01 VLIV 030000\\nAAXX 03001\\n48921 31457 53602 10200 20192 38579 48082 5//// 710// 86200\\n 333 20190 59001="
        }
      }
    });
  }

  const stations = parseSynopBulletin(rawText);
  return NextResponse.json({
    status: "success",
    timestamp: new Date().toISOString(),
    totalStations: stations.length,
    stations,
  });
}
