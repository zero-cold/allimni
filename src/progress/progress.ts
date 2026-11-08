import { getItem } from '../content/stages';
import { ISLAND_IDS, type IslandId } from '../content/types';

export interface Progress {
  stars: number;
  completed: Record<IslandId, number[]>;
  // عدد الإجابات الصحيحة المتتالية بدون تلميح لكل عنصر يحتاج تدريب.
  practice: Record<string, number>;
  lastRunId?: string;
}

export const OUTFITS: { id: string; stars: number }[] = [
  { id: 'hat', stars: 9 },
  { id: 'glasses', stars: 30 },
  { id: 'cape', stars: 60 },
  { id: 'crown', stars: 90 },
];

const FIRST_STARS = 3;
const REPLAY_STARS = 1;
const PRACTICE_AFTER_MISTAKES = 2;
const CLEAR_AFTER_CORRECT = 2;

export function emptyProgress(): Progress {
  const completed = Object.fromEntries(ISLAND_IDS.map((id) => [id, [] as number[]])) as Record<IslandId, number[]>;
  return { stars: 0, completed, practice: {} };
}

export function isStageUnlocked(p: Progress, island: IslandId, index: number): boolean {
  return index === 0 || p.completed[island].includes(index - 1);
}

export function completeStage(p: Progress, island: IslandId, index: number, runId: string): Progress {
  if (p.lastRunId === runId) return p;
  const replay = p.completed[island].includes(index);
  return {
    ...p,
    lastRunId: runId,
    stars: p.stars + (replay ? REPLAY_STARS : FIRST_STARS),
    completed: replay ? p.completed : { ...p.completed, [island]: [...p.completed[island], index] },
  };
}

export function recordMistakes(p: Progress, itemId: string, mistakesInStage: number): Progress {
  if (mistakesInStage < PRACTICE_AFTER_MISTAKES) return p;
  return { ...p, practice: { ...p.practice, [itemId]: 0 } };
}

export function recordCorrect(p: Progress, itemId: string, hinted: boolean): Progress {
  if (!(itemId in p.practice)) return p;
  const streak = hinted ? 0 : p.practice[itemId] + 1;
  const practice = { ...p.practice, [itemId]: streak };
  if (streak >= CLEAR_AFTER_CORRECT) delete practice[itemId];
  return { ...p, practice };
}

export function practiceItems(p: Progress, island: IslandId, max: number): string[] {
  return Object.keys(p.practice).filter((id) => getItem(id).island === island).slice(0, max);
}

export function unlockedOutfits(stars: number): string[] {
  return OUTFITS.filter((o) => stars >= o.stars).map((o) => o.id);
}
