// NWS (National Weather Service, EE.UU.) — API abierta, sin llave, pero pide
// un User-Agent identificable (no un token real, solo buenas prácticas).
export const id = 'nws';
export const label = 'Alertas de Emergencia (EE.UU. — NWS)';
export const needsKey = null;
export const ttlMs = 5 * 60 * 1000;

const URL = 'https://api.weather.gov/alerts/active?severity=Severe,Extreme';

export async function fetchData() {
  try {
    const res = await fetch(URL, {
      headers: { 'User-Agent': 'itaca-personal-dashboard (personal use)' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { error: `NWS respondió ${res.status}` };
    const data = await res.json();
    const items = (data.features || []).slice(0, 20).map((f) => ({
      id: f.id,
      event: f.properties.event,
      area: f.properties.areaDesc,
      severity: f.properties.severity,
      headline: f.properties.headline,
      sent: f.properties.sent,
    }));
    return { items };
  } catch (err) {
    return { error: err.message };
  }
}
