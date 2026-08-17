import { useRef, useState } from 'react';
import { CHANNELS, type Channel } from '../channels';

function NowPlaying({ channel }: { channel: Channel }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  function goFullscreen() {
    wrapRef.current?.requestFullscreen?.();
  }

  return (
    <div className="tv-hero-wrap" ref={wrapRef}>
      <iframe
        key={channel.id}
        className="tv-hero-frame"
        src={`https://www.youtube.com/embed/live_stream?channel=${channel.id}&autoplay=1`}
        title={channel.name}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
      <button className="tv-maximize tv-maximize-hero" onClick={goFullscreen} title="Maximizar">
        ⤢ Maximizar
      </button>
      <p className="tv-hero-name">{channel.name}</p>
    </div>
  );
}

export default function LiveTV() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const groups = [...new Set(CHANNELS.map((c) => c.group))];
  const playing = CHANNELS.find((c) => c.id === playingId) || null;

  return (
    <div>
      {playing ? (
        <NowPlaying channel={playing} />
      ) : (
        <div className="tv-hero-empty">Elegí un canal abajo para empezar a ver o escuchar.</div>
      )}

      {groups.map((group) => (
        <section key={group} className="tv-section">
          <h2 className="tv-section-title">{group}</h2>
          <div className="tv-select-row">
            {CHANNELS.filter((c) => c.group === group).map((c) => (
              <button
                key={c.id}
                className={`tv-select-btn${c.id === playingId ? ' active' : ''}`}
                onClick={() => setPlayingId(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
