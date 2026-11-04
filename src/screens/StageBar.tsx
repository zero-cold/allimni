import { useEffect, useState } from 'react';
import { FEEDBACK_EVENT, type FeedbackKind } from '../app/events';
import { artUrl } from '../content/art';

// شريط التقدم: البومة تمشي مع الطفل وتتفاعل مع كل إجابة.
export function StageBar({ step, total }: { step: number; total: number }) {
  const [mood, setMood] = useState<FeedbackKind | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onFeedback = (e: Event) => {
      setMood((e as CustomEvent<FeedbackKind>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMood(null), 1100);
    };
    window.addEventListener(FEEDBACK_EVENT, onFeedback);
    return () => { clearTimeout(timer); window.removeEventListener(FEEDBACK_EVENT, onFeedback); };
  }, []);

  const pct = Math.min(100, (step / total) * 100);
  return (
    <div className="stage-track" aria-hidden="true">
      <div className="track-fill" style={{ width: `${pct}%` }} />
      <div className={`track-owl${mood ? ` mood-${mood}` : ''}`} style={{ insetInlineStart: `calc((100% - 52px) * ${pct / 100})` }}>
        <img src={artUrl('owl')} alt="" />
        {mood === 'correct' && <span className="mood-bubble">👍</span>}
        {mood === 'wrong' && <span className="mood-bubble">🤔</span>}
      </div>
      <span className="track-goal"><span className="pearl" /></span>
    </div>
  );
}
