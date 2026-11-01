import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import { MatchGame } from './MatchGame';
import { BalloonGame } from './BalloonGame';
import { MixGame } from './MixGame';
import { getItem } from '../content/stages';
import type { Feedback } from '../feedback/feedback';
import type { Item } from '../content/types';

const fb = (): Feedback => ({
  correct: vi.fn(), wrong: vi.fn(), celebrate: vi.fn(), speak: vi.fn(), stop: vi.fn(),
  canSpeak: () => false, hasVoice: () => false, onVoicesChanged: () => () => {},
});
const props = (items: Item[]) => ({
  items, feedback: fb(), reduceMotion: true, onAnswer: vi.fn(), onDone: vi.fn(),
});
const ar = ['ar-1', 'ar-2', 'ar-3'].map(getItem);
const nums = ['num-1', 'num-2', 'num-3'].map(getItem);
const colors = ['red', 'blue', 'yellow'].map(getItem);

function matchAll(items: Item[]) {
  for (const it of items) {
    fireEvent.click(screen.getByTestId(`left-${it.id}`));
    fireEvent.click(screen.getByTestId(`right-${it.id}`));
  }
}

test('match finishes after 3 correct pairs', () => {
  const p = props(ar);
  render(<MatchGame {...p} />);
  matchAll(ar);
  expect(p.onDone).toHaveBeenCalledTimes(1);
  expect(p.onAnswer).toHaveBeenCalledTimes(3);
});
test('match number shows quantity', () => {
  render(<MatchGame {...props(nums)} />);
  expect(within(screen.getByTestId('right-num-3')).getAllByRole('presentation', { hidden: true })).toHaveLength(3);
});
test('match color shows an object of that color', () => {
  render(<MatchGame {...props(colors)} />);
  expect(screen.getByTestId('right-red').querySelector('img')!.getAttribute('src')).toContain('apple');
  expect(screen.getByTestId('left-red').textContent).toContain('●');
});
test('match wrong pair counts as miss and hint after 2', () => {
  const p = props(ar);
  render(<MatchGame {...p} />);
  fireEvent.click(screen.getByTestId('left-ar-1'));
  fireEvent.click(screen.getByTestId('right-ar-2'));
  expect(p.onAnswer).toHaveBeenLastCalledWith('ar-1', { correct: false, hinted: false });
  expect(screen.queryByTestId('hint')).toBeNull();
  fireEvent.click(screen.getByTestId('left-ar-1'));
  fireEvent.click(screen.getByTestId('right-ar-2'));
  expect(screen.getByTestId('right-ar-1').className).toContain('hint');
  fireEvent.click(screen.getByTestId('left-ar-1'));
  fireEvent.click(screen.getByTestId('right-ar-1'));
  expect(p.onAnswer).toHaveBeenLastCalledWith('ar-1', { correct: true, hinted: true });
});

const tapCorrect = () => fireEvent.click(screen.getAllByTestId('balloon-correct')[0]);

test('balloon finishes after exactly 5 correct', () => {
  const p = props(ar);
  render(<BalloonGame {...p} />);
  for (let i = 0; i < 4; i++) tapCorrect();
  expect(p.onDone).not.toHaveBeenCalled();
  tapCorrect();
  expect(p.onDone).toHaveBeenCalledTimes(1);
});
test('double tap on a correct balloon counts once', () => {
  const p = props(ar);
  render(<BalloonGame {...p} />);
  const b = screen.getAllByTestId('balloon-correct')[0];
  fireEvent.click(b);
  fireEvent.click(b);
  expect(p.onAnswer).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId('score').textContent).toContain('1');
});
test('wrong balloon loses nothing and stays', () => {
  const p = props(ar);
  render(<BalloonGame {...p} />);
  tapCorrect();
  const wrong = screen.getAllByTestId('balloon-wrong')[0];
  fireEvent.click(wrong);
  expect(screen.getByTestId('score').textContent).toContain('1');
  expect(p.onAnswer).toHaveBeenLastCalledWith(expect.any(String), { correct: false, hinted: false });
  expect(screen.getAllByTestId('balloon-wrong').length).toBeGreaterThan(0);
});
test('hint appears after 2 wrong attempts', () => {
  const p = props(ar);
  render(<BalloonGame {...p} />);
  fireEvent.click(screen.getAllByTestId('balloon-wrong')[0]);
  expect(screen.queryByTestId('hint')).toBeNull();
  fireEvent.click(screen.getAllByTestId('balloon-wrong')[0]);
  expect(screen.getByTestId('hint')).toBeTruthy();
  tapCorrect();
  expect(p.onAnswer).toHaveBeenLastCalledWith(expect.any(String), { correct: true, hinted: true });
});

test('mix red+yellow shows orange then finishes after two recipes', () => {
  const p = props(colors);
  render(<MixGame {...p} />);
  for (let round = 0; round < 2; round++) {
    const target = screen.getByTestId('mix-target').getAttribute('data-result')!;
    const [a, b] = screen.getByTestId('mix-target').getAttribute('data-parts')!.split(',');
    fireEvent.click(screen.getByTestId(`paint-${a}`));
    fireEvent.click(screen.getByTestId(`paint-${b}`));
    expect(screen.getByTestId('mix-bowl').getAttribute('data-color')).toBe(target);
    fireEvent.click(screen.getByTestId('mix-next'));
  }
  expect(p.onDone).toHaveBeenCalledTimes(1);
});
test('first mix round is red plus yellow equals orange', () => {
  render(<MixGame {...props(colors)} />);
  expect(screen.getByTestId('mix-target').getAttribute('data-result')).toBe('orange');
});
test('wrong paint pair loses nothing and resets', () => {
  const p = props(colors);
  render(<MixGame {...p} />);
  fireEvent.click(screen.getByTestId('paint-blue'));
  fireEvent.click(screen.getByTestId('paint-white'));
  expect(p.onAnswer).toHaveBeenCalledWith('orange', { correct: false, hinted: false });
  expect(screen.getByTestId('mix-bowl').getAttribute('data-color')).toBe('');
});
test('all games complete with sound off', () => {
  const p = props(ar);
  render(<BalloonGame {...p} />);
  for (let i = 0; i < 5; i++) tapCorrect();
  expect(p.feedback.speak).not.toHaveBeenCalled();
  expect(p.onDone).toHaveBeenCalled();
});
