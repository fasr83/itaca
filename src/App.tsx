import { useEffect, useState } from 'react';
import type { NewsItem, TopicInfo } from './types';
import NewsCard from './components/NewsCard';
import BriefPanel from './components/BriefPanel';

export default function App() {
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/topics')
      .then((r) => r.json())
      .then((data: TopicInfo[]) => {
        setTopics(data);
        setActiveTopic('');
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = activeTopic ? `?topic=${activeTopic}` : '';
    fetch(`/api/feeds${qs}`)
      .then((r) => r.json())
      .then((data: { items: NewsItem[] }) => setItems(data.items))
      .finally(() => setLoading(false));
  }, [activeTopic]);

  return (
    <div className="app">
      <header>
        <h1>Itaca</h1>
        <p className="subtitle">Tu dashboard personal de noticias, sin ruido</p>
      </header>

      <nav className="tabs">
        <button className={activeTopic === '' ? 'active' : ''} onClick={() => setActiveTopic('')}>
          Todo
        </button>
        {topics.map((t) => (
          <button
            key={t.key}
            className={activeTopic === t.key ? 'active' : ''}
            onClick={() => setActiveTopic(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <BriefPanel items={items} />

      {loading ? (
        <p className="status">Cargando noticias...</p>
      ) : items.length === 0 ? (
        <p className="status">Sin noticias disponibles ahora mismo.</p>
      ) : (
        <div className="news-grid">
          {items.map((item) => (
            <NewsCard key={item.link || item.title} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
