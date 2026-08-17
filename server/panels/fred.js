// FRED (Federal Reserve Economic Data) — key gratuita en
// https://fred.stlouisfed.org/docs/api/api_key.html

export const id = 'fred';
export const label = 'Indicadores Económicos (FRED, EE.UU.)';
export const needsKey = 'FRED_API_KEY';
export const setupUrl = 'https://fred.stlouisfed.org/docs/api/api_key.html';
export const ttlMs = 6 * 60 * 60 * 1000; // series macro, no cambian seguido

const SERIES = [
  { id: 'GDP', label: 'PIB (miles de millones $)' },
  { id: 'UNRATE', label: 'Desempleo (%)' },
  { id: 'CPIAUCSL', label: 'IPC (índice)' },
  { id: 'FEDFUNDS', label: 'Tasa de la Fed (%)' },
  { id: 'DGS10', label: 'Bono del Tesoro a 10 años (%)' },
];

async function fetchSeries(key, series) {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=${key}&file_type=json&sort_order=desc&limit=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`respondió ${res.status}`);
  const data = await res.json();
  const obs = data.observations?.[0];
  if (!obs) throw new Error('sin datos');
  return { id: series.id, label: series.label, value: obs.value, date: obs.date };
}

export async function fetchData() {
  const key = process.env.FRED_API_KEY;
  if (!key) return { error: 'Falta FRED_API_KEY en .env' };

  const results = await Promise.allSettled(SERIES.map((s) => fetchSeries(key, s)));
  const items = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  if (items.length === 0) return { error: 'No se pudo consultar FRED (¿key válida?)' };
  return { items };
}
