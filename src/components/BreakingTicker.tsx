import type { NewsItem } from '../types';

// El filtrado (tier 1, más recientes primero) y la traducción los hace App —
// acá solo se arma el scroll infinito con lo que llega.
export default function BreakingTicker({ items }: { items: NewsItem[] }) {
  if (items.length === 0) return null;

  const renderHeadlines = (keyPrefix: string) =>
    items.map((item, i) => (
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
