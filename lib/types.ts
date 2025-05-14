export interface KeywordData {
  text: string;
  value: number;
}

export interface StandupData {
  yesterday: string[];
  today: string[];
  blockers: string[];
  keywords: KeywordData[];
}

export interface StoredStandup {
  date: string;
  transcript: string;
  summary: StandupData;
}