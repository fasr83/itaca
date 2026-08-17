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

const TIER_LABEL: Record<number, string> = {
  1: 'Fuente tier 1 · agencia u oficial',
  2: 'Fuente tier 2 · medio mayor reconocido',
};

export default function NewsCard({
  item,
  visited,
  onOpen,
}: {
  item: NewsItem;
  visited: boolean;
  onOpen: () => void;
}) {
  return (
    <a
      className={`news-card topic-${item.topic}${visited ? ' visited' : ''}`}
      href={item.link}
      target="_blank"
      rel="noreferrer"
      onClick={onOpen}
    >
      <div className="news-card-meta">
        <span className={`tier-badge tier-${item.tier}`} title={TIER_LABEL[item.tier]}>
          {item.source}
        </span>
        <span className="news-time">{timeAgo(item.isoDate)}</span>
      </div>
      <div className="news-title">{item.title}</div>
    </a>
  );
}
