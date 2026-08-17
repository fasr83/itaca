import { useEffect, useState } from 'react';
import type { PanelsResponse } from '../types';

interface Alert {
  icon: string;
  text: string;
  href?: string;
}

const REFRESH_MS = 3 * 60 * 1000;

function buildAlerts(data: PanelsResponse): Alert[] {
  const alerts: Alert[] = [];

  const quakes = (data.data.earthquakes?.items || []) as any[];
  for (const q of quakes) {
    if (q.mag >= 5.5) {
      alerts.push({ icon: '🌎', text: `Sismo M${q.mag.toFixed(1)} · ${q.place}`, href: q.url });
    }
  }

  const gdacs = (data.data.gdacs?.items || []) as any[];
  for (const e of gdacs) {
    if (e.alertLevel === 'Red') {
      alerts.push({ icon: '⚠️', text: `${e.type} · ${e.name}`, href: e.url });
    }
  }

  const nws = (data.data.nws?.items || []) as any[];
  for (const n of nws) {
    if (n.severity === 'Extreme') {
      alerts.push({ icon: '🌪️', text: `${n.event} · ${n.area}` });
    }
  }

  const redalert = (data.data.redalert?.items || []) as any[];
  for (const r of redalert) {
    alerts.push({ icon: '🚨', text: `Alerta Tzeva Adom · ${r.city}` });
  }

  const ukraine = (data.data.ukrainealerts?.items || []) as any[];
  for (const u of ukraine) {
    alerts.push({ icon: '🚨', text: `Alerta aérea · ${u.location}` });
  }

  return alerts.slice(0, 15);
}

export default function AlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  async function load() {
    try {
      const res = await fetch('/api/panels');
      if (!res.ok) return;
      const data: PanelsResponse = await res.json();
      setAlerts(buildAlerts(data));
    } catch {
      // si falla, simplemente no se muestra la banda — no es crítico
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  if (alerts.length === 0) return null;

  const renderAlerts = (keyPrefix: string) =>
    alerts.map((a, i) =>
      a.href ? (
        <a key={`${keyPrefix}${i}`} href={a.href} target="_blank" rel="noreferrer" className="ticker-item">
          {a.icon} {a.text}
        </a>
      ) : (
        <span key={`${keyPrefix}${i}`} className="ticker-item">
          {a.icon} {a.text}
        </span>
      ),
    );

  return (
    <div className="ticker ticker-alert">
      <span className="ticker-label">⚠️ ALERTAS</span>
      <div className="ticker-scroll">
        <span className="ticker-track">
          {renderAlerts('a')}
          {renderAlerts('b')}
        </span>
      </div>
    </div>
  );
}
