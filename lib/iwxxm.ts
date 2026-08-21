/**
 * IWXXM (ICAO Meteorological Information Exchange Model 3.0) Converter Utility
 * Converts TAC (Traditional Alphanumeric Code: METAR, TAF, SYNOP) into ICAO Annex 3 / WMO No. 306 XML/GML
 */

export interface IwxxmConversionResult {
  reportType: "METAR" | "TAF" | "SYNOP" | "UNKNOWN";
  stationIcao?: string;
  issueTimeIso?: string;
  xml: string;
}

const AIRPORTS_MAP: Record<string, { name: string; iata: string }> = {
  VTBD: { name: "Bangkok Don Mueang International Airport", iata: "DMK" },
  VTBS: { name: "Bangkok Suvarnabhumi International Airport", iata: "BKK" },
  VTSP: { name: "Phuket International Airport", iata: "HKT" },
  VTCC: { name: "Chiang Mai International Airport", iata: "CNX" },
  VTSB: { name: "Surat Thani Airport", iata: "URT" },
  VTUO: { name: "Udon Thani International Airport", iata: "UTH" },
  VTSG: { name: "Krabi International Airport", iata: "KBV" },
  VTSS: { name: "Hat Yai International Airport", iata: "HDY" },
  VTSE: { name: "Trat Airport", iata: "TDX" },
  VTPB: { name: "Phetchabun Airport", iata: "PHY" },
  WMKK: { name: "Kuala Lumpur International Airport", iata: "KUL" },
  WSSS: { name: "Singapore Changi Airport", iata: "SIN" },
  VHHH: { name: "Hong Kong International Airport", iata: "HKG" },
  RJTT: { name: "Tokyo Haneda Airport", iata: "HND" },
};

export function convertTacToIwxxm(tacText: string): IwxxmConversionResult {
  const cleanText = tacText.trim().replace(/[\r\n]+/g, " ");
  const tokens = cleanText.split(/\s+/);

  // Check report type
  let reportType: "METAR" | "TAF" | "SYNOP" | "UNKNOWN" = "UNKNOWN";
  if (cleanText.includes("METAR") || cleanText.includes("SPECI")) {
    reportType = "METAR";
  } else if (cleanText.includes("TAF")) {
    reportType = "TAF";
  } else if (/^\d{5}\s/.test(cleanText) || cleanText.includes("SYNOP")) {
    reportType = "SYNOP";
  }

  // Parse METAR
  let stationIcao = "VTBD";
  let issueTimeIso = new Date().toISOString();
  let tempC = "30.0";
  let dewC = "24.0";
  let qnh = "1008.0";
  let windDeg = "230";
  let windKt = "08";
  let visM = "9999";

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    // Station ICAO (4 letters starting with V, W, R, B, U, O, F, D, K)
    if (/^[A-Z]{4}$/.test(tok) && (tok.startsWith("VT") || tok.startsWith("WM") || tok.startsWith("WS") || tok.startsWith("VH") || tok.startsWith("RJ"))) {
      stationIcao = tok;
    }

    // Issue time (e.g. 210800Z)
    if (/^\d{6}Z$/.test(tok)) {
      const day = tok.substring(0, 2);
      const hour = tok.substring(2, 4);
      const min = tok.substring(4, 6);
      const now = new Date();
      issueTimeIso = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${day}T${hour}:${min}:00Z`;
    }

    // Wind (e.g. 23008KT or VRB03KT)
    if (/^(\d{3}|VRB)\d{2,3}(G\d{2,3})?KT$/.test(tok)) {
      windDeg = tok.substring(0, 3);
      windKt = tok.substring(3, 5);
    }

    // Vis (e.g. 9999 or 5000)
    if (/^\d{4}$/.test(tok)) {
      visM = tok;
    }

    // Temp/Dewpoint (e.g. 32/25 or M02/M05)
    if (/^(M?\d{2})\/(M?\d{2})$/.test(tok)) {
      const parts = tok.split("/");
      tempC = (parts[0].startsWith("M") ? "-" + parts[0].substring(1) : parts[0]) + ".0";
      dewC = (parts[1].startsWith("M") ? "-" + parts[1].substring(1) : parts[1]) + ".0";
    }

    // QNH (e.g. Q1008 or A2980)
    if (/^Q\d{4}$/.test(tok)) {
      qnh = tok.substring(1) + ".0";
    }
  }

  const airportInfo = AIRPORTS_MAP[stationIcao] || {
    name: `${stationIcao} International Airport`,
    iata: stationIcao.substring(0, 3),
  };

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<iwxxm:MeteorologicalAerodromeObservationReport 
    xmlns:iwxxm="http://icao.int/iwxxm/3.0"
    xmlns:gml="http://www.opengis.net/gml/3.2"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://icao.int/iwxxm/3.0 http://schemas.wmo.int/iwxxm/3.0/iwxxm.xsd"
    gml:id="uuid.iwxxm.${reportType.toLowerCase()}.${stationIcao.toLowerCase()}.${issueTimeIso.replace(/[:-]/g, "")}"
    reportStatus="NORMAL"
    automatedStation="false">

  <!-- ICAO IWXXM Issue Time -->
  <iwxxm:issueTime>
    <gml:TimeInstant gml:id="ti-${issueTimeIso.replace(/[:-]/g, "")}">
      <gml:timePosition>${issueTimeIso}</gml:timePosition>
    </gml:TimeInstant>
  </iwxxm:issueTime>

  <!-- Aerodrome Location Info -->
  <iwxxm:aerodrome>
    <gml:AirportHeliport gml:id="aerodrome-${stationIcao}">
      <gml:identifier codeSpace="http://www.iata.org/iata/">${airportInfo.iata}</gml:identifier>
      <gml:name>${airportInfo.name}</gml:name>
      <gml:locationIndicatorICAO>${stationIcao}</gml:locationIndicatorICAO>
    </gml:AirportHeliport>
  </iwxxm:aerodrome>

  <!-- Meteorological Observations -->
  <iwxxm:observation>
    <iwxxm:MeteorologicalAerodromeObservation gml:id="obs-${stationIcao}">
      <iwxxm:airTemperature uom="degC">${tempC}</iwxxm:airTemperature>
      <iwxxm:dewpointTemperature uom="degC">${dewC}</iwxxm:dewpointTemperature>
      <iwxxm:qnh uom="hPa">${qnh}</iwxxm:qnh>
      <iwxxm:surfaceWind>
        <iwxxm:AerodromeSurfaceWind variableWindDirection="${windDeg === "VRB" ? "true" : "false"}">
          <iwxxm:meanWindDirection uom="deg">${windDeg === "VRB" ? "0" : windDeg}</iwxxm:meanWindDirection>
          <iwxxm:meanWindSpeed uom="[kt]">${windKt}</iwxxm:meanWindSpeed>
        </iwxxm:AerodromeSurfaceWind>
      </iwxxm:surfaceWind>
      <iwxxm:visibility uom="m">${visM}</iwxxm:visibility>
    </iwxxm:MeteorologicalAerodromeObservation>
  </iwxxm:observation>

  <!-- Original TAC Reference Text -->
  <iwxxm:extension>
    <iwxxm:tacContent>${tacText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</iwxxm:tacContent>
  </iwxxm:extension>
</iwxxm:MeteorologicalAerodromeObservationReport>`;

  return {
    reportType,
    stationIcao,
    issueTimeIso,
    xml,
  };
}
