import { artUrl } from '../content/art';
import type { Item } from '../content/types';

export const shuffle = <T,>(xs: T[]): T[] => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// الوجه الرمزي للعنصر: الحرف أو الرقم بشكليه أو عينة اللون مع رمزها.
export function ItemGlyph({ item }: { item: Item }) {
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
