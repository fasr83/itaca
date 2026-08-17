import { useEffect, useState } from 'react';
import type { PanelsResponse, PanelStatus } from '../types';
import Sparkline from './Sparkline';

// Cada panel tiene forma de dato distinta, así que en vez de un componente por
// panel, un formateador chico por id: toma un item y devuelve 1-2 líneas de texto.
type Row = { primary: string; secondary?: string; href?: string };
const FORMATTERS: Record<string, (item: any) => Row> = {
  earthquakes: (i) => ({
    primary: `M${i.mag?.toFixed(1)} · ${i.place}`,
    secondary: new Date(i.time).toLocaleString(),
    href: i.url,
  }),
  weather: (i) => ({
    primary: `${i.name} · ${Math.round(i.tempC)}°C`,
    secondary: `${i.localTime ? i.localTime.slice(11, 16) + ' hora local · ' : ''}${i.condition}`,
  }),
  crypto: (i) => ({
    primary: `${i.symbol} · $${Number(i.price).toLocaleString()}`,
    secondary: `${i.change24h > 0 ? '+' : ''}${i.change24h?.toFixed(2)}% 24h`,
  }),
  predictions: (i) => ({
    primary: i.title,
    secondary: i.leadingOutcome ? `${i.leadingOutcome} · ${i.leadingProbability}%` : undefined,
    href: i.url,
  }),
  redalert: (i) => ({ primary: i.city, secondary: i.category || 'Alerta activa' }),
  flights: (i) => ({
    primary: `${i.callsign || i.icao24} · ${i.country}`,
    secondary: `${Math.round(i.altitude || 0)}m · ${Math.round((i.velocity || 0) * 3.6)}km/h`,
  }),
  iss: (i) => ({
    primary: `Lat ${i.lat.toFixed(2)}, Lon ${i.lon.toFixed(2)}`,
    secondary: `${Math.round(i.altitudeKm)}km · ${Math.round(i.velocityKmh)}km/h · ${i.visibility}`,
  }),
  gdacs: (i) => ({
    primary: `${i.type} · ${i.name}`,
    secondary: `${i.alertLevel} · ${i.country || ''}`,
    href: i.url,
  }),
  fema: (i) => ({ primary: `${i.state} · ${i.type}`, secondary: i.title }),
  nina: (i) => ({ primary: i.title, secondary: `${i.severity} · ${i.type}` }),
  acled: (i) => ({
    primary: `${i.type} · ${i.location}, ${i.country}`,
    secondary: `${i.fatalities} fallecidos · ${i.date}`,
  }),
  firms: (i) => ({ primary: `Foco detectado (${i.confidence})`, secondary: `${i.date} ${i.time}` }),
  cloudflare: (i) => ({ primary: i.description, secondary: (i.locations || []).join(', ') }),
  threatfox: (i) => ({ primary: `${i.malware || i.threatType} · ${i.type}`, secondary: i.ioc }),
  ukrainealerts: (i) => ({ primary: i.location, secondary: i.type }),
};

function PanelCard({ status, result }: { status: PanelStatus; result?: import('../types').PanelResult }) {
  if (!status.configured) {
    return (
      <div className="panel-card panel-card-setup">
        <h3>{status.label}</h3>
        <p>Necesita configurar <code>{status.needsKey}</code> en tu <code>.env</code></p>
        {status.setupUrl && (
          <a href={status.setupUrl} target="_blank" rel="noreferrer">
            Conseguir key →
          </a>
        )}
      </div>
    );
  }

  if (!result || (!result.items && !result.error)) {
    return (
      <div className="panel-card">
        <h3>{status.label}</h3>
        <p className="panel-muted">Cargando...</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="panel-card">
        <h3>{status.label}</h3>
        <p className="panel-error">{result.error}</p>
      </div>
    );
  }

  const items = (result.items || []) as any[];

  if (status.id === 'crypto') {
    return (
      <div className="panel-card">
        <h3>{status.label}</h3>
        {items.length === 0 ? (
          <p className="panel-muted">Sin datos por ahora.</p>
        ) : (
          <ul className="panel-list">
            {items.map((c) => (
              <li key={c.id} className="crypto-row">
                <span>
                  <span className="panel-primary">{c.symbol} · ${Number(c.price).toLocaleString()}</span>
                  <span className="panel-secondary">
                    {c.change24h > 0 ? '+' : ''}
                    {c.change24h?.toFixed(2)}% 24h
                  </span>
                </span>
                <Sparkline data={c.sparkline7d} positive={c.change24h >= 0} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const format = FORMATTERS[status.id] || ((i: any) => ({ primary: JSON.stringify(i).slice(0, 80) }));

  return (
    <div className="panel-card">
      <h3>{status.label}</h3>
      {items.length === 0 ? (
        <p className="panel-muted">Sin datos por ahora.</p>
      ) : (
        <ul className="panel-list">
          {items.slice(0, 8).map((item, i) => {
            const row = format(item);
            const content = (
              <>
                <span className="panel-primary">{row.primary}</span>
                {row.secondary && <span className="panel-secondary">{row.secondary}</span>}
              </>
            );
            return (
              <li key={i}>
                {row.href ? (
                  <a href={row.href} target="_blank" rel="noreferrer">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function RadarView() {
  const [data, setData] = useState<PanelsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/panels');
      if (!res.ok) throw new Error('El servidor no respondió correctamente');
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (error) {
    return (
      <div className="status error-status">
        <p>{error}</p>
        <button onClick={load}>Reintentar</button>
      </div>
    );
  }

  if (loading && !data) {
    return <p className="status">Cargando radar...</p>;
  }

  return (
    <div>
      <button className="refresh radar-refresh" onClick={load} disabled={loading}>
        {loading ? '⟳ Actualizando...' : '⟳ Actualizar radar'}
      </button>
      <div className="panels-grid">
        {data?.status.map((s) => (
          <PanelCard key={s.id} status={s} result={data.data[s.id]} />
        ))}
      </div>
    </div>
  );
}
