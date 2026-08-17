export const id = 'fema';
export const label = 'FEMA — Declaraciones de desastre (EE.UU.)';
export const needsKey = null;
export const ttlMs = 60 * 60 * 1000;

const URL =
  'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$top=15&$orderby=declarationDate desc';

export async function fetchData() {
  try {
    const res = await fetch(URL, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return { error: `FEMA respondió ${res.status}` };
    const data = await res.json();
    const items = (data.DisasterDeclarationsSummaries || []).map((d) => ({
      id: d.disasterNumber,
      state: d.state,
      type: d.incidentType,
      title: d.declarationTitle,
      date: d.declarationDate,
    }));
    return { items };
  } catch (err) {
    return { error: err.message };
  }
}
