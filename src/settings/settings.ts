import type { Progress } from '../progress/progress';

export type HearingMode = 'visual' | 'partial';

export interface Settings {
  sound: boolean;
  speechRate: 'slow' | 'normal';
  vibration: boolean;
  reduceMotion: boolean;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  mode: HearingMode;
  settings: Settings;
  progress: Progress;
}

export interface AppState {
  version: 1;
  profiles: Profile[];
}

export const MAX_PROFILES = 6;

export function defaultSettings(mode: HearingMode, prefersReducedMotion: boolean): Settings {
  return {
    sound: mode === 'partial',
    speechRate: 'slow',
    vibration: true,
    reduceMotion: prefersReducedMotion,
  };
}

export function addProfile(s: AppState, p: Profile): AppState {
  if (s.profiles.length >= MAX_PROFILES) throw new Error('Too many profiles');
  return { ...s, profiles: [...s.profiles, p] };
}
