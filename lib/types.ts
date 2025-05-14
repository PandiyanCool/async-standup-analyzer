export interface Keyword {
  text: string;
  value: number;
}

export interface SentimentAnalysis {
  overall: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
  highlights: {
    positive: string[];
    negative: string[];
  };
}

export interface StandupData {
  yesterday: string[];
  today: string[];
  blockers: string[];
  keywords: Keyword[];
  sentiment: SentimentAnalysis;
}

export interface StoredStandup {
  date: string;
  transcript: string;
  summary: StandupData;
}