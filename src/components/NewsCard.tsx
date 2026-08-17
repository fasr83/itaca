import type { NewsItem } from '../types';

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a className="news-card" href={item.link} target="_blank" rel="noreferrer">
      <div className="news-card-meta">
        <span className={`tier-badge tier-${item.tier}`}>{item.source}</span>
        <span className="news-time">{timeAgo(item.isoDate)}</span>
      </div>
      <div className="news-title">{item.title}</div>
    </a>
  );
}
