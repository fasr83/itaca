import { useState } from 'react';
import { CHANNELS, type Channel } from '../channels';

// Click-to-load: no cargamos 12 streams en vivo a la vez (ancho de banda,
// CPU) — solo el que el usuario realmente quiere ver.
function ChannelCard({ channel, playing, onPlay }: { channel: Channel; playing: boolean; onPlay: () => void }) {
  return (
    <div className="tv-card">
      {playing ? (
        <iframe
          className="tv-frame"
          src={`https://www.youtube.com/embed/live_stream?channel=${channel.id}&autoplay=1`}
          title={channel.name}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button className="tv-thumb" onClick={onPlay}>
          <span className="tv-play">▶</span>
        </button>
      )}
      <p className="tv-name">{channel.name}</p>
    </div>
  );
}

export default function LiveTV() {
  const [playing, setPlaying] = useState<string | null>(null);
  const groups = [...new Set(CHANNELS.map((c) => c.group))];

  return (
    <div>
      {groups.map((group) => (
        <section key={group} className="tv-section">
          <h2 className="tv-section-title">{group}</h2>
          <div className="tv-grid">
            {CHANNELS.filter((c) => c.group === group).map((c) => (
              <ChannelCard
                key={c.id}
                channel={c}
                playing={playing === c.id}
                onPlay={() => setPlaying(c.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
