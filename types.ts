
export enum GameStatus {
  PLAYING = 'PLAYING',
  WON = 'WON'
}

export interface GuessRecord {
  value: number;
  result: 'high' | 'low' | 'correct';
  timestamp: number;
}

export interface GameState {
  targetNumber: number;
  attempts: number;
  history: GuessRecord[];
  status: GameStatus;
  aiComment: string;
  isLoadingAi: boolean;
}
