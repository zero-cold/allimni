import { get, set } from 'idb-keyval';
import { ITEMS } from '../content/items';
import { emptyProgress, type Progress } from '../progress/progress';
import { defaultSettings, type AppState, type Profile } from '../settings/settings';

export const STATE_KEY = 'allimni-state';
export const BACKUP_KEY = 'allimni-state-backup';
const LOAD_TIMEOUT_MS = 3000;

// نسخة في الذاكرة حتى يستمر اللعب إذا تعذر التخزين.
let memory: AppState | null = null;
let loadFailed = false;
// بعد فشل القراءة لا نكتب فوق سجل قد يكون سليماً.
let writesBlocked = false;

const emptyState = (): AppState => ({ version: 1, profiles: [] });

function isValid(v: unknown): v is AppState {
  const s = v as AppState | null | undefined;
  return !!s && s.version === 1 && Array.isArray(s.profiles);
}

const list = (v: unknown): number[] => (Array.isArray(v) ? v.filter((n) => typeof n === 'number') : []);

function repairProgress(raw: Partial<Progress> | undefined): Progress {
  const base = emptyProgress();
  const done = (raw?.completed ?? {}) as Partial<Progress['completed']>;
  const practice = Object.entries(raw?.practice ?? {}).filter(
    ([id, n]) => typeof n === 'number' && ITEMS.some((i) => i.id === id),
  );
  return {
    ...base,
    stars: typeof raw?.stars === 'number' ? raw.stars : 0,
    lastRunId: raw?.lastRunId,
    completed: { ar: list(done.ar), en: list(done.en), num: list(done.num), color: list(done.color) },
    practice: Object.fromEntries(practice),
  };
}

function repair(state: AppState): AppState {
  const profiles = (state.profiles as Partial<Profile>[])
    .filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string')
    .map((p): Profile => {
      const mode = p.mode === 'partial' ? 'partial' : 'visual';
      return {
        ...(p as Profile),
        avatar: typeof p.avatar === 'string' ? p.avatar : 'cat',
        mode,
        settings: { ...defaultSettings(mode, false), ...p.settings },
        progress: repairProgress(p.progress),
      };
    });
  return { version: 1, profiles };
}

export function resetMemory(): void {
  memory = null;
  loadFailed = false;
  writesBlocked = false;
}

export function lastLoadFailed(): boolean {
  return loadFailed;
}

export async function loadState(timeoutMs = LOAD_TIMEOUT_MS): Promise<AppState> {
  if (memory) return memory;
  loadFailed = false;
  try {
    const stored = await Promise.race([
      get(STATE_KEY),
      new Promise((_, reject) => { setTimeout(() => reject(new Error('timeout')), timeoutMs); }),
    ]);
    if (stored === undefined) return emptyState();
    if (isValid(stored)) return repair(stored);
    loadFailed = true;
    await set(BACKUP_KEY, stored);
    return emptyState();
  } catch {
    loadFailed = true;
    writesBlocked = true;
    return emptyState();
  }
}

export async function saveState(s: AppState): Promise<boolean> {
  memory = s;
  if (writesBlocked) return false;
  try {
    await set(STATE_KEY, s);
    return true;
  } catch {
    return false;
  }
}

export async function requestPersistence(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
