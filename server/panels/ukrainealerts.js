// Alerts.in.ua requiere un token gratuito — se pide por Telegram: https://t.me/alerts_in_ua_api_bot

export const id = 'ukrainealerts';
export const label = 'Alertas aéreas — Ucrania';
export const needsKey = 'ALERTS_IN_UA_TOKEN';
export const setupUrl = 'https://alerts.in.ua/';
export const ttlMs = 60 * 1000;

export async function fetchData() {
  const token = process.env.ALERTS_IN_UA_TOKEN;
  if (!token) return { error: 'Falta ALERTS_IN_UA_TOKEN en .env' };

  const url = `https://api.alerts.in.ua/v1/alerts/active.json?token=${encodeURIComponent(token)}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { error: `Alerts.in.ua respondió ${res.status}` };
    const data = await res.json();
    const items = (data.alerts || []).map((a) => ({
      id: a.id,
      location: a.location_title,
      type: a.alert_type,
      startedAt: a.started_at,
    }));
    return { items };
  } catch (err) {
    return { error: err.message };
  }
}
