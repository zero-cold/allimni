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
  cloud: '2601', owl: '1f989', glasses: '1f576', cape: '1f9e3', crown: '1f451', boat: '26f5', palm: '1f334', shell: '1f41a', crab: '1f980', tropicalfish: '1f420', gift: '1f381', pizza: '1f355', heart: '2764', door: '1f6aa', egg: '1f95a', chicken: '1f414', bird: '1f426', turtle: '1f422', bread: '1fad3', milk: '1f95b', water: '1f4a7', house: '1f3e0', school: '1f3eb', mosque: '1f54c', park: '1f3de', hospital: '1f3e5', cart: '1f6d2', beach: '1f3d6', camping: '1f3d5', eat: '1f37d', toilet: '1f6bd', sleep: '1f634', play: '1f9f8', mama: '1f469', baba: '1f468', hurt: '1f915', help: '1f64b', stop: '1f6d1', more: '2795', yes: '1f44d', no: '1f44e', cold: '1f976', hot: '1f975', happy: '1f604', sad: '1f622', scared: '1f628', angry: '1f620', tired: '1f62b', hungry: '1f60b', thirsty: '1f964', shy: '1f633', grandma: '1f475', grandpa: '1f474', boy: '1f466', girl: '1f467', khal: '1f9d4', amm: '1f471', book: '1f4d6', speech: '1f4ac', mic: '1f3a4', camera: '1f4f7',
};

for (const [name, code] of Object.entries(ART)) {
  const res = await fetch(`${BASE}${code}.svg`);
  if (!res.ok) { console.error('MISSING', name, code, res.status); continue; }
  await writeFile(`public/art/${name}.svg`, await res.text());
}
