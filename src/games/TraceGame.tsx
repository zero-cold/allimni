import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { getStrokes, type Stroke } from '../content/strokes';
import { artUrl } from '../content/art';
import { checkStroke } from './traceLogic';
import type { GameProps } from './types';

const HINT_AFTER = 2;

interface Step { itemId: string; item: GameProps['items'][number]; strokes: Stroke[]; label: string }

const toPath = (s: Stroke) => s.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');

export function TraceGame({ items, feedback, reduceMotion, onAnswer, onDone }: GameProps) {
  const steps = useMemo<Step[]>(() => items.flatMap((item) => {
    const digits = item.island === 'num' ? [...(item.altDisplay ?? '')] : [item.display];
    return getStrokes(item).map((strokes, i) => ({ itemId: item.id, item, strokes, label: digits[i] }));
  }), [items]);
  const [stepIndex, setStepIndex] = useState(0);
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [misses, setMisses] = useState(0);
  const [hinted, setHinted] = useState(false);
  const [drawn, setDrawn] = useState<{ x: number; y: number }[]>([]);
  const [shake, setShake] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const activePointer = useRef<number | null>(null);
  const path = useRef<{ x: number; y: number }[]>([]);

  const step = steps[stepIndex];
  const stroke = step.strokes[strokeIndex];
  const showHint = misses >= HINT_AFTER;

  const toGrid = (e: PointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };

  const finish = (path: { x: number; y: number }[]) => {
    setDrawn([]);
    if (!checkStroke(stroke, path)) {
      feedback.wrong();
      setMisses((m) => m + 1);
      setHinted(hinted || misses + 1 >= HINT_AFTER);
      setShake(true);
      onAnswer(step.itemId, { correct: false, hinted: false });
      return;
    }
    if (strokeIndex + 1 < step.strokes.length) {
      setStrokeIndex(strokeIndex + 1);
      return;
    }
    feedback.correct();
    onAnswer(step.itemId, { correct: true, hinted });
    setStrokeIndex(0);
    setMisses(0);
    setHinted(false);
    if (stepIndex + 1 < steps.length) setStepIndex(stepIndex + 1);
    else onDone();
  };

  return (
    <div className="game trace-game">
      <div className="prompt">
        <img src={artUrl(step.item.art)} alt="" />
        <span className="prompt-glyph" dir="auto">{step.label}</span>
      </div>
      <svg
        ref={svg}
        data-testid="trace-pad"
        data-stroke={JSON.stringify(stroke)}
        className={`trace-pad${shake && !reduceMotion ? ' shake' : ''}`}
        viewBox="0 0 100 100"
        onAnimationEnd={() => setShake(false)}
        onPointerDown={(e) => {
          // إصبع واحد فقط، فلا تفسد راحة اليد المسار.
          if (activePointer.current !== null) return;
          e.currentTarget.setPointerCapture?.(e.pointerId);
          activePointer.current = e.pointerId;
          path.current = [toGrid(e)];
          setDrawn(path.current);
        }}
        onPointerMove={(e) => {
          if (activePointer.current !== e.pointerId) return;
          path.current = [...path.current, toGrid(e)];
          setDrawn(path.current);
        }}
        onPointerUp={(e) => {
          if (activePointer.current !== e.pointerId) return;
          activePointer.current = null;
          finish(path.current);
        }}
        onPointerCancel={(e) => {
          if (activePointer.current !== e.pointerId) return;
          activePointer.current = null;
          setDrawn([]);
        }}
      >
        {step.strokes.map((s, i) => (
          s.length > 1
            ? <path key={i} d={toPath(s)} className={i < strokeIndex ? 'stroke-done' : i === strokeIndex ? 'stroke-now' : 'stroke-later'} />
            : <circle key={i} cx={s[0].x} cy={s[0].y} r={4.5} className={i < strokeIndex ? 'dot-done' : i === strokeIndex ? 'dot-now' : 'dot-later'} />
        ))}
        <circle cx={stroke[0].x} cy={stroke[0].y} r={6} className={`start-dot${showHint && !reduceMotion ? ' pulse' : ''}`} />
        {stroke.length > 1 && <circle cx={stroke[1].x} cy={stroke[1].y} r={2.5} className="next-dot" />}
        {showHint && stroke.length === 1 && (
          <circle cx={stroke[0].x} cy={stroke[0].y} r={10} className="hint-ring" data-testid="hint" />
        )}
        {showHint && stroke.length > 1 && reduceMotion && (
          <path d={toPath(stroke)} className="hint-path" data-testid="hint" />
        )}
        {showHint && stroke.length > 1 && !reduceMotion && (
          <circle r={5} className="hint-dot" data-testid="hint">
            <animateMotion dur="1.6s" repeatCount="indefinite" path={toPath(stroke)} />
          </circle>
        )}
        {drawn.length > 1 && <path d={toPath(drawn)} className="stroke-ink" />}
      </svg>
    </div>
  );
}
