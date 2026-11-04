import { useMemo } from 'react';
import { artUrl } from '../content/art';
import { T } from '../content/strings';

const CONFETTI = ['#FF6F59', '#12B5C9', '#FFC53D', '#3DBE7A', '#9B6BFF'];

export function Celebration({ stars, reduceMotion, onDone }: { stars: number; reduceMotion: boolean; onDone(): void }) {
  const pieces = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    left: `${3 + ((i * 37) % 90)}%`, delay: `${(i % 10) * 0.12}s`, color: CONFETTI[i % CONFETTI.length],
  })), []);
  return (
    <div className={`celebration${reduceMotion ? ' still' : ''}`} data-testid="celebration">
      {!reduceMotion && (
        <div className="confetti-layer" aria-hidden="true">
          {pieces.map((p, i) => <span key={i} className="confetti" style={{ left: p.left, animationDelay: p.delay, background: p.color }} />)}
        </div>
      )}
      <div className="cheer">
        <img className="dancing-owl" src={artUrl('owl')} alt="" />
        <p className="praise">{T.praise}</p>
      </div>
      <div className="big-pearls" aria-label={T.pearls(stars)}>
        {Array.from({ length: stars }, (_, i) => <span key={i} className="pearl huge" style={{ animationDelay: `${0.3 + i * 0.25}s` }} />)}
      </div>
      <button type="button" className="go-button" data-testid="celebration-done" aria-label={T.next} onClick={onDone}>◀</button>
    </div>
  );
}
