import { getStrokes } from './strokes';
import { getItems, getItem } from './stages';

test('all ar, en, num items have strokes within the grid', () => {
  for (const island of ['ar', 'en', 'num'] as const) {
    for (const item of getItems(island)) {
      const groups = getStrokes(item);
      expect(groups.length, item.id).toBeGreaterThan(0);
      for (const p of groups.flat(2)) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(100);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(100);
      }
    }
  }
});
test('number 12 has two digit groups', () => {
  expect(getStrokes(getItem('num-12'))).toHaveLength(2);
});
test('dots of ث are single-point strokes', () => {
  const dots = getStrokes(getItem('ar-4'))[0].filter((s) => s.length === 1);
  expect(dots).toHaveLength(3);
});
