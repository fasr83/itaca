// ACLED requiere una API key + email registrados en acleddata.com/register
// (gratis para uso académico/personal, aprobación manual). Doc: https://apidocs.acleddata.com/

export const id = 'acled';
export const label = 'ACLED — Conflictos armados';
export const needsKey = 'ACLED_API_KEY';
export const setupUrl = 'https://acleddata.com/register/';
export const ttlMs = 60 * 60 * 1000; // ACLED se actualiza semanalmente, no hace falta más

export async function fetchData() {
  const key = process.env.ACLED_API_KEY;
  const email = process.env.ACLED_EMAIL;
  if (!key || !email) return { error: 'Falta ACLED_API_KEY / ACLED_EMAIL en .env' };

  const url = `https://api.acleddata.com/acled/read?key=${encodeURIComponent(key)}&email=${encodeURIComponent(email)}&limit=20&order_by=event_date`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return { error: `ACLED respondió ${res.status}` };
    const data = await res.json();
    if (!Array.isArray(data.data)) return { error: data.error?.[0]?.message || 'Respuesta inesperada de ACLED' };
    const items = data.data.map((e) => ({
      id: e.event_id_cnty,
      date: e.event_date,
      type: e.event_type,
      country: e.country,
      location: e.location,
      fatalities: Number(e.fatalities || 0),
      notes: e.notes,
    }));
    return { items };
  } catch (err) {
    return { error: err.message };
  }
}
