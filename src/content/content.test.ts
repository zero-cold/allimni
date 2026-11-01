import { getItems, getItem, getStages, gamesForStage, fillRound, MIX_RECIPES } from './stages';
import { MEDIA } from './media';
import type { IslandId } from './types';

const islands: IslandId[] = ['ar', 'en', 'num', 'color'];

test('item counts', () => {
  expect(getItems('ar')).toHaveLength(28);
  expect(getItems('en')).toHaveLength(26);
  expect(getItems('num')).toHaveLength(20);
  expect(getItems('color')).toHaveLength(10);
});
test('stage counts', () => {
  expect(getStages('ar')).toHaveLength(10);
  expect(getStages('en')).toHaveLength(9);
  expect(getStages('num')).toHaveLength(7);
  expect(getStages('color')).toHaveLength(4);
});
test('stages cover each item once', () => {
  for (const i of islands) {
    const ids = getStages(i).flatMap((s) => s.itemIds);
    expect(ids).toEqual(getItems(i).map((x) => x.id));
    expect(new Set(ids).size).toBe(ids.length);
  }
});
test('two different games from the island', () => {
  for (const i of islands) {
    getStages(i).forEach((s) => {
      const [a, b] = gamesForStage(i, s.index);
      expect(a).not.toBe(b);
      if (i === 'color') expect([a, b]).not.toContain('trace');
      else expect([a, b]).not.toContain('mix');
    });
  }
});
test('every game appears in each island', () => {
  const seen = new Set(getStages('color').flatMap((s) => gamesForStage('color', s.index)));
  expect(seen).toEqual(new Set(['match', 'balloon', 'mix']));
});
test('fillRound completes short last stage', () => {
  const round = fillRound('ar', 9, 3);
  expect(round).toHaveLength(3);
  expect(new Set(round.map((i) => i.id)).size).toBe(3);
  expect(round.map((i) => i.id)).toContain(getStages('ar')[9].itemIds[0]);
});
test('every color has unique symbol and hex', () => {
  const colors = getItems('color');
  expect(new Set(colors.map((c) => c.symbol)).size).toBe(10);
  expect(new Set(colors.map((c) => c.colorHex)).size).toBe(10);
});
test('numbers carry both forms and count', () => {
  const twelve = getItem('num-12');
  expect(twelve).toMatchObject({ display: '12', altDisplay: '١٢', count: 12 });
});
test('words from spec', () => {
  expect(getItem('ar-1').word).toBe('أرنب');
  expect(getItem('ar-28').word).toBe('يد');
  expect(getItem('en-24').word).toBe('Fox');
  expect(getItem('en-26').word).toBe('Zebra');
});
test('mix recipes match spec', () => {
  expect(MIX_RECIPES).toEqual([
    { a: 'red', b: 'yellow', result: 'orange' },
    { a: 'blue', b: 'yellow', result: 'green' },
    { a: 'red', b: 'blue', result: 'purple' },
    { a: 'red', b: 'white', result: 'pink' },
  ]);
});
test('media starts empty', () => expect(MEDIA).toEqual({}));
