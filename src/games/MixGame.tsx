import { useState } from 'react';
import { getItem, mixRoundsFor } from '../content/stages';
import { T } from '../content/strings';
import { ItemGlyph } from './ItemFace';
import type { GameProps } from './types';

const PAINTS = ['red', 'blue', 'yellow', 'white'];
const HINT_AFTER = 2;

export function MixGame({ items, feedback, reduceMotion, onAnswer, onDone }: GameProps) {
  const [rounds] = useState(() => mixRoundsFor(items[0].id));
  const [round, setRound] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [misses, setMisses] = useState(0);
  const [solved, setSolved] = useState(false);
  const [shake, setShake] = useState(false);

  const recipe = rounds[round];
  const result = getItem(recipe.result);
  const hint = misses >= HINT_AFTER;

  const pick = (id: string) => {
    if (solved || picks.includes(id)) return;
    if (picks.length === 0) { setPicks([id]); return; }
    const pair = [picks[0], id];
    if (pair.includes(recipe.a) && pair.includes(recipe.b)) {
      feedback.correct();
      onAnswer(recipe.result, { correct: true, hinted: hint });
      setPicks(pair);
      setSolved(true);
    } else {
      feedback.wrong();
      onAnswer(recipe.result, { correct: false, hinted: false });
      setMisses(misses + 1);
      setShake(true);
      setPicks([]);
    }
  };

  const next = () => {
    if (round + 1 === rounds.length) { onDone(); return; }
    setRound(round + 1);
    setPicks([]);
    setMisses(0);
    setSolved(false);
  };

  return (
    <div className="game mix-game">
      <div className="prompt" data-testid="mix-target" data-result={recipe.result} data-parts={`${recipe.a},${recipe.b}`}>
        <ItemGlyph item={result} />
      </div>
      <div
        className={`bowl${shake && !reduceMotion ? ' shake' : ''}`}
        data-testid="mix-bowl"
        data-color={solved ? recipe.result : ''}
        style={{ background: solved ? result.colorHex : undefined }}
        onAnimationEnd={() => setShake(false)}
      >
        {solved ? result.symbol : picks.map((id) => <span key={id} className="drop" style={{ background: getItem(id).colorHex }} />)}
      </div>
      <div className="paints">
        {PAINTS.map((id) => {
          const paint = getItem(id);
          const isHint = hint && !solved && (id === recipe.a || id === recipe.b);
          return (
            <button
              key={id}
              type="button"
              data-testid={`paint-${id}`}
              aria-label={paint.word}
              aria-pressed={picks.includes(id)}
              className={`tile paint${picks.includes(id) ? ' selected' : ''}${isHint ? ' hint' : ''}`}
              onClick={() => pick(id)}
            >
              <ItemGlyph item={paint} />
            </button>
          );
        })}
      </div>
      {solved && (
        <button type="button" className="go-button" data-testid="mix-next" aria-label={T.next} onClick={next}>◀</button>
      )}
    </div>
  );
}
