import type { Stroke } from '../content/strokes';

type Point = { x: number; y: number };

const STEP = 3;
const MIN_LENGTH_RATIO = 0.4;

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const length = (ps: Point[]) => ps.slice(1).reduce((sum, p, i) => sum + dist(ps[i], p), 0);

// يملأ ما بين العينات حتى لا تفشل الحركة السريعة على الجوالات البطيئة.
function densify(ps: Point[]): Point[] {
  const out: Point[] = ps.slice(0, 1);
  for (let i = 1; i < ps.length; i++) {
    const n = Math.max(1, Math.ceil(dist(ps[i - 1], ps[i]) / STEP));
    for (let k = 1; k <= n; k++) {
      out.push({ x: ps[i - 1].x + ((ps[i].x - ps[i - 1].x) * k) / n, y: ps[i - 1].y + ((ps[i].y - ps[i - 1].y) * k) / n });
    }
  }
  return out;
}

// تنجح الخطوة إذا مر الإصبع على نقاطها بالترتيب وقطع جزءاً كافياً من طولها.
export function checkStroke(stroke: Stroke, drawn: Point[], tolerance = 14): boolean {
  if (length(drawn) < length(stroke) * MIN_LENGTH_RATIO) return false;
  const path = densify(drawn);
  let from = 0;
  for (const point of stroke) {
    const hit = path.findIndex((d, i) => i >= from && dist(d, point) <= tolerance);
    if (hit < 0) return false;
    from = hit;
  }
  return true;
}
