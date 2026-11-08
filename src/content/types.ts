export const ISLAND_IDS = ['ar', 'en', 'num', 'color', 'shape', 'animal', 'food', 'place'] as const;
export type IslandId = (typeof ISLAND_IDS)[number];
export type GameId = 'trace' | 'match' | 'balloon' | 'mix' | 'word' | 'say';
export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'rectangle' | 'crescent' | 'oval';

export interface Item {
  id: string;
  island: IslandId;
  display: string;
  altDisplay?: string;
  word: string;
  lang: 'ar' | 'en';
  art: string;
  count?: number;
  colorHex?: string;
  symbol?: string;
  shape?: ShapeKind;
}

export interface Stage {
  index: number;
  itemIds: string[];
}

// الجزر اللي محتواها كلمات وصور، بدون حرف أو رقم يتتبعه الطفل.
export const WORD_ISLANDS: IslandId[] = ['animal', 'food', 'place'];
