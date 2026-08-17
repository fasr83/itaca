export const id = 'crypto';
export const label = 'Cripto';
export const needsKey = null;
export const ttlMs = 2 * 60 * 1000;

const URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=8&page=1&price_change_percentage=24h&sparkline=true';

export async function fetchData() {
  try {
    const res = await fetch(URL, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { error: `CoinGecko respondió ${res.status}` };
    const coins = await res.json();
    const items = coins.map((c) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      price: c.current_price,
      change24h: c.price_change_percentage_24h,
      sparkline7d: c.sparkline_in_7d?.price || [],
    }));
    return { items };
  } catch (err) {
    return { error: err.message };
  }
}
