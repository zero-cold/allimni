import type { Settings } from '../settings/settings';

type Lang = 'ar' | 'en';
type ToneKind = 'correct' | 'wrong' | 'celebrate';

export interface FeedbackEnv {
  speak(u: { text: string; lang: Lang; rate: number }): void;
  cancelSpeech(): void;
  voiceLangs(): string[];
  onVoices(fn: () => void): () => void;
  vibrate?: (pattern: number | number[]) => void;
  tone(kind: ToneKind): void;
}

export interface Feedback {
  correct(): void;
  wrong(): void;
  celebrate(): void;
  speak(text: string, lang: Lang): void;
  stop(): void;
  canSpeak(lang: Lang): boolean;
  hasVoice(lang: Lang): boolean;
  onVoicesChanged(fn: () => void): () => void;
}

const VIBRATION: Record<ToneKind, number | number[]> = {
  correct: 40,
  wrong: [30, 40, 30],
  celebrate: [60, 40, 60, 40, 120],
};
const RATE = { slow: 0.6, normal: 1 };

let audio: AudioContext | null = null;
const TONES: Record<ToneKind, number[]> = {
  correct: [660, 880],
  wrong: [300],
  celebrate: [523, 659, 784, 1047],
};

function browserEnv(): FeedbackEnv {
  const synth = typeof speechSynthesis === 'undefined' ? undefined : speechSynthesis;
  return {
    speak({ text, lang, rate }) {
      if (!synth) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang));
      if (voice) { u.voice = voice; u.lang = voice.lang; }
      u.rate = rate;
      synth.cancel();
      synth.speak(u);
    },
    cancelSpeech: () => synth?.cancel(),
    voiceLangs: () => synth?.getVoices().map((v) => v.lang) ?? [],
    onVoices(fn) {
      synth?.addEventListener?.('voiceschanged', fn);
      return () => synth?.removeEventListener?.('voiceschanged', fn);
    },
    vibrate: typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
      ? (p) => { navigator.vibrate(p); }
      : undefined,
    tone(kind) {
      if (typeof AudioContext === 'undefined') return;
      audio ??= new AudioContext();
      void audio.resume();
      TONES[kind].forEach((freq, i) => {
        const osc = audio!.createOscillator();
        const gain = audio!.createGain();
        const start = audio!.currentTime + i * 0.12;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.connect(gain).connect(audio!.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    },
  };
}

export function createFeedback(settings: Settings, env: FeedbackEnv = browserEnv()): Feedback {
  const hasVoice = (lang: Lang) => env.voiceLangs().some((v) => v.toLowerCase().startsWith(lang));
  const signal = (kind: ToneKind) => {
    if (settings.vibration) env.vibrate?.(VIBRATION[kind]);
    if (settings.sound) env.tone(kind);
  };
  return {
    correct: () => signal('correct'),
    wrong: () => signal('wrong'),
    celebrate: () => signal('celebrate'),
    speak(text, lang) {
      if (settings.sound && hasVoice(lang)) env.speak({ text, lang, rate: RATE[settings.speechRate] });
    },
    stop: () => env.cancelSpeech(),
    canSpeak: (lang) => settings.sound && hasVoice(lang),
    hasVoice,
    onVoicesChanged: (fn) => env.onVoices(fn),
  };
}
