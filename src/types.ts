export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export type Nation = 'Spain' | 'Argentina';

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physicality: number;
}

export interface Player {
  id: string;
  name: string;
  nation: Nation;
  position: Position;
  baseRating: number;
  rarity: Rarity;
  stats: PlayerStats;
}

export interface MatchEvent {
  id: string;
  timestamp: Date;
  playerName: string;
  playerId: string;
  type: 'Goal' | 'Assist' | 'Corner' | 'Yellow Card' | 'Red Card';
  points: number;
  description: string;
}

export interface CollectedCard {
  id: string; // unique instance ID
  playerId: string;
  rating: number; // starts at player.baseRating, dynamically adjusted by live match events
  recentEvents: MatchEvent[];
  obtainedAt: string;
  isFavorite?: boolean;
}

export interface Pack {
  id: string;
  openedAt: string;
  cards: CollectedCard[];
  cost: number;
  wasOpened: boolean;
}

export interface PlayerBet {
  id: string;
  cardId: string;
  playerId: string;
  type: 'exact' | 'range';
  targetRank?: number; // 1-22
  rangeStart?: number; // 1-22
  rangeEnd?: number; // 1-22
  betAmount: number;
  multiplier: number;
  placedAtMinute: number;
  status: 'pending' | 'won' | 'lost';
  actualFinalRank?: number;
  payoutAmount?: number;
}

