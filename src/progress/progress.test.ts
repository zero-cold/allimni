import {
  emptyProgress, isStageUnlocked, completeStage, recordMistakes, recordCorrect,
  practiceItems, unlockedOutfits,
} from './progress';

test('first stage open, next opens after completion', () => {
  let p = emptyProgress();
  expect(isStageUnlocked(p, 'ar', 0)).toBe(true);
  expect(isStageUnlocked(p, 'ar', 1)).toBe(false);
  p = completeStage(p, 'ar', 0, 'r1');
  expect(isStageUnlocked(p, 'ar', 1)).toBe(true);
  expect(isStageUnlocked(p, 'en', 0)).toBe(true);
  expect(isStageUnlocked(p, 'en', 1)).toBe(false);
});
test('3 stars first, 1 on replay', () => {
  let p = completeStage(emptyProgress(), 'ar', 0, 'r1');
  expect(p.stars).toBe(3);
  p = completeStage(p, 'ar', 0, 'r2');
  expect(p.stars).toBe(4);
});
test('same run counts once', () => {
  let p = completeStage(emptyProgress(), 'ar', 0, 'r1');
  p = completeStage(p, 'ar', 0, 'r1');
  expect(p.stars).toBe(3);
});
test('needs practice after 2 mistakes only', () => {
  expect(recordMistakes(emptyProgress(), 'ar-1', 1).practice).toEqual({});
  expect(recordMistakes(emptyProgress(), 'ar-1', 2).practice).toEqual({ 'ar-1': 0 });
});
test('practice clears after 2 correct in a row without hint', () => {
  let p = recordMistakes(emptyProgress(), 'ar-1', 2);
  p = recordCorrect(p, 'ar-1', false);
  p = recordCorrect(p, 'ar-1', true);
  expect(p.practice['ar-1']).toBe(0);
  p = recordCorrect(p, 'ar-1', false);
  p = recordCorrect(p, 'ar-1', false);
  expect(p.practice['ar-1']).toBeUndefined();
});
test('recordCorrect ignores items outside practice', () => {
  expect(recordCorrect(emptyProgress(), 'ar-1', false).practice).toEqual({});
});
test('stars never decrease from mistakes', () => {
  const p = completeStage(emptyProgress(), 'ar', 0, 'r1');
  expect(recordMistakes(p, 'ar-1', 5).stars).toBe(3);
});
test('interrupted stage leaves no partial state', () => {
  const p = recordCorrect(recordMistakes(emptyProgress(), 'ar-1', 2), 'ar-1', false);
  expect(p.completed.ar).toEqual([]);
  expect(p.stars).toBe(0);
});
test('practiceItems filters by island and caps', () => {
  let p = emptyProgress();
  for (const id of ['ar-1', 'ar-2', 'ar-3', 'en-1']) p = recordMistakes(p, id, 2);
  expect(practiceItems(p, 'ar', 2)).toEqual(['ar-1', 'ar-2']);
  expect(practiceItems(p, 'en', 2)).toEqual(['en-1']);
});
test('outfit thresholds', () => {
  expect(unlockedOutfits(8)).toEqual([]);
  expect(unlockedOutfits(9)).toHaveLength(1);
  expect(unlockedOutfits(90)).toHaveLength(4);
});
