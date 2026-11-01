import { vi } from 'vitest';
import { set, clear } from 'idb-keyval';
import { loadState, saveState, resetMemory, STATE_KEY } from './storage';

beforeEach(async () => {
  await clear();
  resetMemory();
});
afterEach(() => vi.restoreAllMocks());

const state = { version: 1 as const, profiles: [] };

test('state round trips', async () => {
  const s = { ...state, profiles: [{ id: 'a', name: 'n' } as never] };
  expect(await saveState(s)).toBe(true);
  resetMemory();
  expect((await loadState()).profiles[0]).toMatchObject({ id: 'a', name: 'n' });
});
test('no data gives empty state', async () => {
  expect(await loadState()).toEqual({ version: 1, profiles: [] });
});
test('corrupt data gives empty state', async () => {
  await set(STATE_KEY, 'garbage');
  expect(await loadState()).toEqual({ version: 1, profiles: [] });
  await set(STATE_KEY, { version: 1, profiles: 'nope' });
  expect(await loadState()).toEqual({ version: 1, profiles: [] });
});
test('storage failure keeps app running', async () => {
  const s = { ...state, profiles: [{ id: 'mem' } as never] };
  vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => { throw new Error('blocked'); });
  vi.spyOn(IDBObjectStore.prototype, 'get').mockImplementation(() => { throw new Error('blocked'); });
  expect(await saveState(s)).toBe(false);
  expect(await loadState()).toEqual(s);
});

import { lastLoadFailed, BACKUP_KEY } from './storage';
import { get } from 'idb-keyval';

test('malformed profile is repaired or dropped', async () => {
  await set(STATE_KEY, { version: 1, profiles: [
    { id: 'a', name: 'old' },
    { name: 'no id' },
    { id: 'b', name: 'x', progress: { stars: 5, practice: { ghost: 0, 'ar-1': 1 } } },
  ] });
  const s = await loadState();
  expect(s.profiles.map((p) => p.id)).toEqual(['a', 'b']);
  expect(s.profiles[0].progress.stars).toBe(0);
  expect(s.profiles[0].settings).toBeTruthy();
  expect(s.profiles[1].progress.stars).toBe(5);
  expect(s.profiles[1].progress.practice).toEqual({ 'ar-1': 1 });
  expect(s.profiles[1].progress.completed.ar).toEqual([]);
});
test('unreadable record is kept in a backup and reported', async () => {
  await set(STATE_KEY, { version: 2, profiles: [] });
  await loadState();
  expect(lastLoadFailed()).toBe(true);
  expect(await get(BACKUP_KEY)).toEqual({ version: 2, profiles: [] });
});
test('normal load reports no failure', async () => {
  await loadState();
  expect(lastLoadFailed()).toBe(false);
});
test('failed read blocks overwriting the stored record', async () => {
  await set(STATE_KEY, { version: 1, profiles: [{ id: 'keep', name: 'k' }] });
  const spy = vi.spyOn(IDBObjectStore.prototype, 'get').mockImplementation(() => { throw new Error('blocked'); });
  await loadState();
  expect(lastLoadFailed()).toBe(true);
  spy.mockRestore();
  expect(await saveState({ version: 1, profiles: [] })).toBe(false);
  resetMemory();
  expect((await loadState()).profiles[0].id).toBe('keep');
});
test('a load that never settles falls back', async () => {
  vi.spyOn(IDBObjectStore.prototype, 'get').mockImplementation(() => ({}) as IDBRequest);
  expect(await loadState(20)).toEqual({ version: 1, profiles: [] });
  expect(lastLoadFailed()).toBe(true);
});
