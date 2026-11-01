import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { clear } from 'idb-keyval';
import App from '../App';
import { saveState, resetMemory, loadState } from '../storage/storage';
import { defaultSettings, type Profile } from '../settings/settings';
import { completeStage, emptyProgress, recordMistakes } from '../progress/progress';

const profile = (id: string): Profile => ({
  id, name: `طفل ${id}`, avatar: 'cat', mode: 'visual',
  settings: defaultSettings('visual', false),
  progress: recordMistakes(completeStage(emptyProgress(), 'ar', 0, 'r'), 'ar-2', 2),
});

beforeEach(async () => { await clear(); resetMemory(); });
afterEach(() => vi.restoreAllMocks());

async function passGate() {
  const q = await screen.findByTestId('gate-question');
  const [a, b] = q.textContent!.match(/\d+/g)!.map(Number);
  fireEvent.change(screen.getByTestId('gate-answer'), { target: { value: String(a * b) } });
  fireEvent.click(screen.getByTestId('gate-submit'));
}
async function openParent(profiles = [profile('1'), profile('2')]) {
  await saveState({ version: 1, profiles });
  render(<App />);
  await screen.findByTestId('profile-card-0');
  fireEvent.click(screen.getByTestId('open-parent'));
  await passGate();
  await screen.findByTestId('parent');
}

test('needs the gate', async () => {
  await saveState({ version: 1, profiles: [profile('1')] });
  render(<App />);
  await screen.findByTestId('profile-card-0');
  fireEvent.click(screen.getByTestId('open-parent'));
  expect(await screen.findByTestId('gate-question')).toBeTruthy();
  expect(screen.queryByTestId('parent')).toBeNull();
});
test('shows per island progress and practice items', async () => {
  await openParent();
  expect(screen.getByTestId('progress-1-ar').textContent).toContain('1 / 10');
  expect(screen.getByTestId('progress-1-color').textContent).toContain('0 / 4');
  expect(screen.getByTestId('practice-1').textContent).toContain('ب');
});
test('settings change saves per child', async () => {
  await openParent();
  fireEvent.click(screen.getByTestId('sound-1'));
  await waitFor(async () => {
    const s = await loadState();
    expect(s.profiles[0].settings.sound).toBe(true);
    expect(s.profiles[1].settings.sound).toBe(false);
  });
});
test('mode change resets defaults, later edits stay individual', async () => {
  await openParent();
  fireEvent.click(screen.getByTestId('vibration-1'));
  fireEvent.click(screen.getByTestId('mode-partial-1'));
  await waitFor(async () => {
    const p = (await loadState()).profiles[0];
    expect(p.mode).toBe('partial');
    expect(p.settings).toMatchObject({ sound: true, vibration: true });
  });
  fireEvent.click(screen.getByTestId('sound-1'));
  await waitFor(async () => {
    const p = (await loadState()).profiles[0];
    expect(p.mode).toBe('partial');
    expect(p.settings.sound).toBe(false);
  });
});
test('delete needs confirmation', async () => {
  await openParent();
  fireEvent.click(screen.getByTestId('delete-1'));
  fireEvent.click(screen.getByTestId('delete-cancel'));
  expect((await loadState()).profiles).toHaveLength(2);
  fireEvent.click(screen.getByTestId('delete-1'));
  fireEvent.click(screen.getByTestId('delete-confirm'));
  await waitFor(async () => expect((await loadState()).profiles).toHaveLength(1));
});
test('deleting active profile returns to profiles', async () => {
  await saveState({ version: 1, profiles: [profile('1'), profile('2')] });
  render(<App />);
  fireEvent.click(await screen.findByTestId('profile-card-0'));
  fireEvent.click(await screen.findByTestId('open-parent'));
  await passGate();
  fireEvent.click(await screen.findByTestId('delete-1'));
  fireEvent.click(screen.getByTestId('delete-confirm'));
  expect(await screen.findByTestId('profile-card-0')).toBeTruthy();
  expect(screen.queryByTestId('map')).toBeNull();
});
test('deleting last profile returns to first run', async () => {
  await openParent([profile('1')]);
  fireEvent.click(screen.getByTestId('delete-1'));
  fireEvent.click(screen.getByTestId('delete-confirm'));
  expect(await screen.findByTestId('gate-question')).toBeTruthy();
});
test('warns when arabic voice missing', async () => {
  await openParent();
  expect(screen.getByTestId('voice-warning').textContent).toContain('العربية');
});
test('warns when saving failed', async () => {
  await openParent();
  vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => { throw new Error('blocked'); });
  fireEvent.click(screen.getByTestId('sound-1'));
  expect(await screen.findByTestId('save-warning')).toBeTruthy();
});
test('explains data stays on this device', async () => {
  await openParent();
  expect(screen.getByTestId('data-note').textContent).toContain('هذا الجهاز');
});
