import { getAirports } from './airports.js';
import { cacheGet, cacheSet } from './cache.js';

const STATES_CACHE_KEY = 'opensky:states:global';
const STATES_TTL_MS = 15 * 1000;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchGlobalStates() {
  const cached = cacheGet(STATES_CACHE_KEY);
  if (cached) return cached;
  const res = await fetch('https://opensky-network.org/api/states/all', {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`OpenSky respondió ${res.status}`);
  const data = await res.json();
  const states = data.states || [];
  cacheSet(STATES_CACHE_KEY, states, STATES_TTL_MS);
  return states;
}

async function fetchRoute(callsign) {
  try {
    const res = await fetch(`https://opensky-network.org/api/routes?callsign=${encodeURIComponent(callsign)}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data.route) || data.route.length < 2) return null;
    return { originIcao: data.route[0], destIcao: data.route[1] };
  } catch {
    return null;
  }
}

function airportInfo(airports, icao) {
  const a = airports[icao];
  if (!a) return null;
  return { icao, name: a.name, city: a.city, country: a.country, lat: a.lat, lon: a.lon };
}

export async function searchFlight(rawCallsign) {
  const callsign = rawCallsign.trim().toUpperCase();
  if (!callsign) return { error: 'Falta el número de vuelo' };

  const [states, route, airports] = await Promise.all([
    fetchGlobalStates().catch(() => []),
    fetchRoute(callsign),
    getAirports().catch(() => ({})),
  ]);

  const state = states.find((s) => (s[1] || '').trim().toUpperCase() === callsign);

  const live = state
    ? {
        icao24: state[0],
        country: state[2],
        lon: state[5],
        lat: state[6],
        altitude: state[7],
        onGround: state[8],
        velocity: state[9],
        heading: state[10],
      }
    : null;

  const origin = route ? airportInfo(airports, route.originIcao) : null;
  const destination = route ? airportInfo(airports, route.destIcao) : null;

  let distances = null;
  if (origin && destination) {
    const totalKm = haversineKm(origin.lat, origin.lon, destination.lat, destination.lon);
    let traveledKm = null;
    let remainingKm = null;
    if (live && live.lat != null && live.lon != null) {
      traveledKm = haversineKm(origin.lat, origin.lon, live.lat, live.lon);
      remainingKm = haversineKm(live.lat, live.lon, destination.lat, destination.lon);
    }
    distances = {
      totalKm: Math.round(totalKm),
      traveledKm: traveledKm != null ? Math.round(traveledKm) : null,
      remainingKm: remainingKm != null ? Math.round(remainingKm) : null,
      progressPct: traveledKm != null ? Math.min(100, Math.round((traveledKm / totalKm) * 100)) : null,
    };
  }

  if (!live && !origin) {
    return {
      error:
        'No se encontró ese vuelo — puede que no esté en el aire ahora mismo, o que no haya datos de ruta disponibles (la base de OpenSky es comunitaria y no cubre todos los vuelos).',
    };
  }

  return { callsign, live, origin, destination, distances };
}
