import { render, screen, fireEvent } from '@testing-library/react';
import { clear } from 'idb-keyval';
import App from '../App';
import { saveState, resetMemory, loadState } from '../storage/storage';
import { makeGateQuestion } from './ParentGate';
import { defaultSettings, type Profile } from '../settings/settings';
import { emptyProgress } from '../progress/progress';

const profile = (id: string): Profile => ({
  id, name: `طفل ${id}`, avatar: 'cat', mode: 'visual',
  settings: defaultSettings('visual', false), progress: emptyProgress(),
});

beforeEach(async () => { await clear(); resetMemory(); });

async function passGate() {
  const q = await screen.findByTestId('gate-question');
  const [a, b] = q.textContent!.match(/\d+/g)!.map(Number);
  fireEvent.change(screen.getByTestId('gate-answer'), { target: { value: String(a * b) } });
  fireEvent.click(screen.getByTestId('gate-submit'));
}

test('first run goes through gate to create profile', async () => {
  render(<App />);
  await passGate();
  expect(await screen.findByTestId('profile-name')).toBeTruthy();
});
test('gate rejects wrong answer', async () => {
  render(<App />);
  const q = await screen.findByTestId('gate-question');
  fireEvent.change(screen.getByTestId('gate-answer'), { target: { value: '0' } });
  fireEvent.click(screen.getByTestId('gate-submit'));
  expect(q).toBeTruthy();
  expect(screen.queryByTestId('profile-name')).toBeNull();
  expect(screen.getByTestId('gate-answer')).toHaveProperty('value', '');
});
test('gate question is simple multiplication', () => {
  for (const r of [0, 0.5, 0.999]) {
    const q = makeGateQuestion(() => r);
    expect(q.a).toBeGreaterThanOrEqual(2);
    expect(q.b).toBeLessThanOrEqual(9);
    expect(q.answer).toBe(q.a * q.b);
  }
});
test('creating profile applies mode defaults', async () => {
  render(<App />);
  await passGate();
  fireEvent.change(await screen.findByTestId('profile-name'), { target: { value: 'سارة' } });
  fireEvent.click(screen.getByTestId('mode-visual'));
  fireEvent.click(screen.getByTestId('profile-save'));
  await screen.findByTestId('profile-card-0');
  const s = await loadState();
  expect(s.profiles[0]).toMatchObject({ name: 'سارة', mode: 'visual', settings: { sound: false } });
});
test('blank name cannot be saved', async () => {
  render(<App />);
  await passGate();
  fireEvent.change(await screen.findByTestId('profile-name'), { target: { value: '   ' } });
  expect(screen.getByTestId('profile-save')).toHaveProperty('disabled', true);
});
test('add profile hidden at 6', async () => {
  await saveState({ version: 1, profiles: ['1', '2', '3', '4', '5', '6'].map(profile) });
  render(<App />);
  await screen.findByTestId('profile-card-5');
  expect(screen.queryByTestId('profile-add')).toBeNull();
});
test('child picks profile without password', async () => {
  await saveState({ version: 1, profiles: [profile('1')] });
  render(<App />);
  fireEvent.click(await screen.findByTestId('profile-card-0'));
  expect(await screen.findByTestId('map')).toBeTruthy();
});
