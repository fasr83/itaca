import { useEffect, useMemo, useState } from 'react';
import type { NewsItem, TopicInfo } from './types';
import NewsCard from './components/NewsCard';
import BriefPanel from './components/BriefPanel';
import { useVisited } from './useVisited';
import { useTranslations } from './useTranslations';
import RadarView from './components/RadarView';
import LiveTV from './components/LiveTV';

function timeAgoShort(date: Date | null): string {
  if (!date) return '';
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'justo ahora';
  if (mins < 60) return `hace ${mins}m`;
  return `hace ${Math.floor(mins / 60)}h`;
}

export default function App() {
  const [view, setView] = useState<'news' | 'radar' | 'tv'>('news');
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { isVisited, markVisited } = useVisited();
  const { translations, pendingCount, ensureTranslated } = useTranslations();

  useEffect(() => {
    fetch('/api/topics')
      .then((r) => r.json())
      .then((data: TopicInfo[]) => setTopics(data))
      .catch(() => {});
  }, []);

  async function loadFeeds() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/feeds');
      if (!res.ok) throw new Error('El servidor no respondió correctamente');
      const data: { items: NewsItem[] } = await res.json();
      setItems(data.items);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeeds();
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of items) map[item.topic] = (map[item.topic] || 0) + 1;
    return map;
  }, [items]);

  const filteredItems = useMemo(
    () => (activeTopic ? items.filter((i) => i.topic === activeTopic) : items),
    [items, activeTopic],
  );

  // Solo se traduce lo que está a la vista — el modelo local es lento, así
  // que traducir todo de una sería un bloqueo de varios minutos.
  useEffect(() => {
    ensureTranslated(filteredItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems]);

  const displayItems = useMemo(
    () =>
      filteredItems.map((item) =>
        item.lang === 'es' || !translations[item.title]
          ? item
          : { ...item, title: translations[item.title] },
      ),
    [filteredItems, translations],
  );

  return (
    <div className="app">
      <div className="topbar">
        <header>
          <h1>Itaca</h1>
          <p className="subtitle">Tu dashboard personal de noticias, sin ruido</p>
        </header>

        <nav className="view-switch">
          <button className={view === 'news' ? 'active' : ''} onClick={() => setView('news')}>
            Noticias
          </button>
          <button className={view === 'radar' ? 'active' : ''} onClick={() => setView('radar')}>
            Radar
          </button>
          <button className={view === 'tv' ? 'active' : ''} onClick={() => setView('tv')}>
            TV
          </button>
        </nav>

        {view === 'news' && (
          <nav className="tabs">
            <button className={activeTopic === '' ? 'active' : ''} onClick={() => setActiveTopic('')}>
              Todo <span className="count">{items.length}</span>
            </button>
            {topics.map((t) => (
              <button
                key={t.key}
                className={activeTopic === t.key ? 'active' : ''}
                onClick={() => setActiveTopic(t.key)}
              >
                {t.label} <span className="count">{counts[t.key] || 0}</span>
              </button>
            ))}

            <button className="refresh" onClick={loadFeeds} disabled={loading} title="Actualizar noticias">
              {loading ? '⟳ Actualizando...' : `⟳ Actualizar${lastUpdated ? ` · ${timeAgoShort(lastUpdated)}` : ''}`}
            </button>
          </nav>
        )}

        {view === 'news' && pendingCount > 0 && (
          <p className="translating-hint">Traduciendo {pendingCount} titulares...</p>
        )}
      </div>

      {view === 'radar' ? (
        <RadarView />
      ) : view === 'tv' ? (
        <LiveTV />
      ) : (
        <>
          <BriefPanel items={filteredItems} />

          {error ? (
            <div className="status error-status">
              <p>{error}</p>
              <button onClick={loadFeeds}>Reintentar</button>
            </div>
          ) : loading && items.length === 0 ? (
            <div className="news-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="news-card skeleton" />
              ))}
            </div>
          ) : displayItems.length === 0 ? (
            <p className="status">Sin noticias disponibles ahora mismo.</p>
          ) : (
            <div className="news-grid">
              {displayItems.map((item) => (
                <NewsCard
                  key={item.link || item.title}
                  item={item}
                  visited={isVisited(item.link)}
                  onOpen={() => markVisited(item.link)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
