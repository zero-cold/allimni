export type IslandId = 'ar' | 'en' | 'num' | 'color';
export type GameId = 'trace' | 'match' | 'balloon' | 'mix';

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
}

export interface Stage {
  index: number;
  itemIds: string[];
}
