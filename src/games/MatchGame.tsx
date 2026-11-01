import { useState } from 'react';
import { ItemGlyph, ItemPicture, shuffle } from './ItemFace';
import type { GameProps } from './types';

const HINT_AFTER = 2;

export function MatchGame({ items, feedback, reduceMotion, onAnswer, onDone }: GameProps) {
  const [left] = useState(() => shuffle(items));
  const [right] = useState(() => shuffle(items));
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [misses, setMisses] = useState<Record<string, number>>({});
  const [shaking, setShaking] = useState<string | null>(null);

  const pick = (id: string) => {
    if (!selected || matched.includes(id)) return;
    const missCount = misses[selected] ?? 0;
    if (id === selected) {
      feedback.correct();
      onAnswer(selected, { correct: true, hinted: missCount >= HINT_AFTER });
      const next = [...matched, id];
      setMatched(next);
      setSelected(null);
      if (next.length === items.length) onDone();
    } else {
      feedback.wrong();
      onAnswer(selected, { correct: false, hinted: false });
      setMisses({ ...misses, [selected]: missCount + 1 });
      setShaking(id);
      setSelected(null);
    }
  };

  const hintFor = Object.entries(misses).find(([id, n]) => n >= HINT_AFTER && !matched.includes(id) && id === selected)?.[0]
    ?? (selected === null ? Object.entries(misses).find(([id, n]) => n >= HINT_AFTER && !matched.includes(id))?.[0] : undefined);

  return (
    <div className="game match-game">
      <div className="match-col">
        {left.map((it) => (
          <button
            key={it.id}
            type="button"
            data-testid={`left-${it.id}`}
            aria-label={it.word}
            aria-pressed={selected === it.id}
            disabled={matched.includes(it.id)}
            className={`tile${selected === it.id ? ' selected' : ''}${matched.includes(it.id) ? ' matched' : ''}${hintFor === it.id ? ' hint' : ''}`}
            onClick={() => setSelected(it.id)}
          >
            <ItemGlyph item={it} />
          </button>
        ))}
      </div>
      <div className="match-col">
        {right.map((it) => (
          <button
            key={it.id}
            type="button"
            data-testid={`right-${it.id}`}
            aria-label={it.word}
            disabled={matched.includes(it.id)}
            className={`tile${matched.includes(it.id) ? ' matched' : ''}${hintFor === it.id ? ' hint' : ''}${shaking === it.id && !reduceMotion ? ' shake' : ''}`}
            onAnimationEnd={() => setShaking(null)}
            onClick={() => pick(it.id)}
          >
            <ItemPicture item={it} />
          </button>
        ))}
      </div>
    </div>
  );
}
