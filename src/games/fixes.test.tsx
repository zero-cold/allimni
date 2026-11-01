import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BalloonGame } from './BalloonGame';
import { MatchGame } from './MatchGame';
import { MixGame } from './MixGame';
import { TraceGame } from './TraceGame';
import { getItem, getStages, fillRound, MIX_RECIPES, mixRoundsFor } from '../content/stages';
import { getStrokes } from '../content/strokes';
import { checkStroke } from './traceLogic';
import { createFeedback, type FeedbackEnv } from '../feedback/feedback';
import type { Feedback } from '../feedback/feedback';
import type { Item } from '../content/types';

const fb = (): Feedback => ({
  correct: vi.fn(), wrong: vi.fn(), celebrate: vi.fn(), speak: vi.fn(), stop: vi.fn(),
  canSpeak: () => false, hasVoice: () => false, onVoicesChanged: () => () => {},
});
const props = (items: Item[], reduceMotion = true, feedback: Feedback = fb()) => ({
  items, feedback, reduceMotion, onAnswer: vi.fn(), onDone: vi.fn(),
});
const ar = ['ar-1', 'ar-2', 'ar-3'].map(getItem);

let now = 1_000_000;
beforeEach(() => { now = 1_000_000; vi.spyOn(Date, 'now').mockImplementation(() => now); });
afterEach(() => vi.restoreAllMocks());

test('wrong balloon shows a visual response on that balloon', () => {
  render(<BalloonGame {...props(ar)} />);
  const b = screen.getAllByTestId('balloon-wrong')[0];
  fireEvent.click(b);
  expect(b.className).toContain('wrong');
});
test('physical double tap on balloons counts once', () => {
  const p = props(ar);
  render(<BalloonGame {...p} />);
  fireEvent.click(screen.getByTestId('balloon-correct'));
  fireEvent.click(screen.getByTestId('balloon-correct'));
  expect(p.onAnswer).toHaveBeenCalledTimes(1);
  now += 400;
  fireEvent.click(screen.getByTestId('balloon-correct'));
  expect(p.onAnswer).toHaveBeenCalledTimes(2);
});
test('second tap of a double tap never logs a wrong answer', () => {
  const p = props(ar);
  render(<BalloonGame {...p} />);
  fireEvent.click(screen.getByTestId('balloon-correct'));
  fireEvent.click(screen.getAllByTestId('balloon-wrong')[0]);
  expect(p.onAnswer).toHaveBeenCalledTimes(1);
});

test('match accepts a picture tapped first', () => {
  const p = props(ar);
  render(<MatchGame {...p} />);
  fireEvent.click(screen.getByTestId('right-ar-1'));
  fireEvent.click(screen.getByTestId('left-ar-1'));
  expect(p.onAnswer).toHaveBeenCalledWith('ar-1', { correct: true, hinted: false });
});
test('match hint comes after 2 misses across different tiles', () => {
  const p = props(ar);
  render(<MatchGame {...p} />);
  fireEvent.click(screen.getByTestId('left-ar-1'));
  fireEvent.click(screen.getByTestId('right-ar-2'));
  fireEvent.click(screen.getByTestId('left-ar-2'));
  fireEvent.click(screen.getByTestId('right-ar-3'));
  expect(document.querySelectorAll('.tile.hint').length).toBeGreaterThan(0);
});

test('all four mix recipes are reachable from color stages', () => {
  const seen = getStages('color').flatMap((s) => mixRoundsFor(fillRound('color', s.index, 3)[0].id));
  expect(new Set(seen.map((r) => r.result))).toEqual(new Set(MIX_RECIPES.map((r) => r.result)));
});
test('mix round of stage with green teaches orange and green', () => {
  render(<MixGame {...props(fillRound('color', 1, 3))} />);
  expect(screen.getByTestId('mix-target').getAttribute('data-result')).toBe('orange');
  expect(mixRoundsFor('green').map((r) => r.result)).toEqual(['orange', 'green']);
  expect(mixRoundsFor('pink').map((r) => r.result)).toEqual(['purple', 'pink']);
});

