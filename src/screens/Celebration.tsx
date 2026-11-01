import { useMemo } from 'react';

const CONFETTI = ['#FF6B6B', '#4D96FF', '#FFD93D', '#6BCB77', '#C77DFF'];

export function Celebration({ stars, reduceMotion, onDone }: { stars: number; reduceMotion: boolean; onDone(): void }) {
  const pieces = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    left: `${(i * 37) % 100}%`, delay: `${(i % 9) * 0.15}s`, color: CONFETTI[i % CONFETTI.length],
  })), []);
  return (
    <div className="celebration" data-testid="celebration">
      {!reduceMotion && pieces.map((p, i) => (
        <span key={i} className="confetti" style={{ left: p.left, animationDelay: p.delay, background: p.color }} />
      ))}
      <div className={`big-stars${reduceMotion ? ' still' : ''}`} aria-label={`${stars} نجوم`}>
        {Array.from({ length: stars }, (_, i) => <span key={i} style={{ animationDelay: `${i * 0.2}s` }}>★</span>)}
      </div>
      <button type="button" className="go-button" data-testid="celebration-done" aria-label="التالي" onClick={onDone}>◀</button>
    </div>
  );
}
