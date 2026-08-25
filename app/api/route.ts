import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "online",
      service: "GTS TMD Telecommunications API Hub",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    }
  );
}
