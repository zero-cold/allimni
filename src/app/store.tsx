import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { IslandId } from '../content/types';
import { createFeedback, type Feedback } from '../feedback/feedback';
import { addProfile as addToState, type AppState, type Profile } from '../settings/settings';
import { lastLoadFailed, loadState, requestPersistence, saveState } from '../storage/storage';

export type Screen =
  | { name: 'profiles' }
  | { name: 'map' }
  | { name: 'stage'; island: IslandId; index: number }
  | { name: 'companion' }
  | { name: 'parent' };

interface AppApi {
  state: AppState;
  active: Profile | null;
  feedback: Feedback | null;
  saveFailed: boolean;
  loadFailed: boolean;
  screen: Screen;
  selectProfile(id: string | null): void;
  updateProfile(id: string, fn: (p: Profile) => Profile): void;
  addProfile(p: Profile): void;
  removeProfile(id: string): void;
  navigate(s: Screen): void;
}

const AppContext = createContext<AppApi | null>(null);

export function useApp(): AppApi {
  const api = useContext(AppContext);
  if (!api) throw new Error('useApp outside StoreProvider');
  return api;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'profiles' });
  const [saveFailed, setSaveFailed] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const current = useRef<AppState | null>(null);

  useEffect(() => {
    void loadState().then((s) => { current.current = s; setLoadFailed(lastLoadFailed()); setState(s); });
  }, []);

  const commit = (next: AppState) => {
    current.current = next;
    setState(next);
    void saveState(next).then((ok) => setSaveFailed(!ok));
  };

  const active = state?.profiles.find((p) => p.id === activeId) ?? null;
  const settings = active?.settings;
  const feedback = useMemo(() => (settings ? createFeedback(settings) : null), [settings]);

  const reduceMotion = settings?.reduceMotion ?? false;
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reduceMotion);
  }, [reduceMotion]);

  if (!state) return null;

  const api: AppApi = {
    state,
    active,
    feedback,
    saveFailed,
    loadFailed,
    screen,
    navigate: setScreen,
    selectProfile(id) {
      feedback?.stop();
      setActiveId(id);
      setScreen(id ? { name: 'map' } : { name: 'profiles' });
    },
    updateProfile(id, fn) {
      const s = current.current!;
      commit({ ...s, profiles: s.profiles.map((p) => (p.id === id ? fn(p) : p)) });
    },
    addProfile(p) {
      const first = current.current!.profiles.length === 0;
      commit(addToState(current.current!, p));
      if (first) void requestPersistence();
    },
    removeProfile(id) {
      const s = current.current!;
      commit({ ...s, profiles: s.profiles.filter((p) => p.id !== id) });
      if (id === activeId) { feedback?.stop(); setActiveId(null); }
      setScreen({ name: 'profiles' });
    },
  };

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}
