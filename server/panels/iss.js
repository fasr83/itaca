export const id = 'iss';
export const label = 'Estación Espacial Internacional';
export const needsKey = null;
export const ttlMs = 15 * 1000;

const URL = 'https://api.wheretheiss.at/v1/satellites/25544';

export async function fetchData() {
  try {
    const res = await fetch(URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { error: `wheretheiss.at respondió ${res.status}` };
    const d = await res.json();
    return {
      items: [
        {
          lat: d.latitude,
          lon: d.longitude,
          altitudeKm: d.altitude,
          velocityKmh: d.velocity,
          visibility: d.visibility,
        },
      ],
    };
  } catch (err) {
    return { error: err.message };
  }
}
