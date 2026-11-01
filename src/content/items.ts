import type { Item } from './types';

const AR: [string, string, string][] = [
  ['أ', 'أرنب', 'rabbit'], ['ب', 'بطة', 'duck'], ['ت', 'تفاحة', 'apple'], ['ث', 'ثعلب', 'fox'],
  ['ج', 'جمل', 'camel'], ['ح', 'حصان', 'horse'], ['خ', 'خروف', 'sheep'], ['د', 'دب', 'bear'],
  ['ذ', 'ذرة', 'corn'], ['ر', 'رمان', 'pomegranate'], ['ز', 'زرافة', 'giraffe'], ['س', 'سمكة', 'fish'],
  ['ش', 'شمس', 'sun'], ['ص', 'صقر', 'falcon'], ['ض', 'ضفدع', 'frog'], ['ط', 'طائرة', 'airplane'],
  ['ظ', 'ظرف', 'envelope'], ['ع', 'عنب', 'grapes'], ['غ', 'غزال', 'deer'], ['ف', 'فيل', 'elephant'],
  ['ق', 'قطة', 'cat'], ['ك', 'كلب', 'dog'], ['ل', 'ليمون', 'lemon'], ['م', 'موز', 'banana'],
  ['ن', 'نحلة', 'bee'], ['ه', 'هلال', 'crescent'], ['و', 'وردة', 'rose'], ['ي', 'يد', 'hand'],
];

const EN: [string, string][] = [
  ['Apple', 'apple'], ['Ball', 'ball'], ['Cat', 'cat'], ['Dog', 'dog'], ['Elephant', 'elephant'],
  ['Fish', 'fish'], ['Grapes', 'grapes'], ['Hat', 'hat'], ['Ice cream', 'icecream'], ['Juice', 'juice'],
  ['Kite', 'kite'], ['Lion', 'lion'], ['Moon', 'moon'], ['Nose', 'nose'], ['Orange', 'orange'],
  ['Penguin', 'penguin'], ['Queen', 'queen'], ['Rabbit', 'rabbit'], ['Sun', 'sun'], ['Tree', 'tree'],
  ['Umbrella', 'umbrella'], ['Violin', 'violin'], ['Watermelon', 'watermelon'], ['Fox', 'fox'],
  ['Yo-yo', 'yoyo'], ['Zebra', 'zebra'],
];

const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// الحرف X يظهر في آخر كلمة Fox.
const NUM_WORDS = [
  'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة',
  'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر',
  'ثمانية عشر', 'تسعة عشر', 'عشرون',
];
const COLORS: [string, string, string, string, string][] = [
  ['red', 'أحمر', '#E5383B', '●', 'apple'], ['blue', 'أزرق', '#2F6FED', '■', 'whale'],
  ['yellow', 'أصفر', '#FFD23F', '▲', 'banana'], ['green', 'أخضر', '#2BA84A', '★', 'frog'],
  ['orange', 'برتقالي', '#F77F00', '◆', 'orange'], ['purple', 'بنفسجي', '#8E44C9', '✚', 'grapes'],
  ['pink', 'وردي', '#FF8FB8', '♥', 'blossom'], ['brown', 'بني', '#8B5A2B', '⬟', 'bear'],
  ['black', 'أسود', '#1F1F24', '⬢', 'blackcat'], ['white', 'أبيض', '#FFFFFF', '☾', 'cloud'],
];

const toArabicDigits = (n: number) =>
  String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

export const ITEMS: Item[] = [
  ...AR.map(([display, word, art], i): Item => ({
    id: `ar-${i + 1}`, island: 'ar', display, word, lang: 'ar', art,
  })),
  ...EN.map(([word, art], i): Item => ({
    id: `en-${i + 1}`, island: 'en', display: LATIN[i], altDisplay: LATIN[i].toLowerCase(), word, lang: 'en', art,
  })),
  ...NUM_WORDS.map((word, i): Item => ({
    id: `num-${i + 1}`, island: 'num', display: String(i + 1), altDisplay: toArabicDigits(i + 1),
    word, lang: 'ar', art: 'star', count: i + 1,
  })),
  ...COLORS.map(([id, word, colorHex, symbol, art]): Item => ({
    id, island: 'color', display: symbol, word, lang: 'ar', art, colorHex, symbol,
  })),
];
