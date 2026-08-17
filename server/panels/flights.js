// OpenSky Network: API pública y gratuita, sin registro para uso anónimo
// (rate limit bajo — por eso el TTL es largo). Sustituye a Wingbits/ADS-B
// Exchange, que piden cuenta/llave paga; esto da lo mismo (tráfico aéreo real)
// sin esa traba.

export const id = 'flights';
export const label = 'Tráfico aéreo';
export const needsKey = null;
export const ttlMs = 60 * 1000;

// Caja por defecto: Europa occidental (tráfico denso, buen demo).
// Personalizar con FLIGHTS_BBOX="latmin,lonmin,latmax,lonmax" en .env.
function getBbox() {
  const raw = process.env.FLIGHTS_BBOX;
  if (raw) {
    const [lamin, lomin, lamax, lomax] = raw.split(',').map(Number);
    if ([lamin, lomin, lamax, lomax].every((n) => !Number.isNaN(n))) return { lamin, lomin, lamax, lomax };
  }
  return { lamin: 36, lomin: -10, lamax: 60, lomax: 20 };
}

export async function fetchData() {
  const { lamin, lomin, lamax, lomax } = getBbox();
  const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { error: `OpenSky respondió ${res.status}` };
    const data = await res.json();
    const items = (data.states || [])
      .filter((s) => s[5] != null && s[6] != null && !s[8]) // con posición, no en tierra
      .slice(0, 150)
      .map((s) => ({
        icao24: s[0],
        callsign: (s[1] || '').trim(),
        country: s[2],
        lon: s[5],
        lat: s[6],
        altitude: s[7],
        velocity: s[9],
        heading: s[10],
      }));
    return { items, bbox: { lamin, lomin, lamax, lomax } };
  } catch (err) {
    return { error: err.message };
  }
}
