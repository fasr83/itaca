export const id = 'predictions';
export const label = 'Mercados de predicción';
export const needsKey = null;
export const ttlMs = 5 * 60 * 1000;

const URL = 'https://gamma-api.polymarket.com/events?closed=false&order=volume24hr&ascending=false&limit=8';

function safeParseArray(raw) {
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function fetchData() {
  try {
    const res = await fetch(URL, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { error: `Polymarket respondió ${res.status}` };
    const events = await res.json();
    const items = events.map((e) => {
      const market = e.markets?.[0];
      const outcomes = market ? safeParseArray(market.outcomes) : [];
      const prices = market ? safeParseArray(market.outcomePrices) : [];
      const topIdx = prices.length > 0 ? prices.map(Number).indexOf(Math.max(...prices.map(Number))) : -1;
      return {
        id: e.id,
        title: e.title,
        url: `https://polymarket.com/event/${e.slug}`,
        volume24h: Number(e.volume24hr || 0),
        leadingOutcome: topIdx >= 0 ? outcomes[topIdx] : null,
        leadingProbability: topIdx >= 0 ? Math.round(Number(prices[topIdx]) * 100) : null,
      };
    });
    return { items };
  } catch (err) {
    return { error: err.message };
  }
}
