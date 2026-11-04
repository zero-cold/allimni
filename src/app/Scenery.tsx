import { useEffect, useRef, useState } from 'react';
import { FEEDBACK_EVENT, motionReduced, type FeedbackKind } from './events';

// خلفية البحر الثابتة خلف كل الشاشات.
export function Scenery() {
  return (
    <div className="scenery" aria-hidden="true">
      <div className="sun" />
      <div className="cloud c1" />
      <div className="cloud c2" />
      <div className="cloud c3" />
      <svg className="waves" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path className="wave back" d="M0 50 Q150 10 300 50 T600 50 T900 50 T1200 50 V120 H0Z" />
        <path className="wave front" d="M0 70 Q150 30 300 70 T600 70 T900 70 T1200 70 V120 H0Z" />
      </svg>
    </div>
  );
}

type Burst = { id: number; x: number; y: number; kind: FeedbackKind };

// فقاعات ولولو تطلع من مكان اللمس عند الإجابة الصحيحة.
export function Sparkles() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const last = useRef({ x: innerWidth / 2, y: innerHeight / 2 });
  const seq = useRef(0);

  useEffect(() => {
    const track = (e: PointerEvent) => { last.current = { x: e.clientX, y: e.clientY }; };
    const onFeedback = (e: Event) => {
      const kind = (e as CustomEvent<FeedbackKind>).detail;
      if (kind === 'wrong' || motionReduced()) return;
      const id = ++seq.current;
      setBursts((b) => [...b, { id, kind, ...last.current }]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900);
    };
    window.addEventListener('pointerdown', track, true);
    window.addEventListener(FEEDBACK_EVENT, onFeedback);
    return () => {
      window.removeEventListener('pointerdown', track, true);
      window.removeEventListener(FEEDBACK_EVENT, onFeedback);
    };
  }, []);

  return (
    <div className="sparkles" aria-hidden="true">
      {bursts.map((b) => (
        <div key={b.id} className="burst" style={{ left: b.x, top: b.y }}>
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={i % 3 === 0 ? 'pearl' : 'bubble'} style={{ '--a': `${i * 36}deg`, '--d': `${50 + (i % 4) * 18}px` } as React.CSSProperties} />
          ))}
        </div>
      ))}
    </div>
  );
}
