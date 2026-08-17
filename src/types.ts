export interface NewsItem {
  title: string;
  link: string;
  isoDate: string | null;
  source: string;
  tier: number;
  topic: string;
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
