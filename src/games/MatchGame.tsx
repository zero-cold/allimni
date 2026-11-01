import { useState } from 'react';
import { ItemGlyph, ItemPicture, shuffle } from './ItemFace';
import type { GameProps } from './types';

const HINT_AFTER = 2;

type Side = 'left' | 'right';

export function MatchGame({ items, feedback, reduceMotion, onAnswer, onDone }: GameProps) {
  const [left] = useState(() => shuffle(items));
  const [right] = useState(() => shuffle(items));
  const [selected, setSelected] = useState<{ side: Side; id: string } | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [missedId, setMissedId] = useState<string | null>(null);
  const [shaking, setShaking] = useState<string | null>(null);

  const pick = (side: Side, id: string) => {
    if (matched.includes(id)) return;
    if (!selected || selected.side === side) { setSelected({ side, id }); return; }
    const leftId = side === 'left' ? id : selected.id;
    const rightId = side === 'right' ? id : selected.id;
    setSelected(null);
    if (leftId === rightId) {
      feedback.correct();
      onAnswer(leftId, { correct: true, hinted: misses >= HINT_AFTER });
      const next = [...matched, leftId];
      setMatched(next);
      setMisses(0);
      setMissedId(null);
      if (next.length === items.length) onDone();
    } else {
      feedback.wrong();
      onAnswer(leftId, { correct: false, hinted: false });
      setMisses(misses + 1);
      setMissedId(leftId);
      setShaking(`${side}-${id}`);
    }
  };

  const hintFor = misses >= HINT_AFTER ? missedId : null;
  const tileClass = (side: Side, id: string) => [
    'tile',
    selected?.side === side && selected.id === id ? 'selected' : '',
    matched.includes(id) ? 'matched' : '',
    hintFor === id ? 'hint' : '',
    shaking === `${side}-${id}` && !reduceMotion ? 'shake' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="game match-game">
      {([['left', left], ['right', right]] as const).map(([side, column]) => (
        <div className="match-col" key={side}>
          {column.map((it) => (
            <button
              key={it.id}
              type="button"
              data-testid={`${side}-${it.id}`}
              aria-label={it.word}
              aria-pressed={selected?.side === side && selected.id === it.id}
              disabled={matched.includes(it.id)}
              className={tileClass(side, it.id)}
              onAnimationEnd={() => setShaking(null)}
              onClick={() => pick(side, it.id)}
            >
              {side === 'left' ? <ItemGlyph item={it} /> : <ItemPicture item={it} />}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
