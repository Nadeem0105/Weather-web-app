/**
 * Calculates the US EPA Air Quality Index (AQI) from raw pollutant concentrations.
 * The standard US EPA AQI is a unitless index from 0 to 500+ and represents the maximum of 6 pollutant sub-indices.
 */

// Helper to interpolate AQI between breakpoints
function interpolate(c: number, cLow: number, cHigh: number, iLow: number, iHigh: number): number {
  return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (c - cLow) + iLow);
}

// 1. PM2.5 (24-hour average in µg/m³)
export function calculatePM25AQI(pm25: number): number {
  if (pm25 < 0) return 0;
  if (pm25 <= 12.0) return interpolate(pm25, 0.0, 12.0, 0, 50);
  if (pm25 <= 35.4) return interpolate(pm25, 12.1, 35.4, 51, 100);
  if (pm25 <= 55.4) return interpolate(pm25, 35.5, 55.4, 101, 150);
  if (pm25 <= 150.4) return interpolate(pm25, 55.5, 150.4, 151, 200);
  if (pm25 <= 250.4) return interpolate(pm25, 150.5, 250.4, 201, 300);
  if (pm25 <= 350.4) return interpolate(pm25, 250.5, 350.4, 301, 400);
  if (pm25 <= 500.0) return interpolate(pm25, 350.5, 500.0, 401, 500);
  return 500;
}

// 2. PM10 (24-hour average in µg/m³)
export function calculatePM10AQI(pm10: number): number {
  if (pm10 < 0) return 0;
  if (pm10 <= 54) return interpolate(pm10, 0, 54, 0, 50);
  if (pm10 <= 154) return interpolate(pm10, 55, 154, 51, 100);
  if (pm10 <= 254) return interpolate(pm10, 155, 254, 101, 150);
  if (pm10 <= 354) return interpolate(pm10, 255, 354, 151, 200);
  if (pm10 <= 424) return interpolate(pm10, 355, 424, 201, 300);
  if (pm10 <= 504) return interpolate(pm10, 425, 504, 301, 400);
  if (pm10 <= 604) return interpolate(pm10, 505, 604, 401, 500);
  return 500;
}

// 3. O3 (8-hour average, converted from µg/m³ to ppb, conversion factor ~1.96 at standard temperature/pressure)
export function calculateO3AQI(o3Val: number): number {
  const ppb = o3Val / 1.96;
  if (ppb < 0) return 0;
  if (ppb <= 54) return interpolate(ppb, 0, 54, 0, 50);
  if (ppb <= 70) return interpolate(ppb, 55, 70, 51, 100);
  if (ppb <= 85) return interpolate(ppb, 71, 85, 101, 150);
  if (ppb <= 105) return interpolate(ppb, 86, 105, 151, 200);
  if (ppb <= 200) return interpolate(ppb, 106, 200, 201, 300);
  return 300; // O3 8-hour AQI is usually capped at 300
}

// 4. NO2 (1-hour average, converted from µg/m³ to ppb, conversion factor ~1.88)
export function calculateNO2AQI(no2Val: number): number {
  const ppb = no2Val / 1.88;
  if (ppb < 0) return 0;
  if (ppb <= 53) return interpolate(ppb, 0, 53, 0, 50);
  if (ppb <= 100) return interpolate(ppb, 54, 100, 51, 100);
  if (ppb <= 360) return interpolate(ppb, 101, 360, 101, 150);
  if (ppb <= 649) return interpolate(ppb, 361, 649, 151, 200);
  if (ppb <= 1249) return interpolate(ppb, 650, 1249, 201, 300);
  return 300;
}

// 5. SO2 (1-hour average, converted from µg/m³ to ppb, conversion factor ~2.62)
export function calculateSO2AQI(so2Val: number): number {
  const ppb = so2Val / 2.62;
  if (ppb < 0) return 0;
  if (ppb <= 35) return interpolate(ppb, 0, 35, 0, 50);
  if (ppb <= 75) return interpolate(ppb, 36, 75, 51, 100);
  if (ppb <= 185) return interpolate(ppb, 76, 185, 101, 150);
  if (ppb <= 304) return interpolate(ppb, 186, 304, 151, 200);
  if (ppb <= 604) return interpolate(ppb, 305, 604, 201, 300);
  return 300;
}

// 6. CO (8-hour average, converted from µg/m³ to ppm, conversion factor ~1150)
export function calculateCOAQI(coVal: number): number {
  const ppm = coVal / 1150;
  if (ppm < 0) return 0;
  if (ppm <= 4.4) return interpolate(ppm, 0, 4.4, 0, 50);
  if (ppm <= 9.4) return interpolate(ppm, 4.5, 9.4, 51, 100);
  if (ppm <= 12.4) return interpolate(ppm, 9.5, 12.4, 101, 150);
  if (ppm <= 15.4) return interpolate(ppm, 12.5, 15.4, 151, 200);
  if (ppm <= 30.4) return interpolate(ppm, 15.5, 30.4, 201, 300);
  return 300;
}

/**
 * Calculates the final overall US EPA Air Quality Index value.
 */
export function calculateEPAAQI(breakdown?: {
  pm2_5?: number;
  pm10?: number;
  co?: number;
  no2?: number;
  so2?: number;
  o3?: number;
}): number {
  if (!breakdown) return 0;
  
  const indices = [
    calculatePM25AQI(breakdown.pm2_5 ?? 0),
    calculatePM10AQI(breakdown.pm10 ?? 0),
    calculateCOAQI(breakdown.co ?? 0),
    calculateNO2AQI(breakdown.no2 ?? 0),
    calculateSO2AQI(breakdown.so2 ?? 0),
    calculateO3AQI(breakdown.o3 ?? 0)
  ];

  return Math.max(...indices);
}
