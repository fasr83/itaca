export const id = 'earthquakes';
export const label = 'Terremotos';
export const needsKey = null;
export const ttlMs = 5 * 60 * 1000;

const URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson';

export async function fetchData() {
  try {
    const res = await fetch(URL, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { error: `USGS respondió ${res.status}` };
    const geo = await res.json();
    const items = (geo.features || []).map((f) => ({
      id: f.id,
      mag: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      url: f.properties.url,
      tsunami: Boolean(f.properties.tsunami),
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      depth: f.geometry.coordinates[2],
    }));
    items.sort((a, b) => b.time - a.time);
    return { items: items.slice(0, 20) };
  } catch (err) {
    return { error: err.message };
  }
}
