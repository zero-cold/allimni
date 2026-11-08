import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { clear } from 'idb-keyval';
import App from '../App';
import { LearnCard } from './LearnCard';
import { gamesFor } from './StageScreen';
import { AVAILABLE_RECORDINGS } from '../content/recordings';
import { getItem } from '../content/stages';
import { saveState, resetMemory, loadState } from '../storage/storage';
import { defaultSettings, type HearingMode, type Profile } from '../settings/settings';
import { emptyProgress } from '../progress/progress';
import type { Feedback } from '../feedback/feedback';

const profile = (mode: HearingMode = 'visual'): Profile => ({
  id: 'p', name: 'سارة', avatar: 'cat', mode, settings: defaultSettings(mode, true), progress: emptyProgress(),
});
const fb = (): Feedback => ({
  correct: vi.fn(), wrong: vi.fn(), celebrate: vi.fn(), speak: vi.fn(), stop: vi.fn(),
  canSpeak: () => false, hasVoice: () => false, onVoicesChanged: () => () => {},
});

beforeEach(async () => { await clear(); resetMemory(); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

async function openMap(p = profile(), extra: object = {}) {
  await saveState({ version: 1, profiles: [p], ...extra });
  render(<App />);
  fireEvent.click(await screen.findByTestId('profile-card-0'));
  await screen.findByTestId('map');
}
async function passGate() {
  const q = await screen.findByTestId('gate-question');
  const [a, b] = q.textContent!.match(/\d+/g)!.map(Number);
  fireEvent.change(screen.getByTestId('gate-answer'), { target: { value: String(a * b) } });
  fireEvent.click(screen.getByTestId('gate-submit'));
}

test('map shows all eight islands', async () => {
  await openMap();
  for (const i of ['ar', 'en', 'num', 'color', 'shape', 'animal', 'food', 'place']) {
    expect(screen.getByTestId(`stage-${i}-0`)).toHaveProperty('disabled', false);
  }
});
test('talk board shows sections and enlarges a card', async () => {
  await openMap();
  fireEvent.click(screen.getByTestId('open-talk'));
  expect(screen.getAllByTestId(/^talk-card-/)).toHaveLength(16);
  fireEvent.click(screen.getByTestId('talk-tab-feel'));
  expect(screen.getAllByTestId(/^talk-card-/)).toHaveLength(8);
  fireEvent.click(screen.getByTestId('talk-card-feel-happy'));
  expect(screen.getByTestId('talk-big').textContent).toContain('مستانس');
  fireEvent.click(screen.getByTestId('talk-close'));
  expect(screen.queryByTestId('talk-big')).toBeNull();
});
test('family card shows the family photo when one is saved', async () => {
  await openMap(profile(), { photos: { 'family-mama': 'data:image/png;base64,AAAA' } });
  fireEvent.click(screen.getByTestId('open-talk'));
  fireEvent.click(screen.getByTestId('talk-tab-family'));
  expect(screen.getByTestId('talk-card-family-mama').querySelector('img')!.getAttribute('src')).toContain('data:image/png');
});
test('parent saves a family photo on this device', async () => {
  await openMap();
  fireEvent.click(screen.getByTestId('open-parent'));
  await passGate();
  const file = new File(['x'], 'mama.png', { type: 'image/png' });
  fireEvent.change(screen.getByTestId('photo-family-mama'), { target: { files: [file] } });
  await waitFor(async () => expect((await loadState()).photos?.['family-mama']).toMatch(/^data:/));
});
test('stories open and page through to the end', async () => {
  await openMap();
  fireEvent.click(screen.getByTestId('open-stories'));
  fireEvent.click(screen.getByTestId('story-owl-sea'));
  expect(screen.getByTestId('story-page').textContent).toContain('صباح الخير');
  for (let i = 0; i < 4; i++) fireEvent.click(screen.getByTestId('story-next'));
  fireEvent.click(screen.getByTestId('story-next'));
  expect(await screen.findByTestId('stories')).toBeTruthy();
});
test('word islands show the picture and word instead of a giant glyph', () => {
  render(<LearnCard item={getItem('food-1')} mode="visual" sound={false} feedback={fb()} reduceMotion />);
  expect(screen.getByTestId('learn-card').querySelector('.learn-glyph')).toBeNull();
  expect(screen.getByTestId('learn-word').textContent).toBe('مجبوس');
});
test('a recording plays instead of the device voice', () => {
  const play = vi.fn(() => Promise.resolve());
  vi.stubGlobal('Audio', vi.fn(function (this: { play: typeof play; pause: () => void }) { this.play = play; this.pause = () => {}; }));
  AVAILABLE_RECORDINGS.add(43);
  const f = fb();
  render(<LearnCard item={getItem('ar-1')} mode="partial" sound feedback={f} reduceMotion />);
  fireEvent.click(screen.getByTestId('listen'));
  expect(play).toHaveBeenCalled();
  expect(f.speak).not.toHaveBeenCalled();
  AVAILABLE_RECORDINGS.delete(43);
});
test('speech practice is added only for children who hear partly', () => {
  expect(gamesFor(profile('visual'), 'ar', 0)).toEqual(['trace', 'match']);
  expect(gamesFor(profile('partial'), 'ar', 0)).toEqual(['trace', 'match', 'say']);
});
