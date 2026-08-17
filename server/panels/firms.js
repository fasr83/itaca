// NASA FIRMS requiere una MAP_KEY gratuita: https://firms.modaps.eosdis.nasa.gov/api/map_key/

export const id = 'firms';
export const label = 'NASA FIRMS — Incendios activos';
export const needsKey = 'NASA_FIRMS_KEY';
export const setupUrl = 'https://firms.modaps.eosdis.nasa.gov/api/map_key/';
export const ttlMs = 30 * 60 * 1000;

const SOURCE = 'VIIRS_SNPP_NRT';
const AREA = process.env.FIRMS_AREA || 'world';
const DAY_RANGE = 1;

function parseCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const cols = line.split(',');
    return Object.fromEntries(headers.map((h, i) => [h, cols[i]]));
  });
}

export async function fetchData() {
  const key = process.env.NASA_FIRMS_KEY;
  if (!key) return { error: 'Falta NASA_FIRMS_KEY en .env' };

  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/${SOURCE}/${AREA}/${DAY_RANGE}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return { error: `FIRMS respondió ${res.status}` };
    const text = await res.text();
    if (text.toLowerCase().includes('invalid')) return { error: 'MAP_KEY inválida o vencida' };
    const rows = parseCsv(text);
    const items = rows.slice(0, 100).map((r) => ({
      lat: Number(r.latitude),
      lon: Number(r.longitude),
      brightness: Number(r.bright_ti4 || r.brightness),
      confidence: r.confidence,
      date: r.acq_date,
      time: r.acq_time,
    }));
    return { items, count: rows.length };
  } catch (err) {
    return { error: err.message };
  }
}
