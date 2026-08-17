import { useMemo } from 'react';
import type { NewsItem } from '../types';

// "Última hora" = titulares de fuentes tier 1 (agencias/oficiales), las más
// recientes primero. Es una aproximación simple de "importante", no un
// clasificador — pero con fuentes tier 1 es razonablemente confiable.
export default function BreakingTicker({ items }: { items: NewsItem[] }) {
  const breaking = useMemo(
    () =>
      [...items]
        .filter((i) => i.tier === 1)
        .sort((a, b) => new Date(b.isoDate || 0).getTime() - new Date(a.isoDate || 0).getTime())
        .slice(0, 10),
    [items],
  );

  if (breaking.length === 0) return null;

  const renderHeadlines = (keyPrefix: string) =>
    breaking.map((item, i) => (
      <a key={`${keyPrefix}${i}`} href={item.link} target="_blank" rel="noreferrer" className="ticker-item">
        <span className="ticker-source">{item.source}</span> {item.title}
      </a>
    ));

  return (
    <div className="ticker">
      <span className="ticker-label">🔴 ÚLTIMA HORA</span>
      <div className="ticker-scroll">
        <span className="ticker-track">
          {renderHeadlines('a')}
          {renderHeadlines('b')}
        </span>
      </div>
    </div>
  );
}
