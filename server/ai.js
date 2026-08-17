// Cadena de proveedores de IA con fallback, patrón tomado de world-monitor
// (src/services/summarization.ts): intenta cada proveedor en orden, el primero
// que responda gana. Hoy solo hay Ollama local; agregar Groq/OpenRouter más
// adelante es solo sumar una función tryX() a esta lista.

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

async function ollamaGenerate(prompt, timeoutMs = 20000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = (data.response || '').trim();
    return text || null;
  } catch (err) {
    console.warn('[ai] Ollama no disponible:', err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function tryOllama(prompt) {
  const summary = await ollamaGenerate(prompt);
  if (!summary) return null;
  return { summary, provider: 'ollama', model: OLLAMA_MODEL };
}

const PROVIDERS = [tryOllama];

export async function generateBrief(headlines) {
  const prompt = `Resume en 3-4 oraciones en español los temas principales de estas noticias, sin opinar, tono neutral:\n\n${headlines.map((h) => `- ${h}`).join('\n')}`;

  for (const provider of PROVIDERS) {
    const result = await provider(prompt);
    if (result) return result;
  }
  return null;
}

// ── Traducción de titulares ──
// Un modelo chico como llama3.2:1b no sigue bien instrucciones de JSON, así que
// pedimos una lista numerada (más robusta) y parseamos por línea. Si el conteo
// no cuadra o el modelo no responde, se deja el titular original — nunca rompe la UI.

const CHUNK_SIZE = 6;
const CHUNK_CONCURRENCY = 1; // Ollama en CPU procesa una generación a la vez igual

function parseNumberedList(text, expectedCount) {
  const lines = text
    .split('\n')
    .map((l) => l.replace(/^\s*\d+[.)]\s*/, '').trim())
    .filter(Boolean);
  if (lines.length < expectedCount) return null;
  return lines.slice(0, expectedCount);
}

async function translateChunk(titles) {
  const prompt = `Traduce estos titulares de noticias al español. Responde SOLO con la lista numerada, una traducción por línea, sin comentarios ni explicaciones:\n\n${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;

  const text = await ollamaGenerate(prompt, 45000);
  if (!text) return titles; // sin IA disponible, se quedan en el idioma original

  const parsed = parseNumberedList(text, titles.length);
  return parsed || titles; // si el modelo no respetó el formato, no rompemos nada
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function translateBatch(titles) {
  if (titles.length === 0) return [];

  const chunks = [];
  for (let i = 0; i < titles.length; i += CHUNK_SIZE) {
    chunks.push(titles.slice(i, i + CHUNK_SIZE));
  }

  const translatedChunks = await mapWithConcurrency(chunks, CHUNK_CONCURRENCY, translateChunk);
  return translatedChunks.flat();
}
