import express from 'express';
import Parser from 'rss-parser';
import { TOPICS } from './sources.js';
import { cacheGet, cacheSet } from './cache.js';
import { generateBrief } from './ai.js';

const app = express();
app.use(express.json());

const parser = new Parser({ timeout: 10000 });
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

const PORT = process.env.API_PORT || 8787;
app.listen(PORT, () => {
  console.log(`[itaca] API escuchando en http://localhost:${PORT}`);
});
