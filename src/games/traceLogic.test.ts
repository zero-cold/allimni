import { checkStroke } from './traceLogic';

const line = [{ x: 10, y: 50 }, { x: 50, y: 50 }, { x: 90, y: 50 }];

test('accepts points in order within margin', () => {
  expect(checkStroke(line, line.map((p) => ({ x: p.x + 8, y: p.y })))).toBe(true);
});
test('rejects reversed order', () => {
  expect(checkStroke(line, [...line].reverse())).toBe(false);
});
test('rejects a path far away', () => {
  expect(checkStroke(line, line.map((p) => ({ x: p.x, y: p.y + 40 })))).toBe(false);
});
test('rejects a partial path', () => {
  expect(checkStroke(line, line.slice(0, 2))).toBe(false);
});
test('single point stroke accepts a tap', () => {
  expect(checkStroke([{ x: 50, y: 50 }], [{ x: 55, y: 45 }])).toBe(true);
});
