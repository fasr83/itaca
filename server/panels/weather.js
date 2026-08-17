export const id = 'weather';
export const label = 'Clima';
export const needsKey = null;
export const ttlMs = 15 * 60 * 1000;

// Sin ubicación del usuario configurada, se muestra un panorama de ciudades
// variadas — sirve también como reloj mundial (Open-Meteo ya devuelve la
// hora local de cada una). Personalizar: cambiar esta lista.
const CITIES = [
  { name: 'Ciudad de México', lat: 19.4326, lon: -99.1332 },
  { name: 'Nueva York', lat: 40.7128, lon: -74.006 },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { name: 'Londres', lat: 51.5072, lon: -0.1276 },
  { name: 'Dubái', lat: 25.2048, lon: 55.2708 },
  { name: 'Tokio', lat: 35.6762, lon: 139.6503 },
  { name: 'Sídney', lat: -33.8688, lon: 151.2093 },
];

const WEATHER_CODE_LABEL = {
  0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Niebla', 48: 'Niebla helada',
  51: 'Llovizna leve', 53: 'Llovizna', 55: 'Llovizna intensa',
  61: 'Lluvia leve', 63: 'Lluvia', 65: 'Lluvia intensa',
  71: 'Nieve leve', 73: 'Nieve', 75: 'Nieve intensa',
  80: 'Chubascos', 81: 'Chubascos fuertes', 82: 'Chubascos violentos',
  95: 'Tormenta eléctrica', 96: 'Tormenta con granizo',
};

async function fetchCity(city) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
  const data = await res.json();
  const code = data.current.weather_code;
  return {
    name: city.name,
    tempC: data.current.temperature_2m,
    windKmh: data.current.wind_speed_10m,
    condition: WEATHER_CODE_LABEL[code] || `Código ${code}`,
    localTime: data.current.time, // ISO local (timezone=auto ya resuelve el huso)
    lat: city.lat,
    lon: city.lon,
  };
}

export async function fetchData() {
  const results = await Promise.allSettled(CITIES.map(fetchCity));
  const items = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  if (items.length === 0) return { error: 'No se pudo consultar Open-Meteo' };
  return { items };
}
