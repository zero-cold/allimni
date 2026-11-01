import type { Stroke } from '../content/strokes';

const near = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) =>
  Math.hypot(a.x - b.x, a.y - b.y) <= t;

// تنجح الخطوة إذا مر الإصبع على نقاطها بالترتيب.
export function checkStroke(stroke: Stroke, drawn: { x: number; y: number }[], tolerance = 14): boolean {
  let from = 0;
  for (const point of stroke) {
    const hit = drawn.findIndex((d, i) => i >= from && near(d, point, tolerance));
    if (hit < 0) return false;
    from = hit;
  }
  return true;
}
