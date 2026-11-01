import { get, set } from 'idb-keyval';
import type { AppState } from '../settings/settings';

export const STATE_KEY = 'allimni-state';

// نسخة في الذاكرة حتى يستمر اللعب إذا تعذر التخزين.
let memory: AppState | null = null;

const emptyState = (): AppState => ({ version: 1, profiles: [] });

function isValid(v: unknown): v is AppState {
  const s = v as AppState | null | undefined;
  return !!s && s.version === 1 && Array.isArray(s.profiles);
}

export function resetMemory(): void {
  memory = null;
}

export async function loadState(): Promise<AppState> {
  if (memory) return memory;
  try {
    const stored = await get(STATE_KEY);
    return isValid(stored) ? stored : emptyState();
  } catch {
    return emptyState();
  }
}

export async function saveState(s: AppState): Promise<boolean> {
  memory = s;
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
