import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "synoptic";
  const wmoId = searchParams.get("wmoId") || "48455";

  const weatherData = {
    status: "success",
    timestamp: new Date().toISOString(),
    networkStatus: "RTH_BANGKOK_ONLINE",
    wmoRegion: "RA II & V",
    query: { type, wmoId },
    data: {
      stationId: wmoId,
      name: wmoId === "48455" ? "Bangkok Metropolis" : "Regional Station",
      temperature: 31.5,
      humidity: 78,
      pressure: 1009.2,
      windSpeedKnots: 12,
      windDirection: "SSW",
      bulletinHeader: `AAXX 05074 ${wmoId} 11580 82012 10315 20248 39958 40092 58004=`,
    },
  };

  return NextResponse.json(weatherData);
}
