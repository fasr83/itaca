import { useState } from 'react';
import type { BriefResult, NewsItem } from '../types';

export default function BriefPanel({ items }: { items: NewsItem[] }) {
  const [brief, setBrief] = useState<BriefResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setBrief(null);
    try {
      const headlines = items.slice(0, 12).map((i) => i.title);
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headlines }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error generando el resumen');
      }
      setBrief(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="brief-panel">
      <button onClick={generate} disabled={loading || items.length === 0}>
        {loading ? 'Generando...' : 'Generar resumen con IA'}
      </button>
      {error && <p className="brief-error">{error}</p>}
      {brief && (
        <div className="brief-result">
          <p>{brief.summary}</p>
          <span className="brief-provider">
            {brief.provider} · {brief.model}
          </span>
        </div>
      )}
    </div>
  );
}
