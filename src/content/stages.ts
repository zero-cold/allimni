import { ITEMS } from './items';
import type { GameId, IslandId, Item, Stage } from './types';

const STAGE_SIZE = 3;

const WORD_PAIRS: [GameId, GameId][] = [['match', 'balloon'], ['balloon', 'match']];
// من المرحلة السادسة يتدرب الطفل يركّب كلمات من الحروف.
const AR_LATE_PAIRS: [GameId, GameId][] = [['trace', 'word'], ['word', 'balloon'], ['match', 'word']];
const WORD_GAME_FROM = 5;

const GAME_PAIRS: Record<IslandId, [GameId, GameId][]> = {
  ar: [['trace', 'match'], ['trace', 'balloon'], ['match', 'balloon']],
  en: [['trace', 'match'], ['trace', 'balloon'], ['match', 'balloon']],
  num: [['trace', 'match'], ['trace', 'balloon'], ['match', 'balloon']],
  color: [['match', 'balloon'], ['balloon', 'mix'], ['match', 'mix']],
  shape: WORD_PAIRS,
  animal: WORD_PAIRS,
  food: WORD_PAIRS,
  place: WORD_PAIRS,
};

// كلمات قصيرة يركّبها الطفل حرف حرف. الحروف بالترتيب من اليمين.
export const WORDS: { word: string; letters: string[]; art: string }[] = [
  { word: 'دب', letters: ['د', 'ب'], art: 'bear' },
  { word: 'يد', letters: ['ي', 'د'], art: 'hand' },
  { word: 'موز', letters: ['م', 'و', 'ز'], art: 'banana' },
  { word: 'فيل', letters: ['ف', 'ي', 'ل'], art: 'elephant' },
  { word: 'جمل', letters: ['ج', 'م', 'ل'], art: 'camel' },
  { word: 'بطة', letters: ['ب', 'ط', 'ة'], art: 'duck' },
  { word: 'تمر', letters: ['ت', 'م', 'ر'], art: 'dates' },
  { word: 'ماي', letters: ['م', 'ا', 'ي'], art: 'water' },
];

export const MIX_RECIPES = [
  { a: 'red', b: 'yellow', result: 'orange' },
  { a: 'blue', b: 'yellow', result: 'green' },
  { a: 'red', b: 'blue', result: 'purple' },
  { a: 'red', b: 'white', result: 'pink' },
];

// مرحلتا الخلط تغطيان الوصفات الأربع، بحسب أول عنصر في جولة المرحلة.
export function mixRoundsFor(firstItemId: string) {
  return firstItemId === 'pink' ? MIX_RECIPES.slice(2, 4) : MIX_RECIPES.slice(0, 2);
}

export function getItems(island: IslandId): Item[] {
  return ITEMS.filter((i) => i.island === island);
}

export function getItem(id: string): Item {
  const item = ITEMS.find((i) => i.id === id);
  if (!item) throw new Error(`Unknown item: ${id}`);
  return item;
}

export function getStages(island: IslandId): Stage[] {
  const ids = getItems(island).map((i) => i.id);
  const stages: Stage[] = [];
  for (let i = 0; i < ids.length; i += STAGE_SIZE) {
    stages.push({ index: stages.length, itemIds: ids.slice(i, i + STAGE_SIZE) });
  }
  return stages;
}

export function gamesForStage(island: IslandId, stageIndex: number): [GameId, GameId] {
  if (island === 'ar' && stageIndex >= WORD_GAME_FROM) return AR_LATE_PAIRS[stageIndex % AR_LATE_PAIRS.length];
  const pairs = GAME_PAIRS[island];
  return pairs[stageIndex % pairs.length];
}

// تكمل الجولة من المراحل السابقة عندما تكون المرحلة أقصر من المطلوب.
export function fillRound(island: IslandId, stageIndex: number, needed: number): Item[] {
  const stages = getStages(island);
  const ids = [...stages[stageIndex].itemIds];
  for (let s = stageIndex - 1; s >= 0 && ids.length < needed; s--) {
    for (const id of stages[s].itemIds) {
      if (ids.length < needed) ids.push(id);
    }
  }
  return ids.map(getItem);
}
