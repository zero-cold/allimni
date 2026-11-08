import { useMemo, useState } from 'react';
import { artUrl } from '../content/art';
import { ITEMS } from '../content/items';
import { WORDS } from '../content/stages';
import { T } from '../content/strings';
import { shuffle } from './ItemFace';
import type { GameProps } from './types';

const ROUNDS = 3;
const DISTRACTORS = 2;
const HINT_AFTER = 2;
const POOL = ['ا', 'ب', 'ت', 'ج', 'د', 'ر', 'س', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'و', 'ي', 'ز', 'ط'];

// الحرف يرتبط بعنصره في جزيرة الحروف عشان يدخل في التدريب.
const letterItem = (letter: string) =>
  ITEMS.find((i) => i.island === 'ar' && (i.display === letter || (letter === 'ا' && i.display === 'أ')))?.id;

export function WordGame({ feedback, reduceMotion, onAnswer, onDone }: GameProps) {
  const [words] = useState(() => shuffle(WORDS).slice(0, ROUNDS));
  const [round, setRound] = useState(0);
  const [built, setBuilt] = useState(0);
  const [used, setUsed] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const [shaking, setShaking] = useState<number | null>(null);
  const word = words[round];
  const tiles = useMemo(() => {
    const extra = shuffle(POOL.filter((l) => !word.letters.includes(l))).slice(0, DISTRACTORS);
    return shuffle([...word.letters, ...extra]);
  }, [word]);
  const done = built === word.letters.length;
  const expected = word.letters[built];

  const tap = (letter: string, index: number) => {
    if (done || used.includes(index)) return;
    const id = letterItem(expected);
    if (letter !== expected) {
      feedback.wrong();
      if (id) onAnswer(id, { correct: false, hinted: false });
      setMisses(misses + 1);
      setShaking(index);
      return;
    }
    feedback.correct();
    if (id) onAnswer(id, { correct: true, hinted: misses >= HINT_AFTER });
    setUsed([...used, index]);
    setMisses(0);
    setBuilt(built + 1);
    if (built + 1 === word.letters.length && round + 1 === words.length) onDone();
  };

  const next = () => {
    setRound(round + 1);
    setBuilt(0);
    setUsed([]);
    setMisses(0);
  };

  return (
    <div className="game word-game">
      <div className="prompt">
        <img src={artUrl(word.art)} alt="" />
        <div className="word-slots" data-testid="word-target" data-letters={JSON.stringify(word.letters)}>
          <span className="word-built" data-testid="word-built">{word.word.slice(0, built)}</span>
          {Array.from({ length: word.letters.length - built }, (_, i) => <span key={i} className="slot" />)}
        </div>
      </div>
      <div className="letter-tiles">
        {tiles.map((letter, i) => {
          const isHint = misses >= HINT_AFTER && letter === expected && !used.includes(i);
          return (
            <button
              key={`${round}-${i}`}
              type="button"
              data-testid={`letter-${i}`}
              data-letter={letter}
              disabled={used.includes(i)}
              className={`tile letter${isHint ? ' hint' : ''}${shaking === i && !reduceMotion ? ' shake' : ''}`}
              onAnimationEnd={() => setShaking(null)}
              onClick={() => tap(letter, i)}
            >
              <span className="glyph">{letter}</span>
            </button>
          );
        })}
      </div>
      {done && round + 1 < words.length && (
        <button type="button" className="go-button" data-testid="word-next" aria-label={T.next} onClick={next}>◀</button>
      )}
    </div>
  );
}
