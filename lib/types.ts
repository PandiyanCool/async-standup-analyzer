export interface Keyword {
  text: string;
  value: number;
}

export interface StandupData {
  yesterday: string[];
  today: string[];
  blockers: string[];
  keywords: Keyword[];
}

export interface StoredStandup {
  date: string;
  transcript: string;
  summary: StandupData;
}