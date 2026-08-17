export interface NewsItem {
  title: string;
  link: string;
  isoDate: string | null;
  source: string;
  tier: number;
  topic: string;
  lang: string;
}

export interface PanelStatus {
  id: string;
  label: string;
  configured: boolean;
  needsKey: string | null;
  setupUrl: string | null;
}

export interface PanelResult {
  items?: unknown[];
  error?: string;
  [key: string]: unknown;
}

export interface PanelsResponse {
  status: PanelStatus[];
  data: Record<string, PanelResult>;
}

export interface TopicInfo {
  key: string;
  label: string;
  sourceCount: number;
}

export interface BriefResult {
  summary: string;
  provider: string;
  model: string;
}
