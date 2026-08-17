// Cadena de proveedores de IA con fallback, patrón tomado de world-monitor
// (src/services/summarization.ts): intenta cada proveedor en orden, el primero
// que responda gana. Hoy solo hay Ollama local; agregar Groq/OpenRouter más
// adelante es solo sumar una función tryX() a esta lista.

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';

async function tryOllama(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const summary = (data.response || '').trim();
    if (!summary) return null;
    return { summary, provider: 'ollama', model: OLLAMA_MODEL };
  } catch (err) {
    console.warn('[ai] Ollama no disponible:', err.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
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
