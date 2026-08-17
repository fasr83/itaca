export const id = 'gdacs';
export const label = 'GDACS — Desastres globales';
export const needsKey = null;
export const ttlMs = 30 * 60 * 1000;

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

export async function fetchData() {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  const url = `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?fromDate=${isoDate(from)}&toDate=${isoDate(to)}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return { error: `GDACS respondió ${res.status}` };
    const geo = await res.json();
    const items = (geo.features || [])
      .map((f) => ({
        id: f.properties.eventid,
        type: f.properties.eventtype,
        name: f.properties.name,
        alertLevel: f.properties.alertlevel,
        country: f.properties.country,
        date: f.properties.fromdate,
        lat: f.geometry?.coordinates?.[1],
        lon: f.geometry?.coordinates?.[0],
        url: f.properties.url?.report,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return { items: items.slice(0, 20) };
  } catch (err) {
    return { error: err.message };
  }
}
