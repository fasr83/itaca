// ThreatFox (abuse.ch) requiere una Auth-Key gratuita desde https://auth.abuse.ch/

export const id = 'threatfox';
export const label = 'ThreatFox — Indicadores de malware';
export const needsKey = 'THREATFOX_API_KEY';
export const setupUrl = 'https://auth.abuse.ch/';
export const ttlMs = 30 * 60 * 1000;

const URL = 'https://threatfox-api.abuse.ch/api/v1/';

export async function fetchData() {
  const key = process.env.THREATFOX_API_KEY;
  if (!key) return { error: 'Falta THREATFOX_API_KEY en .env' };

  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Auth-Key': key },
      body: JSON.stringify({ query: 'get_iocs', days: 1 }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { error: `ThreatFox respondió ${res.status}` };
    const data = await res.json();
    if (data.query_status !== 'ok') return { error: `ThreatFox: ${data.query_status}` };
    const items = (data.data || []).slice(0, 30).map((e) => ({
      id: e.id,
      ioc: e.ioc,
      type: e.ioc_type,
      threatType: e.threat_type,
      malware: e.malware_printable,
      confidence: e.confidence_level,
      firstSeen: e.first_seen_utc,
    }));
    return { items };
  } catch (err) {
    return { error: err.message };
  }
}
