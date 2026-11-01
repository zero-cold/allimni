import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { clear } from 'idb-keyval';
import App from '../App';
import { LearnCard } from './LearnCard';
import { buildRound } from './StageScreen';
import { MEDIA } from '../content/media';
import { getItem } from '../content/stages';
import { saveState, resetMemory, loadState } from '../storage/storage';
import { defaultSettings, type Profile } from '../settings/settings';
import { completeStage, emptyProgress, recordMistakes } from '../progress/progress';
import type { Feedback } from '../feedback/feedback';

const profile = (progress = emptyProgress()): Profile => ({
  id: 'p', name: 'سارة', avatar: 'cat', mode: 'visual',
  settings: defaultSettings('visual', true), progress,
});
const fb = (canSpeak = false): Feedback => ({
  correct: vi.fn(), wrong: vi.fn(), celebrate: vi.fn(), speak: vi.fn(), stop: vi.fn(),
  canSpeak: () => canSpeak, hasVoice: () => canSpeak, onVoicesChanged: () => () => {},
});

beforeEach(async () => { await clear(); resetMemory(); });
afterEach(() => { for (const k of Object.keys(MEDIA)) delete MEDIA[k]; });

async function openMap(p = profile()) {
  await saveState({ version: 1, profiles: [p] });
  render(<App />);
  fireEvent.click(await screen.findByTestId('profile-card-0'));
  await screen.findByTestId('map');
}

function playColorStage() {
  fireEvent.click(screen.getByTestId('stage-color-0'));
  for (let i = 0; i < 3; i++) fireEvent.click(screen.getByTestId('learn-next'));
  for (const id of ['red', 'blue', 'yellow']) {
    fireEvent.click(screen.getByTestId(`left-${id}`));
    fireEvent.click(screen.getByTestId(`right-${id}`));
  }
  for (let i = 0; i < 5; i++) fireEvent.click(screen.getAllByTestId('balloon-correct')[0]);
}

test('map shows 4 open islands and locks later stages', async () => {
  await openMap();
  for (const i of ['ar', 'en', 'num', 'color']) {
    expect(screen.getByTestId(`stage-${i}-0`)).toHaveProperty('disabled', false);
    expect(screen.getByTestId(`stage-${i}-1`)).toHaveProperty('disabled', true);
  }
});
test('stage flow: learn cards, 2 games, celebration, stars saved', async () => {
  await openMap();
  playColorStage();
  expect(screen.getByTestId('celebration')).toBeTruthy();
  expect((await loadState()).profiles[0].progress.stars).toBe(3);
});
test('finish tapped twice awards once', async () => {
  await openMap();
  playColorStage();
  const done = screen.getByTestId('celebration-done');
  fireEvent.click(done);
  fireEvent.click(done);
  expect((await loadState()).profiles[0].progress.stars).toBe(3);
  expect(await screen.findByTestId('companion')).toBeTruthy();
});
test('leaving mid stage saves nothing and restarts', async () => {
  await openMap();
  fireEvent.click(screen.getByTestId('stage-color-0'));
  fireEvent.click(screen.getByTestId('learn-next'));
  fireEvent.click(screen.getByTestId('stage-exit'));
  expect(await screen.findByTestId('map')).toBeTruthy();
  expect((await loadState()).profiles[0].progress.stars).toBe(0);
  fireEvent.click(screen.getByTestId('stage-color-0'));
  expect(screen.getByTestId('learn-card').dataset.item).toBe('red');
});
test('learn card hides sign and mouth without media', () => {
  render(<LearnCard item={getItem('ar-1')} mode="visual" sound={false} feedback={fb()} reduceMotion />);
  expect(screen.queryByTestId('media-sign')).toBeNull();
  expect(screen.queryByTestId('media-mouth')).toBeNull();
});
function firstOf(a: string, b: string) {
  const pos = screen.getByTestId(a).compareDocumentPosition(screen.getByTestId(b));
  return pos & Node.DOCUMENT_POSITION_FOLLOWING;
}
test('visual mode puts sign before speech', () => {
  MEDIA['ar-1'] = { sign: 'sign.mp4', mouth: 'mouth.png' };
  render(<LearnCard item={getItem('ar-1')} mode="visual" sound feedback={fb(true)} reduceMotion />);
  expect(firstOf('media-sign', 'listen')).toBeTruthy();
});
test('partial mode puts speech and mouth before sign', () => {
  MEDIA['ar-1'] = { sign: 'sign.mp4', mouth: 'mouth.png' };
  render(<LearnCard item={getItem('ar-1')} mode="partial" sound feedback={fb(true)} reduceMotion />);
  expect(firstOf('listen', 'media-sign')).toBeTruthy();
  expect(firstOf('media-mouth', 'media-sign')).toBeTruthy();
});
test('listen button hidden when canSpeak is false', () => {
  render(<LearnCard item={getItem('ar-1')} mode="partial" sound feedback={fb(false)} reduceMotion />);
  expect(screen.queryByTestId('listen')).toBeNull();
});
test('listen speaks the word', () => {
  const f = fb(true);
  render(<LearnCard item={getItem('ar-1')} mode="partial" sound feedback={f} reduceMotion />);
  fireEvent.click(screen.getByTestId('listen'));
  expect(f.speak).toHaveBeenCalledWith('أرنب', 'ar');
});
test('English card uses dir ltr', () => {
  render(<LearnCard item={getItem('en-1')} mode="visual" sound={false} feedback={fb()} reduceMotion />);
  expect(screen.getByTestId('learn-word').getAttribute('dir')).toBe('ltr');
});
test('number card shows both forms and count', () => {
  render(<LearnCard item={getItem('num-3')} mode="visual" sound={false} feedback={fb()} reduceMotion />);
  expect(screen.getByTestId('learn-card').textContent).toContain('٣');
  expect(screen.getByTestId('learn-card').textContent).toContain('3');
  expect(screen.getByTestId('learn-card').querySelectorAll('.count-grid img')).toHaveLength(3);
});
test('practice item joins later stage round', () => {
  const p = recordMistakes(completeStage(emptyProgress(), 'ar', 0, 'r'), 'ar-1', 2);
  const ids = buildRound(p, 'ar', 1).map((i) => i.id);
  expect(ids).toEqual(['ar-4', 'ar-5', 'ar-6', 'ar-1']);
});
test('round has no duplicates when practice is already included', () => {
  const p = recordMistakes(emptyProgress(), 'ar-4', 2);
  expect(buildRound(p, 'ar', 1).map((i) => i.id)).toEqual(['ar-4', 'ar-5', 'ar-6']);
});
test('feeding is free and outfits open by stars', async () => {
  const progress = { ...emptyProgress(), stars: 9 };
  await openMap(profile(progress));
  fireEvent.click(screen.getByTestId('open-companion'));
  fireEvent.click(await screen.findByTestId('food-apple'));
  expect((await loadState()).profiles[0].progress.stars).toBe(9);
  expect(screen.getByTestId('outfit-hat')).toHaveProperty('disabled', false);
  expect(screen.getByTestId('outfit-crown')).toHaveProperty('disabled', true);
});
