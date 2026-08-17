// Base de datos abierta de aeropuertos (ICAO -> nombre/coordenadas), pública
// y gratuita: https://github.com/mwgg/Airports. Se cachea en memoria porque
// son ~9MB y los aeropuertos no cambian de un día para otro.

const URL = 'https://raw.githubusercontent.com/mwgg/Airports/master/airports.json';

let cache = null;
let fetchedAt = 0;
const TTL_MS = 24 * 60 * 60 * 1000;

export async function getAirports() {
  if (cache && Date.now() - fetchedAt < TTL_MS) return cache;
  const res = await fetch(URL, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`airports dataset respondió ${res.status}`);
  cache = await res.json();
  fetchedAt = Date.now();
  return cache;
}
