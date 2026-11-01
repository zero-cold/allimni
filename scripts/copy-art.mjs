// ينسخ رسوم Noto Emoji (رخصة Apache 2.0) من نسخة محددة إلى public/art.
import { writeFile } from 'node:fs/promises';

const REV = 'v2.051';
const BASE = `https://raw.githubusercontent.com/googlefonts/noto-emoji/${REV}/svg/emoji_u`;
const ART = {
  rabbit: '1f430', duck: '1f986', apple: '1f34e', fox: '1f98a', camel: '1f42b', horse: '1f434',
  sheep: '1f411', bear: '1f43b', corn: '1f33d', giraffe: '1f992', fish: '1f41f', sun: '2600',
  frog: '1f438', airplane: '2708', envelope: '2709', grapes: '1f347', deer: '1f98c', elephant: '1f418',
  cat: '1f431', dog: '1f436', lemon: '1f34b', banana: '1f34c', bee: '1f41d', crescent: '1f319',
  rose: '1f339', hand: '270b', ball: '26bd', hat: '1f3a9', icecream: '1f366', juice: '1f9c3',
  kite: '1fa81', lion: '1f981', moon: '1f315', nose: '1f443', orange: '1f34a', penguin: '1f427',
  queen: '1f478', tree: '1f333', umbrella: '2602', violin: '1f3bb', watermelon: '1f349', yoyo: '1fa80',
  zebra: '1f993', star: '2b50', whale: '1f433', blossom: '1f338', blackcat: '1f408_200d_2b1b',
  cloud: '2601', owl: '1f989',
};

for (const [name, code] of Object.entries(ART)) {
  const res = await fetch(`${BASE}${code}.svg`);
  if (!res.ok) { console.error('MISSING', name, code, res.status); continue; }
  await writeFile(`public/art/${name}.svg`, await res.text());
}
