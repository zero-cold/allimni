import { artUrl } from '../content/art';
import { WORD_ISLANDS, type Item } from '../content/types';

export const shuffle = <T,>(xs: T[]): T[] => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// الوجه الرمزي للعنصر: الحرف أو الرقم بشكليه أو عينة اللون مع رمزها.
const SHAPE_PATHS: Record<NonNullable<Item['shape']>, string> = {
  circle: 'M50 10a40 40 0 1 1 0 80a40 40 0 1 1 0-80z',
  square: 'M14 14h72v72H14z',
  triangle: 'M50 10l42 76H8z',
  star: 'M50 6l12 28 30 3-23 20 7 30-26-16-26 16 7-30-23-20 30-3z',
  heart: 'M50 88C20 66 6 50 6 32 6 18 17 8 30 8c9 0 16 5 20 12 4-7 11-12 20-12 13 0 24 10 24 24 0 18-14 34-44 56z',
  rectangle: 'M8 26h84v48H8z',
  crescent: 'M62 8a42 42 0 1 0 0 84a34 34 0 1 1 0-84z',
  oval: 'M50 6c22 0 34 20 34 44S72 94 50 94 16 74 16 50 28 6 50 6z',
};

export function ShapeIcon({ shape }: { shape: NonNullable<Item['shape']> }) {
  return (
    <svg className="shape-icon" viewBox="0 0 100 100" aria-hidden="true">
      <path d={SHAPE_PATHS[shape]} />
    </svg>
  );
}

export function ItemGlyph({ item }: { item: Item }) {
  if (item.shape) return <ShapeIcon shape={item.shape} />;
  if (WORD_ISLANDS.includes(item.island)) return <span className="glyph word">{item.word}</span>;
  if (item.colorHex) {
    return <span className="swatch" style={{ background: item.colorHex, color: item.id === 'white' || item.id === 'yellow' ? '#222' : '#fff' }}>{item.symbol}</span>;
  }
  return (
    <span className="glyph" dir={item.lang === 'en' ? 'ltr' : undefined}>
      {item.display}{item.island === 'num' && <small> {item.altDisplay}</small>}
    </span>
  );
}

// الوجه المصور: صورة الكلمة، أو أشياء بعدد الرقم.
export function ItemPicture({ item }: { item: Item }) {
  if (item.count) {
    return (
      <span className={`count-grid${item.count > 10 ? ' dense' : ''}`}>
        {Array.from({ length: item.count }, (_, i) => <img key={i} src={artUrl(item.art)} alt="" />)}
      </span>
    );
  }
  return <img className="picture" src={artUrl(item.art)} alt="" />;
}
