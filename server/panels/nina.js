// NINA/BBK (protección civil alemana) — API abierta del gobierno, sin llave.
export const id = 'nina';
export const label = 'NINA — Alertas civiles (Alemania)';
export const needsKey = null;
export const ttlMs = 15 * 60 * 1000;

const URL = 'https://warnung.bund.de/api31/mowas/mapData.json';

export async function fetchData() {
  try {
    const res = await fetch(URL, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { error: `NINA respondió ${res.status}` };
    const data = await res.json();
    const items = (Array.isArray(data) ? data : [])
      .map((w) => ({
        id: w.id,
        title: w.i18nTitle?.es || w.i18nTitle?.en || w.i18nTitle?.de || 'Alerta',
        severity: w.severity,
        urgency: w.urgency,
        type: w.type,
        startDate: w.startDate,
      }))
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    return { items: items.slice(0, 20) };
  } catch (err) {
    return { error: err.message };
  }
}
