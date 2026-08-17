// Endpoint no oficial de Tzeva Adom (Pikud Ha'oref) — usado por varios proyectos
// hobby, no documentado, puede cambiar o romperse sin aviso.

export const id = 'redalert';
export const label = 'Alertas Tzeva Adom (Israel)';
export const needsKey = null;
export const ttlMs = 20 * 1000;

const HEADERS = {
  Referer: 'https://www.oref.org.il/',
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent': 'Mozilla/5.0 (compatible; Itaca/0.1; personal dashboard)',
};

const HISTORY_URL = 'https://www.oref.org.il/warningMessages/alert/History/AlertsHistory.json';
const ACTIVE_URL = 'https://www.oref.org.il/warningMessages/alert/alerts.json';

async function safeJson(url) {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`respondió ${res.status}`);
  const text = await res.text();
  if (!text.trim()) return null; // sin alertas activas, cuerpo vacío es normal
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function fetchData() {
  try {
    const [active, history] = await Promise.all([
      safeJson(ACTIVE_URL).catch(() => null),
      safeJson(HISTORY_URL).catch(() => null),
    ]);

    const activeItems = Array.isArray(active?.data)
      ? active.data.map((city) => ({ city, active: true, alertDate: null, category: active.title || 'Alerta' }))
      : [];

    const historyItems = Array.isArray(history)
      ? history.slice(0, 15).map((h) => ({
          city: h.data,
          active: false,
          alertDate: h.alertDate,
          category: h.category_desc || h.title,
        }))
      : [];

    return { items: activeItems, history: historyItems };
  } catch (err) {
    return { error: err.message };
  }
}
