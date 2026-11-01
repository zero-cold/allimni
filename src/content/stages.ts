import { ITEMS } from './items';
import type { GameId, IslandId, Item, Stage } from './types';

const STAGE_SIZE = 3;

const GAME_PAIRS: Record<IslandId, [GameId, GameId][]> = {
  ar: [['trace', 'match'], ['trace', 'balloon'], ['match', 'balloon']],
  en: [['trace', 'match'], ['trace', 'balloon'], ['match', 'balloon']],
  num: [['trace', 'match'], ['trace', 'balloon'], ['match', 'balloon']],
  color: [['match', 'balloon'], ['balloon', 'mix'], ['match', 'mix']],
};

export const MIX_RECIPES = [
  { a: 'red', b: 'yellow', result: 'orange' },
  { a: 'blue', b: 'yellow', result: 'green' },
  { a: 'red', b: 'blue', result: 'purple' },
  { a: 'red', b: 'white', result: 'pink' },
];

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
