import { defaultSettings, addProfile, MAX_PROFILES, type AppState, type Profile } from './settings';
import { emptyProgress } from '../progress/progress';

const profile = (id: string): Profile => ({
  id, name: id, avatar: 'cat', mode: 'visual',
  settings: defaultSettings('visual', false), progress: emptyProgress(),
});

test('mode defaults', () => {
  expect(defaultSettings('visual', false)).toMatchObject({ sound: false, vibration: true, speechRate: 'slow' });
  expect(defaultSettings('partial', false)).toMatchObject({ sound: true, vibration: true });
  expect(defaultSettings('visual', true).reduceMotion).toBe(true);
  expect(defaultSettings('visual', false).reduceMotion).toBe(false);
});
test('seventh profile rejected', () => {
  const s: AppState = { version: 1, profiles: Array.from({ length: MAX_PROFILES }, (_, i) => profile(`p${i}`)) };
  expect(MAX_PROFILES).toBe(6);
  expect(() => addProfile(s, profile('x'))).toThrow();
});
test('addProfile appends', () => {
  expect(addProfile({ version: 1, profiles: [] }, profile('a')).profiles).toHaveLength(1);
});
