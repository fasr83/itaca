import { useState } from 'react';

interface Airport {
  icao: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

interface Live {
  icao24: string;
  country: string;
  lat: number;
  lon: number;
  altitude: number;
  onGround: boolean;
  velocity: number;
  heading: number;
}

interface Distances {
  totalKm: number;
  traveledKm: number | null;
  remainingKm: number | null;
  progressPct: number | null;
}

interface FlightResult {
  callsign?: string;
  live?: Live | null;
  origin?: Airport | null;
  destination?: Airport | null;
  distances?: Distances | null;
  error?: string;
}

function FlightProgress({ origin, destination, progressPct }: { origin: Airport; destination: Airport; progressPct: number | null }) {
  const pct = progressPct ?? 0;
  return (
    <div className="flight-progress">
      <div className="flight-progress-endpoints">
        <span>{origin.city || origin.icao}</span>
        <span>{destination.city || destination.icao}</span>
      </div>
      <div className="flight-progress-track">
        <div className="flight-progress-fill" style={{ width: `${pct}%` }} />
        {progressPct != null && (
          <span className="flight-progress-plane" style={{ left: `${pct}%` }}>
            ✈️
          </span>
        )}
      </div>
    </div>
  );
}

export default function FlightSearch() {
  const [callsign, setCallsign] = useState('');
  const [result, setResult] = useState<FlightResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!callsign.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/flight-search?callsign=${encodeURIComponent(callsign)}`);
      setResult(await res.json());
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'No se pudo conectar con el servidor' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flight-search">
      <div className="flight-search-bar">
        <input
          type="text"
          placeholder="Número de vuelo, ej. DLH400"
          value={callsign}
          onChange={(e) => setCallsign(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
        />
        <button onClick={search} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar vuelo'}
        </button>
      </div>

      {result?.error && <p className="panel-error">{result.error}</p>}

      {result && !result.error && (
        <div className="flight-result">
          <h3>{result.callsign}</h3>

          {result.origin && result.destination && (
            <FlightProgress
              origin={result.origin}
              destination={result.destination}
              progressPct={result.distances?.progressPct ?? null}
            />
          )}

          <div className="flight-stats">
            {result.distances && (
              <>
                <div className="flight-stat">
                  <span className="flight-stat-label">Distancia total</span>
                  <span className="flight-stat-value">{result.distances.totalKm.toLocaleString()} km</span>
                </div>
                {result.distances.traveledKm != null && (
                  <div className="flight-stat">
                    <span className="flight-stat-label">Recorrida</span>
                    <span className="flight-stat-value">{result.distances.traveledKm.toLocaleString()} km</span>
                  </div>
                )}
                {result.distances.remainingKm != null && (
                  <div className="flight-stat">
                    <span className="flight-stat-label">Faltante</span>
                    <span className="flight-stat-value">{result.distances.remainingKm.toLocaleString()} km</span>
                  </div>
                )}
              </>
            )}
            {result.live && (
              <>
                <div className="flight-stat">
                  <span className="flight-stat-label">Altitud</span>
                  <span className="flight-stat-value">{Math.round(result.live.altitude || 0).toLocaleString()} m</span>
                </div>
                <div className="flight-stat">
                  <span className="flight-stat-label">Velocidad</span>
                  <span className="flight-stat-value">{Math.round((result.live.velocity || 0) * 3.6)} km/h</span>
                </div>
                <div className="flight-stat">
                  <span className="flight-stat-label">Rumbo</span>
                  <span className="flight-stat-value">{Math.round(result.live.heading || 0)}°</span>
                </div>
              </>
            )}
          </div>

          {result.origin && result.destination && (
            <p className="flight-route-names">
              {result.origin.name} ({result.origin.icao}) → {result.destination.name} ({result.destination.icao})
            </p>
          )}

          {!result.live && <p className="panel-muted">Sin posición en vivo ahora mismo (el vuelo puede no estar en el aire).</p>}
        </div>
      )}
    </div>
  );
}
