import { useRef, useState } from 'react';
import type { NewsItem } from './types';

// Traduce en lotes chicos, en segundo plano, sin bloquear el render.
// Ollama en esta máquina procesa una generación a la vez, así que los lotes
// se encolan uno detrás de otro — mandarlos en paralelo solo los hace
// competir por el mismo modelo y expirar por timeout sin resultado.
const BATCH_SIZE = 10;

export function useTranslations() {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [pendingCount, setPendingCount] = useState(0);
  const queued = useRef<Set<string>>(new Set());
  const chain = useRef<Promise<void>>(Promise.resolve());

  async function runBatch(titles: string[]) {
    setPendingCount((c) => c + titles.length);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titles }),
      });
      if (res.ok) {
        const data: { translations: Record<string, string> } = await res.json();
        setTranslations((prev) => ({ ...prev, ...data.translations }));
      }
    } catch {
      // se queda en el idioma original, no es crítico
    } finally {
      setPendingCount((c) => Math.max(0, c - titles.length));
    }
  }

  function ensureTranslated(items: NewsItem[]) {
    const unique = [
      ...new Set(
        items
          .filter((i) => i.lang !== 'es')
          .map((i) => i.title)
          .filter((t) => !translations[t] && !queued.current.has(t)),
      ),
    ];
    if (unique.length === 0) return;
    unique.forEach((t) => queued.current.add(t));
    for (let i = 0; i < unique.length; i += BATCH_SIZE) {
      const batch = unique.slice(i, i + BATCH_SIZE);
      chain.current = chain.current.then(() => runBatch(batch));
    }
  }

  return { translations, pendingCount, ensureTranslated };
}
