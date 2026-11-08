import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { WordGame } from './WordGame';
import { SayGame, type Mic } from './SayGame';
import { getItem } from '../content/stages';
import type { Feedback } from '../feedback/feedback';

const fb = (): Feedback => ({
  correct: vi.fn(), wrong: vi.fn(), celebrate: vi.fn(), speak: vi.fn(), stop: vi.fn(),
  canSpeak: () => false, hasVoice: () => false, onVoicesChanged: () => () => {},
});
const items = ['ar-16', 'ar-17', 'ar-18'].map(getItem);
const props = () => ({ items, feedback: fb(), reduceMotion: true, onAnswer: vi.fn(), onDone: vi.fn() });

const target = () => JSON.parse(screen.getByTestId('word-target').dataset.letters!) as string[];
const tileFor = (letter: string) =>
  screen.getAllByTestId(/^letter-/).find((t) => t.dataset.letter === letter && !(t as HTMLButtonElement).disabled)!;

test('word game builds words letter by letter and finishes after three', () => {
  const p = props();
  render(<WordGame {...p} />);
  for (let w = 0; w < 3; w++) {
    const letters = target();
    letters.forEach((l, i) => {
      fireEvent.click(tileFor(l));
      expect(screen.getByTestId('word-built').textContent).toBe(letters.slice(0, i + 1).join(''));
    });
    if (w < 2) fireEvent.click(screen.getByTestId('word-next'));
  }
  expect(p.onDone).toHaveBeenCalledTimes(1);
});
test('a wrong letter changes nothing and the hint appears after two', () => {
  const p = props();
  render(<WordGame {...p} />);
  const letters = target();
  const wrong = screen.getAllByTestId(/^letter-/).find((t) => !letters.includes(t.dataset.letter!))!;
  fireEvent.click(wrong);
  expect(screen.getByTestId('word-built').textContent).toBe('');
  expect(document.querySelector('.tile.hint')).toBeNull();
  fireEvent.click(wrong);
  expect(tileFor(letters[0]).className).toContain('hint');
});

function fakeMic(level: number): { open: () => Promise<Mic>; stop: ReturnType<typeof vi.fn> } {
  const stop = vi.fn();
  return { open: () => Promise.resolve({ level: () => level, stop }), stop };
}

test('say game counts sustained voice and finishes after three items', async () => {
  vi.useFakeTimers();
  const p = props();
  const mic = fakeMic(0.5);
  render(<SayGame {...p} openMic={mic.open} />);
  await act(async () => { await Promise.resolve(); });
  for (let i = 0; i < 3; i++) {
    act(() => { vi.advanceTimersByTime(1600); });
    if (i < 2) fireEvent.click(screen.getByTestId('say-next'));
  }
  expect(p.onDone).toHaveBeenCalledTimes(1);
  expect(p.onAnswer).toHaveBeenCalledWith('ar-16', { correct: true, hinted: false });
  vi.useRealTimers();
});
test('silence does not count', async () => {
  vi.useFakeTimers();
  const p = props();
  render(<SayGame {...p} openMic={fakeMic(0).open} />);
  await act(async () => { await Promise.resolve(); });
  act(() => { vi.advanceTimersByTime(5000); });
  expect(screen.queryByTestId('say-next')).toBeNull();
  expect(p.onDone).not.toHaveBeenCalled();
  vi.useRealTimers();
});
test('without a microphone the child can skip without penalty', async () => {
  const p = props();
  render(<SayGame {...p} openMic={() => Promise.reject(new Error('denied'))} />);
  fireEvent.click(await screen.findByTestId('say-skip'));
  expect(p.onDone).toHaveBeenCalledTimes(1);
  expect(p.onAnswer).not.toHaveBeenCalled();
});
test('microphone stops when the game closes', async () => {
  const mic = fakeMic(0.5);
  const { unmount } = render(<SayGame {...props()} openMic={mic.open} />);
  await act(async () => { await Promise.resolve(); });
  unmount();
  expect(mic.stop).toHaveBeenCalled();
});
