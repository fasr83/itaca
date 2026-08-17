// aisstream.io — key gratuita en https://aisstream.io/authenticate
// A diferencia de los otros paneles, esto no es un fetch por request: hay que
// mantener una conexión WebSocket abierta y acumular los reportes de posición
// en memoria, porque el proveedor solo empuja datos, no los sirve bajo pedido.

export const id = 'maritime';
export const label = 'Tráfico Marítimo (AIS)';
export const needsKey = 'AISSTREAM_API_KEY';
export const setupUrl = 'https://aisstream.io/authenticate';
export const ttlMs = 30 * 1000;

// Caja por defecto: Mediterráneo + Canal de la Mancha (tráfico denso).
// Personalizar con MARITIME_BBOX="latmin,lonmin,latmax,lonmax" en .env.
function getBbox() {
  const raw = process.env.MARITIME_BBOX;
  if (raw) {
    const [latMin, lonMin, latMax, lonMax] = raw.split(',').map(Number);
    if ([latMin, lonMin, latMax, lonMax].every((n) => !Number.isNaN(n))) {
      return [[latMin, lonMin], [latMax, lonMax]];
    }
  }
  return [[30, -6], [46, 20]];
}

const vessels = new Map();
let socket = null;
let connecting = false;

function connect(key) {
  if (socket || connecting) return;
  connecting = true;

  const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');

  ws.addEventListener('open', () => {
    connecting = false;
    ws.send(
      JSON.stringify({
        APIKey: key,
        BoundingBoxes: [getBbox()],
        FilterMessageTypes: ['PositionReport'],
      }),
    );
  });

  ws.addEventListener('message', (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.MessageType !== 'PositionReport') return;
      const pos = msg.Message.PositionReport;
      const meta = msg.MetaData;
      vessels.set(meta.MMSI, {
        mmsi: meta.MMSI,
        name: (meta.ShipName || '').trim() || `MMSI ${meta.MMSI}`,
        lat: pos.Latitude,
        lon: pos.Longitude,
        speedKn: pos.Sog,
        course: pos.Cog,
        updatedAt: Date.now(),
      });
    } catch {
      // mensaje mal formado, se ignora
    }
  });

  ws.addEventListener('close', () => {
    socket = null;
    connecting = false;
    setTimeout(() => connect(key), 10000); // reintenta, no deja el panel muerto
  });

  ws.addEventListener('error', () => {
    ws.close();
  });

  socket = ws;
}

export async function fetchData() {
  const key = process.env.AISSTREAM_API_KEY;
  if (!key) return { error: 'Falta AISSTREAM_API_KEY en .env' };

  connect(key);

  // Los reportes viejos (>10 min) probablemente ya no reflejan la posición real.
  const cutoff = Date.now() - 10 * 60 * 1000;
  const items = [...vessels.values()]
    .filter((v) => v.updatedAt > cutoff)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 100);

  if (items.length === 0) {
    return { items: [], note: 'Conectando al feed AIS — los primeros barcos tardan un momento en aparecer' };
  }
  return { items };
}
