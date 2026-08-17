import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PanelsResponse } from '../types';

type LayerKey = 'earthquakes' | 'gdacs' | 'flights' | 'firms' | 'iss';

const LAYERS: { key: LayerKey; label: string; color: string; defaultOn: boolean }[] = [
  { key: 'earthquakes', label: 'Terremotos', color: '#ff6b6b', defaultOn: true },
  { key: 'gdacs', label: 'Desastres (GDACS)', color: '#f5c451', defaultOn: true },
  { key: 'firms', label: 'Incendios (FIRMS)', color: '#ff9142', defaultOn: true },
  { key: 'flights', label: 'Vuelos', color: '#5b8cff', defaultOn: false },
  { key: 'iss', label: 'ISS', color: '#3ecf8e', defaultOn: true },
];

const GDACS_COLOR: Record<string, string> = { Red: '#ff4d4d', Orange: '#f5c451', Green: '#3ecf8e' };

export default function MapView() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<Record<LayerKey, L.LayerGroup>>({} as any);
  const [enabled, setEnabled] = useState<Record<LayerKey, boolean>>(
    Object.fromEntries(LAYERS.map((l) => [l.key, l.defaultOn])) as Record<LayerKey, boolean>,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;
    const map = L.map(mapDivRef.current, { worldCopyJump: true }).setView([20, 0], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap, © CARTO',
      maxZoom: 18,
    }).addTo(map);
    for (const layer of LAYERS) {
      layerGroupsRef.current[layer.key] = L.layerGroup();
      if (layer.defaultOn) layerGroupsRef.current[layer.key].addTo(map);
    }
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    for (const layer of LAYERS) {
      const group = layerGroupsRef.current[layer.key];
      const map = mapRef.current;
      if (!group || !map) continue;
      if (enabled[layer.key]) group.addTo(map);
      else map.removeLayer(group);
    }
  }, [enabled]);

  async function loadIncidents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/panels');
      if (!res.ok) throw new Error('El servidor no respondió correctamente');
      const data: PanelsResponse = await res.json();

      for (const layer of LAYERS) layerGroupsRef.current[layer.key]?.clearLayers();

      const eq = (data.data.earthquakes?.items || []) as any[];
      for (const q of eq) {
        L.circleMarker([q.lat, q.lon], {
          radius: Math.max(3, q.mag * 2.2),
          color: '#ff6b6b',
          weight: 1,
          fillOpacity: 0.5,
        })
          .bindPopup(`<b>M${q.mag?.toFixed(1)}</b><br>${q.place}`)
          .addTo(layerGroupsRef.current.earthquakes);
      }

      const gdacs = (data.data.gdacs?.items || []) as any[];
      for (const e of gdacs) {
        if (e.lat == null || e.lon == null) continue;
        L.circleMarker([e.lat, e.lon], {
          radius: 6,
          color: GDACS_COLOR[e.alertLevel] || '#f5c451',
          weight: 1,
          fillOpacity: 0.6,
        })
          .bindPopup(`<b>${e.type}</b> · ${e.name}<br>${e.alertLevel} · ${e.country || ''}`)
          .addTo(layerGroupsRef.current.gdacs);
      }

      const fires = (data.data.firms?.items || []) as any[];
      for (const f of fires) {
        L.circleMarker([f.lat, f.lon], { radius: 3, color: '#ff9142', weight: 0, fillOpacity: 0.7 })
          .bindPopup(`Foco de calor · confianza ${f.confidence}`)
          .addTo(layerGroupsRef.current.firms);
      }

      const flights = (data.data.flights?.items || []) as any[];
      for (const f of flights) {
        L.circleMarker([f.lat, f.lon], { radius: 2.5, color: '#5b8cff', weight: 0, fillOpacity: 0.8 })
          .bindPopup(`<b>${f.callsign || f.icao24}</b><br>${f.country} · ${Math.round(f.altitude || 0)}m`)
          .addTo(layerGroupsRef.current.flights);
      }

      const iss = (data.data.iss?.items || []) as any[];
      for (const s of iss) {
        L.circleMarker([s.lat, s.lon], { radius: 8, color: '#3ecf8e', weight: 2, fillOpacity: 0.2 })
          .bindPopup(`ISS · ${Math.round(s.altitudeKm)}km de altura`)
          .addTo(layerGroupsRef.current.iss);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="map-toolbar">
        {LAYERS.map((l) => (
          <label key={l.key} className="map-layer-toggle">
            <input
              type="checkbox"
              checked={enabled[l.key]}
              onChange={(e) => setEnabled((prev) => ({ ...prev, [l.key]: e.target.checked }))}
            />
            <span className="map-layer-dot" style={{ background: l.color }} />
            {l.label}
          </label>
        ))}
        <button className="refresh" onClick={loadIncidents} disabled={loading}>
          {loading ? '⟳ Actualizando...' : '⟳ Actualizar mapa'}
        </button>
      </div>
      {error && <p className="panel-error">{error}</p>}
      <div ref={mapDivRef} className="map-container" />
    </div>
  );
}
