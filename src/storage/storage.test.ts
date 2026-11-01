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
  const s = { ...state, profiles: [{ id: 'a' } as never] };
  expect(await saveState(s)).toBe(true);
  resetMemory();
  expect(await loadState()).toEqual(s);
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
