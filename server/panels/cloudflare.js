// Cloudflare Radar requiere un API token gratuito (permiso "Radar Read") desde
// https://dash.cloudflare.com/profile/api-tokens

export const id = 'cloudflare';
export const label = 'Cloudflare Radar — Cortes de Internet';
export const needsKey = 'CLOUDFLARE_RADAR_TOKEN';
export const setupUrl = 'https://dash.cloudflare.com/profile/api-tokens';
export const ttlMs = 30 * 60 * 1000;

const URL = 'https://api.cloudflare.com/client/v4/radar/annotations/outages?dateRange=7d&limit=15';

export async function fetchData() {
  const token = process.env.CLOUDFLARE_RADAR_TOKEN;
  if (!token) return { error: 'Falta CLOUDFLARE_RADAR_TOKEN en .env' };

  try {
    const res = await fetch(URL, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { error: `Cloudflare Radar respondió ${res.status}` };
    const data = await res.json();
    if (!data.success) return { error: data.errors?.[0]?.message || 'Respuesta inesperada de Cloudflare' };
    const items = (data.result?.annotations || []).map((a) => ({
      id: a.id,
      description: a.description,
      startDate: a.startDate,
      endDate: a.endDate,
      locations: (a.locations || []).map((l) => l.name).filter(Boolean),
    }));
    return { items };
  } catch (err) {
    return { error: err.message };
  }
}
