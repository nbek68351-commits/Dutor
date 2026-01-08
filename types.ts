
export type Language = 'uz' | 'kk' | 'ru';

export interface Note {
  name: string;
  freq: number;
}

export interface HistoryItem {
  timestamp: number;
  note: string;
  frequency: number;
}

export interface Translations {
  title: string;
  startTuning: string;
  stopTuning: string;
  history: string;
  correct: string;
  programmer: string;
  frequency: string;
  clearHistory: string;
  noHistory: string;
  currentNote: string;
  detected: string;
  micPermission: string;
  menu: string;
  tuner: string;
}