function pad() {
  const el = screen.getByTestId('trace-pad');
  el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 100 } as DOMRect);
  return el;
}
function drawStroke(pointerId = 1) {
  const el = pad();
  const stroke: { x: number; y: number }[] = JSON.parse(el.dataset.stroke!);
  fireEvent.pointerDown(el, { pointerId, clientX: stroke[0].x, clientY: stroke[0].y });
  for (const p of stroke) fireEvent.pointerMove(el, { pointerId, clientX: p.x, clientY: p.y });
  fireEvent.pointerUp(el, { pointerId });
}
const scribble = () => {
  const el = pad();
  fireEvent.pointerDown(el, { pointerId: 1, clientX: 99, clientY: 99 });
  fireEvent.pointerUp(el, { pointerId: 1 });
};

test('trace completes every stroke including dots and digits', () => {
  const items = ['ar-4', 'en-1', 'num-12'].map(getItem);
  const p = props(items);
  render(<TraceGame {...p} />);
  const total = items.flatMap(getStrokes).flat().length;
  for (let i = 0; i < total; i++) drawStroke();
  expect(p.onDone).toHaveBeenCalledTimes(1);
});
test('a resting palm does not break tracing', () => {
  const p = props([getItem('ar-8')]);
  render(<TraceGame {...p} />);
  const el = pad();
  const stroke: { x: number; y: number }[] = JSON.parse(el.dataset.stroke!);
  fireEvent.pointerDown(el, { pointerId: 1, clientX: stroke[0].x, clientY: stroke[0].y });
  fireEvent.pointerDown(el, { pointerId: 2, clientX: 95, clientY: 95 });
  for (const q of stroke) fireEvent.pointerMove(el, { pointerId: 1, clientX: q.x, clientY: q.y });
  fireEvent.pointerUp(el, { pointerId: 2 });
  expect(p.onAnswer).not.toHaveBeenCalled();
  fireEvent.pointerUp(el, { pointerId: 1 });
  expect(p.onDone).toHaveBeenCalled();
});
test('trace still hint is drawn in place of the stroke', () => {
  render(<TraceGame {...props([getItem('en-9')])} />);
  scribble(); scribble();
  const hint = screen.getByTestId('hint');
  expect(hint.tagName.toLowerCase()).toBe('path');
  expect(hint.getAttribute('d')).toContain('M');
});
test('trace still hint exists for a dot stroke', () => {
  render(<TraceGame {...props([getItem('ar-1')])} />);
  drawStroke();
  scribble(); scribble();
  const hint = screen.getByTestId('hint');
  expect(hint.getAttribute('cx')).toBe('50');
});

test('checkStroke accepts sparse samples along the path', () => {
  const line = [{ x: 10, y: 50 }, { x: 50, y: 80 }, { x: 90, y: 50 }];
  expect(checkStroke(line, [{ x: 10, y: 50 }, { x: 90, y: 50 }, ])).toBe(false);
  const bent = [{ x: 10, y: 50 }, { x: 50, y: 50 }, { x: 90, y: 50 }];
  expect(checkStroke(bent, [{ x: 10, y: 50 }, { x: 90, y: 50 }])).toBe(true);
});
test('a single tap does not complete a small closed stroke', () => {
  const zero = getStrokes(getItem('num-10'))[1][0];
  expect(checkStroke(zero, [{ x: 50, y: 50 }])).toBe(false);
});

test('every game finishes silently with a real sound-off feedback', () => {
  const log: string[] = [];
  const env: FeedbackEnv = {
    speak: (u) => log.push(u.text), cancelSpeech() {}, voiceLangs: () => ['ar-SA'],
    onVoices: () => () => {}, tone: (k) => log.push(k),
  };
  const silent = createFeedback({ sound: false, speechRate: 'normal', vibration: false, reduceMotion: true }, env);
  const p = props(ar, true, silent);
  const { unmount } = render(<BalloonGame {...p} />);
  for (let i = 0; i < 5; i++) { fireEvent.click(screen.getByTestId('balloon-correct')); now += 400; }
  unmount();
  const m = render(<MatchGame {...p} />);
  for (const it of ar) { fireEvent.click(screen.getByTestId(`left-${it.id}`)); fireEvent.click(screen.getByTestId(`right-${it.id}`)); }
  m.unmount();
  const t = render(<TraceGame {...p} items={[getItem('ar-8')]} />);
  drawStroke();
  t.unmount();
  const colors = ['red', 'blue', 'yellow'].map(getItem);
  render(<MixGame {...p} items={colors} />);
  fireEvent.click(screen.getByTestId('paint-red'));
  fireEvent.click(screen.getByTestId('paint-yellow'));
  fireEvent.click(screen.getByTestId('mix-next'));
  expect(p.onDone).toHaveBeenCalledTimes(3);
  expect(log).toEqual([]);
});
