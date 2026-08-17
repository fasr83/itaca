// Frankfurter (datos del Banco Central Europeo) — gratis, sin llave.
export const id = 'forex';
export const label = 'Tipo de Cambio (USD)';
export const needsKey = null;
export const ttlMs = 60 * 60 * 1000; // el BCE publica una vez al día

const CURRENCIES = ['EUR', 'GBP', 'MXN', 'BRL', 'JPY', 'CNY', 'CAD'];
const URL = `https://api.frankfurter.app/latest?from=USD&to=${CURRENCIES.join(',')}`;

export async function fetchData() {
  try {
    const res = await fetch(URL, { signal: AbortSignal.timeout(10000), redirect: 'follow' });
    if (!res.ok) return { error: `Frankfurter respondió ${res.status}` };
    const data = await res.json();
    const items = Object.entries(data.rates || {}).map(([currency, rate]) => ({
      currency,
      rate,
    }));
    return { items, date: data.date };
  } catch (err) {
    return { error: err.message };
  }
}
