import { useEffect, useRef, useState } from 'react';
import { artUrl } from '../content/art';
import { T } from '../content/strings';
import { ItemGlyph } from './ItemFace';
import type { GameProps } from './types';

export interface Mic {
  level(): number;
  stop(): void;
}

const ROUNDS = 3;
const TICK_MS = 100;
const VOICE_LEVEL = 0.08;
const GOAL_MS = 1500;

// يفتح المايك ويحسب علو الصوت من 0 إلى 1.
export async function openBrowserMic(): Promise<Mic> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new AudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  ctx.createMediaStreamSource(stream).connect(analyser);
  const data = new Float32Array(analyser.fftSize);
  return {
    level() {
      analyser.getFloatTimeDomainData(data);
      const rms = Math.sqrt(data.reduce((sum, v) => sum + v * v, 0) / data.length);
      return Math.min(1, rms * 5);
    },
    stop() {
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close();
    },
  };
}

// لعبة «قول»: الطفل يتكلم واللولوة تكبر مع صوته.
export function SayGame({ items, feedback, onAnswer, onDone, openMic = openBrowserMic }: GameProps & { openMic?: () => Promise<Mic> }) {
  const rounds = items.slice(0, ROUNDS);
  const [round, setRound] = useState(0);
  const [level, setLevel] = useState(0);
  const [voiced, setVoiced] = useState(0);
  const [micFailed, setMicFailed] = useState(false);
  const mic = useRef<Mic | null>(null);
  const solved = voiced >= GOAL_MS;
  const item = rounds[round];

  useEffect(() => {
    let closed = false;
    openMic().then(
      (m) => { if (closed) m.stop(); else mic.current = m; },
      () => setMicFailed(true),
    );
    return () => { closed = true; mic.current?.stop(); mic.current = null; };
  }, []);

  useEffect(() => {
    if (solved) return;
    const timer = setInterval(() => {
      const l = mic.current?.level() ?? 0;
      setLevel(l);
      if (l > VOICE_LEVEL) setVoiced((v) => v + TICK_MS);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [solved, round]);

  useEffect(() => {
    if (!solved) return;
    feedback.correct();
    onAnswer(item.id, { correct: true, hinted: false });
    if (round + 1 === rounds.length) onDone();
  }, [solved]);

  const next = () => { setRound(round + 1); setVoiced(0); setLevel(0); };
  const progress = Math.min(1, voiced / GOAL_MS);

  return (
    <div className="game say-game">
      <div className="prompt">
        <img src={artUrl(item.art)} alt="" />
        <ItemGlyph item={item} />
      </div>
      <div className="say-meter" aria-hidden="true">
        <span className="say-wave" style={{ transform: `scale(${1 + level * 1.5})` }} />
        <span className="pearl say-pearl" style={{ transform: `scale(${0.5 + progress})` }} />
        <img className="say-mic" src={artUrl('mic')} alt="" />
      </div>
      {solved && round + 1 < rounds.length && (
        <button type="button" className="go-button" data-testid="say-next" aria-label={T.next} onClick={next}>◀</button>
      )}
      {!solved && (
        <button type="button" className={`say-skip${micFailed ? ' prominent' : ''}`} data-testid="say-skip" aria-label={T.say.skip} onClick={onDone}>⏭</button>
      )}
    </div>
  );
}
