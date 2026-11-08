import { ITEMS } from './items';
import { MIX_RECIPES } from './stages';
import { TALK } from './talk';

// أرقام التسجيلات حسب docs/recording-list.md. المفتاح هو العنصر أو البطاقة.
export const RECORDINGS: Record<string, number> = {};

const PRAISE = ['kafu', 'afya', 'yasalam', 'shater', 'shatra', 'yalla-nkamel', 'try-again', 'closer', 'yalla-nalab'];

let n = 0;
for (const c of TALK) RECORDINGS[c.id] = ++n;
for (const p of PRAISE) RECORDINGS[`praise-${p}`] = ++n;
for (const item of ITEMS.filter((i) => i.island === 'ar')) {
  RECORDINGS[`${item.id}:name`] = ++n;
  RECORDINGS[item.id] = ++n;
}
for (const island of ['num', 'color'] as const) {
  for (const item of ITEMS.filter((i) => i.island === island)) RECORDINGS[item.id] = ++n;
}
for (const r of MIX_RECIPES) RECORDINGS[`mix-${r.result}`] = ++n;
for (const island of ['shape', 'animal', 'food', 'place'] as const) {
  for (const item of ITEMS.filter((i) => i.island === island)) RECORDINGS[item.id] = ++n;
}
for (const item of ITEMS.filter((i) => i.island === 'en')) {
  RECORDINGS[`${item.id}:name`] = ++n;
  RECORDINGS[item.id] = ++n;
}

// أرقام الملفات الموجودة في public/audio. تنضاف لما توصل التسجيلات.
export const AVAILABLE_RECORDINGS = new Set<number>([]);

export function recordingFor(key: string): string | undefined {
  const num = RECORDINGS[key];
  if (num === undefined || !AVAILABLE_RECORDINGS.has(num)) return undefined;
  return `${import.meta.env.BASE_URL}audio/${String(num).padStart(3, '0')}.m4a`;
}
