import express from 'express';
import Parser from 'rss-parser';
import { TOPICS } from './sources.js';
import { cacheGet, cacheSet } from './cache.js';
import { generateBrief, translateBatch } from './ai.js';
import { PANELS, panelStatus } from './panels/registry.js';
import { searchFlight } from './flightSearch.js';

const app = express();
app.use(express.json());

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Itaca/0.1; personal RSS reader)' },
});
const FEED_TTL_MS = 10 * 60 * 1000; // 10 min, evita golpear las fuentes en cada refresh

async function fetchSource(topicKey, source) {
  const cacheKey = `feed:${source.url}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const feed = await parser.parseURL(source.url);
    const items = (feed.items || []).slice(0, 15).map((item) => ({
      title: item.title || '',
      link: item.link || '',
      isoDate: item.isoDate || item.pubDate || null,
      source: source.name,
      tier: source.tier,
      topic: topicKey,
      lang: source.lang || 'en',
    }));
    cacheSet(cacheKey, items, FEED_TTL_MS);
    return items;
  } catch (err) {
    console.warn(`[feeds] Falló ${source.name} (${source.url}):`, err.message);
    return [];
  }
}

function dedupe(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = item.title.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

app.get('/api/feeds', async (req, res) => {
  const topicKey = req.query.topic;
  const topicsToFetch = topicKey && TOPICS[topicKey] ? { [topicKey]: TOPICS[topicKey] } : TOPICS;

  const results = await Promise.all(
    Object.entries(topicsToFetch).flatMap(([key, topic]) =>
      topic.sources.map((source) => fetchSource(key, source)),
    ),
  );

  const items = dedupe(results.flat()).sort((a, b) => {
    const da = a.isoDate ? new Date(a.isoDate).getTime() : 0;
    const db = b.isoDate ? new Date(b.isoDate).getTime() : 0;
    return db - da;
  });

  res.json({ items, topics: Object.keys(topicsToFetch) });
});

// Traducción bajo demanda: el frontend manda lotes chicos de titulares visibles
// (el modelo local es lento en esta máquina, así que nunca se traduce todo de
// una — el feed se ve al instante y los títulos se van poniendo en español
// a medida que llegan las respuestas).
const TRANSLATION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días, un titular traducido no cambia
const MAX_TITLES_PER_REQUEST = 12;

app.post('/api/translate', async (req, res) => {
  const titles = Array.isArray(req.body?.titles) ? req.body.titles.slice(0, MAX_TITLES_PER_REQUEST) : [];
  if (titles.length === 0) return res.json({ translations: {} });

  const pending = [...new Set(titles.filter((t) => cacheGet(`tr:${t}`) === null))];
  if (pending.length > 0) {
    const translated = await translateBatch(pending);
    pending.forEach((title, i) => {
      if (translated[i]) cacheSet(`tr:${title}`, translated[i], TRANSLATION_TTL_MS);
    });
  }

  const translations = {};
  for (const title of titles) {
    const cached = cacheGet(`tr:${title}`);
    if (cached) translations[title] = cached;
  }
  res.json({ translations });
});

app.get('/api/topics', (_req, res) => {
  res.json(
    Object.entries(TOPICS).map(([key, t]) => ({ key, label: t.label, sourceCount: t.sources.length })),
  );
});

app.post('/api/brief', async (req, res) => {
  const headlines = Array.isArray(req.body?.headlines) ? req.body.headlines.slice(0, 12) : [];
  if (headlines.length === 0) {
    return res.status(400).json({ error: 'Se necesitan titulares (headlines[])' });
  }
  const result = await generateBrief(headlines);
  if (!result) {
    return res.status(503).json({ error: 'Ningún proveedor de IA disponible (¿Ollama corriendo?)' });
  }
  res.json(result);
});

// Paneles de "radar" (sismos, clima, cripto, mercados de predicción, alertas,
// vuelos, y los que requieren API key). Cada uno se cachea con su propio TTL
// y nunca bloquea a los demás si falla.
app.get('/api/panels', async (_req, res) => {
  const status = PANELS.map(panelStatus);

  const data = {};
  await Promise.all(
    PANELS.map(async (panel) => {
      const st = panelStatus(panel);
      if (!st.configured) return; // sin key, no tiene sentido pegarle a la API

      const cacheKey = `panel:${panel.id}`;
      const cached = cacheGet(cacheKey);
      if (cached) {
        data[panel.id] = cached;
        return;
      }
      const result = await panel.fetchData();
      cacheSet(cacheKey, result, panel.ttlMs);
      data[panel.id] = result;
    }),
  );

  res.json({ status, data });
});

// Búsqueda de un vuelo puntual por número/callsign — posición en vivo (OpenSky)
// + ruta conocida (OpenSky routes, comunitaria) + distancias (haversine contra
// coordenadas de aeropuertos, dataset abierto de mwgg/Airports).
app.get('/api/flight-search', async (req, res) => {
  const callsign = String(req.query.callsign || '');
  try {
    const result = await searchFlight(callsign);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.API_PORT || 8787;
app.listen(PORT, () => {
  console.log(`[itaca] API escuchando en http://localhost:${PORT}`);
});
