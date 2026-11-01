import { useEffect, useMemo, useState } from 'react';
import { artUrl } from '../content/art';
import { getItems } from '../content/stages';
import type { Item } from '../content/types';
import { ItemGlyph, shuffle } from './ItemFace';
import type { GameProps } from './types';

const GOAL = 5;
const BALLOONS = 6;
const HINT_AFTER = 2;
const TINTS = ['#FF6B6B', '#4D96FF', '#FFD93D', '#6BCB77', '#C77DFF', '#FF9F45'];

export function BalloonGame({ items, feedback, reduceMotion, onAnswer, onDone }: GameProps) {
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [popped, setPopped] = useState(0);
  const target = items[score % items.length];

  const balloons = useMemo<Item[]>(() => {
    const others = shuffle(getItems(target.island).filter((i) => i.id !== target.id)).slice(0, BALLOONS - 1);
    return shuffle([target, ...others]);
  }, [target, popped]);

  useEffect(() => {
    if (feedback.canSpeak(target.lang)) feedback.speak(target.word, target.lang);
  }, [target, popped]);

  const tap = (it: Item) => {
    if (score >= GOAL) return;
    if (it.id !== target.id) {
      feedback.wrong();
      onAnswer(target.id, { correct: false, hinted: false });
      setMisses(misses + 1);
      return;
    }
    feedback.correct();
    onAnswer(target.id, { correct: true, hinted: misses >= HINT_AFTER });
    setMisses(0);
    setScore(score + 1);
    setPopped(popped + 1);
    if (score + 1 === GOAL) onDone();
  };

  return (
    <div className="game balloon-game">
      <div className="prompt">
        <img src={artUrl(target.art)} alt="" />
        <ItemGlyph item={target} />
        <span className="score" data-testid="score" aria-label={`${score} / ${GOAL}`}>
          {'★'.repeat(score)}<span className="score-rest">{'★'.repeat(GOAL - score)}</span>
          <span hidden>{score}</span>
        </span>
      </div>
      <div className={`balloons${reduceMotion ? ' still' : ''}`}>
        {balloons.map((it, i) => {
          const correct = it.id === target.id;
          return (
            <button
              key={`${popped}-${it.id}`}
              type="button"
              data-testid={correct ? 'balloon-correct' : 'balloon-wrong'}
              aria-label={it.word}
              className={`balloon${correct && misses >= HINT_AFTER ? ' hint' : ''}`}
              style={{ background: it.colorHex ?? TINTS[i % TINTS.length], animationDelay: `${i * -0.7}s` }}
              onClick={() => tap(it)}
            >
              {correct && misses >= HINT_AFTER && <span data-testid="hint" className="hint-mark" aria-hidden="true">👆</span>}
              <ItemGlyph item={it} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
