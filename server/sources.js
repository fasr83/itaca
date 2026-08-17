// Fuentes curadas por tema, con nivel de confiabilidad (tier).
// Patrón tomado de world-monitor: tier 1 = agencias/oficiales, tier 2 = medios mayores reconocidos.
// Mantener la lista corta y de alta confianza es el punto — no agregar agregadores/blogs sin revisar.

export const TOPICS = {
  mundo: {
    label: 'Mundo',
    sources: [
      { name: 'BBC World', tier: 1, url: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
      { name: 'Al Jazeera', tier: 1, url: 'https://www.aljazeera.com/xml/rss/all.xml' },
      { name: 'The Guardian World', tier: 2, url: 'https://www.theguardian.com/world/rss' },
      { name: 'NPR News', tier: 2, url: 'https://feeds.npr.org/1004/rss.xml' },
      { name: 'DW News', tier: 2, url: 'https://rss.dw.com/rdf/rss-en-all' },
      { name: 'BBC Mundo', tier: 1, url: 'https://feeds.bbci.co.uk/mundo/rss.xml', lang: 'es' },
      { name: 'Infobae', tier: 2, url: 'https://www.infobae.com/arc/outboundfeeds/rss/', lang: 'es' },
    ],
  },
  tecnologia: {
    label: 'Tecnología',
    sources: [
      { name: 'Ars Technica', tier: 1, url: 'http://feeds.arstechnica.com/arstechnica/index' },
      { name: 'The Verge', tier: 2, url: 'https://www.theverge.com/rss/index.xml' },
      { name: 'MIT Technology Review', tier: 1, url: 'https://www.technologyreview.com/feed/' },
      { name: 'TechCrunch', tier: 2, url: 'https://techcrunch.com/feed/' },
      { name: 'Wired', tier: 2, url: 'https://www.wired.com/feed/rss' },
    ],
  },
  negocios: {
    label: 'Negocios',
    sources: [
      { name: 'CNBC Top News', tier: 1, url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
      { name: 'MarketWatch Top Stories', tier: 1, url: 'https://feeds.marketwatch.com/marketwatch/topstories/' },
      { name: 'Financial Times', tier: 1, url: 'https://www.ft.com/rss/home' },
    ],
  },
  ciencia: {
    label: 'Ciencia',
    sources: [
      { name: 'Nature News', tier: 1, url: 'http://feeds.nature.com/nature/rss/current' },
      { name: 'ScienceDaily', tier: 2, url: 'https://www.sciencedaily.com/rss/all.xml' },
    ],
  },
};
