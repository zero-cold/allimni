import { createFeedback, type FeedbackEnv } from './feedback';
import type { Settings } from '../settings/settings';

const base: Settings = { sound: false, speechRate: 'normal', vibration: true, reduceMotion: false };

function fakeEnv(opts: { voices?: string[]; noVibrate?: boolean } = {}) {
  let voices = opts.voices ?? [];
  const listeners = new Set<() => void>();
  const log = {
    spoken: [] as { text: string; lang: string; rate: number }[],
    tones: [] as string[], vibrations: [] as (number | number[])[], cancels: 0,
  };
  const env: FeedbackEnv = {
    speak: (u) => log.spoken.push(u),
    cancelSpeech: () => { log.cancels++; },
    voiceLangs: () => voices,
    onVoices: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    vibrate: opts.noVibrate ? undefined : (p) => log.vibrations.push(p),
    tone: (k) => log.tones.push(k),
  };
  return { env, log, setVoices: (v: string[]) => { voices = v; listeners.forEach((f) => f()); } };
}

test('sound off is fully silent', () => {
  const { env, log } = fakeEnv({ voices: ['ar-SA'] });
  const f = createFeedback({ ...base, sound: false }, env);
  f.correct(); f.wrong(); f.celebrate(); f.speak('باء', 'ar');
  expect(log.spoken).toEqual([]);
  expect(log.tones).toEqual([]);
});
test('sound on speaks at chosen rate', () => {
  const { env, log } = fakeEnv({ voices: ['ar-SA'] });
  createFeedback({ ...base, sound: true, speechRate: 'slow' }, env).speak('باء', 'ar');
  expect(log.spoken[0]).toMatchObject({ text: 'باء', lang: 'ar', rate: 0.6 });
});
test('sound on plays tones', () => {
  const { env, log } = fakeEnv();
  createFeedback({ ...base, sound: true }, env).correct();
  expect(log.tones).toEqual(['correct']);
});
test('missing vibration does not throw', () => {
  const { env } = fakeEnv({ noVibrate: true });
  expect(() => createFeedback(base, env).correct()).not.toThrow();
});
test('vibration patterns follow spec setting', () => {
  const on = fakeEnv();
  const f = createFeedback(base, on.env);
  f.correct(); f.wrong();
  expect(on.log.vibrations).toEqual([40, [30, 40, 30]]);
  const off = fakeEnv();
  createFeedback({ ...base, vibration: false }, off.env).correct();
  expect(off.log.vibrations).toEqual([]);
});
test('canSpeak reflects voices, updates late', () => {
  const { env, setVoices } = fakeEnv({ voices: [] });
  const f = createFeedback({ ...base, sound: true }, env);
  const changed = vi.fn();
  f.onVoicesChanged(changed);
  expect(f.canSpeak('ar')).toBe(false);
  setVoices(['ar-EG']);
  expect(f.canSpeak('ar')).toBe(true);
  expect(f.canSpeak('en')).toBe(false);
  expect(changed).toHaveBeenCalled();
});
test('canSpeak false when sound off', () => {
  const { env } = fakeEnv({ voices: ['ar-SA'] });
  expect(createFeedback({ ...base, sound: false }, env).canSpeak('ar')).toBe(false);
});
test('stop cancels speech', () => {
  const { env, log } = fakeEnv();
  createFeedback(base, env).stop();
  expect(log.cancels).toBe(1);
});
test('speak does nothing without a matching voice', () => {
  const { env, log } = fakeEnv({ voices: ['en-US'] });
  createFeedback({ ...base, sound: true }, env).speak('باء', 'ar');
  expect(log.spoken).toEqual([]);
});
