import { useEffect, useState } from 'react';

const STORAGE_KEY = 'itaca:visited';

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function useVisited() {
  const [visited, setVisited] = useState<Set<string>>(() => load());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited]));
  }, [visited]);

  return {
    isVisited: (link: string) => visited.has(link),
    markVisited: (link: string) => setVisited((prev) => new Set(prev).add(link)),
  };
}
