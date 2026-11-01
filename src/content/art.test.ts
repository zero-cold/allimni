import { existsSync } from 'node:fs';
import { ITEMS } from './items';
import { OUTFITS } from '../progress/progress';
import { AVATARS, FOODS } from './art';

test('every item art exists', () => {
  const missing = [...new Set(ITEMS.map((i) => i.art))].filter((a) => !existsSync(`public/art/${a}.svg`));
  expect(missing).toEqual([]);
});
test('avatars, foods and companion art exist', () => {
  for (const a of [...AVATARS, ...FOODS, 'owl', ...OUTFITS.map((o) => o.id)]) expect(existsSync(`public/art/${a}.svg`)).toBe(true);
});
