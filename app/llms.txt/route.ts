import { NextResponse } from "next/server";

const LLMS_TXT_CONTENT = `# RTH Bangkok - GTS Thailand Telecommunications Hub

> Regional Telecommunications Hub (RTH Bangkok) / GTS Thailand, Meteorological Department of Thailand. Providing weather bulletins, GTS data services, and meteorological communications across Southeast Asia.

## Main Services & Information

- [Homepage](https://gts.tmd.go.th/): Regional Telecommunications Hub Bangkok overview and services.
- [GTS Weather Bulletins](https://gts.tmd.go.th/services): Access Surface Synoptic (SM/SI), UpperAir, Warning bulletins, and METAR aviation reports.
- [Related Documents](https://gts.tmd.go.th/documents): Official meteorological documents, guidelines, and manuals.
- [About Us & Operations](https://gts.tmd.go.th/about): Information on RTH Bangkok history, mission, and infrastructure.
- [Contact Us](https://gts.tmd.go.th/contact): Get in touch with RTH Bangkok GTS Operations team.

## Data Categories

- [Synoptic Bulletins](https://gts.tmd.go.th/services?tab=synoptic): Surface weather observations (SM/SI headers).
- [UpperAir Wind Data](https://gts.tmd.go.th/services?tab=upperair): Upper air soundings and wind data.
- [Warning Advisories](https://gts.tmd.go.th/services?tab=warning): Severe weather advisories and tropical storm warnings.
- [METAR Aviation Data](https://gts.tmd.go.th/services?tab=metar): Aerodrome routine meteorological reports.
- [Raw GTS Notes](https://gts.tmd.go.th/services?tab=notes): Raw WMO GTS formatted meteorological text messages.
`;

export async function GET() {
  return new NextResponse(LLMS_TXT_CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
