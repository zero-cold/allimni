import { useApp } from '../app/store';
import { artUrl } from '../content/art';
import { getStages } from '../content/stages';
import type { IslandId } from '../content/types';
import { isStageUnlocked } from '../progress/progress';

const ISLANDS: { id: IslandId; title: string; badge: string }[] = [
  { id: 'ar', title: 'الحروف العربية', badge: 'أ' },
  { id: 'en', title: 'English', badge: 'A' },
  { id: 'num', title: 'الأرقام', badge: '١' },
  { id: 'color', title: 'الألوان', badge: '🎨' },
];

export function MapScreen() {
  const { active, navigate, selectProfile } = useApp();
  const { progress, avatar, name } = active!;
  return (
    <main className="map" data-testid="map">
      <header className="map-bar">
        <button type="button" className="icon-button" aria-label="تغيير الطفل" data-testid="change-child" onClick={() => selectProfile(null)}>
          <img src={artUrl(avatar)} alt="" />
        </button>
        <span className="child-name">{name}</span>
        <span className="star-count" data-testid="stars"><span aria-hidden="true">★</span> {progress.stars}</span>
        <button type="button" className="icon-button" aria-label="الرفيق" data-testid="open-companion" onClick={() => navigate({ name: 'companion' })}>
          <img src={artUrl('owl')} alt="" />
        </button>
        <button type="button" className="icon-button" aria-label="لوحة ولي الأمر" data-testid="open-parent" onClick={() => navigate({ name: 'parent' })}>⚙</button>
      </header>
      <div className="islands">
        {ISLANDS.map((island) => (
          <section key={island.id} className={`island island-${island.id}`} data-testid={`island-${island.id}`}>
            <h2><span className="badge" aria-hidden="true">{island.badge}</span>{island.title}</h2>
            <div className="stones">
              {getStages(island.id).map((s) => {
                const open = isStageUnlocked(progress, island.id, s.index);
                const complete = progress.completed[island.id].includes(s.index);
                return (
                  <button
                    key={s.index}
                    type="button"
                    disabled={!open}
                    data-testid={`stage-${island.id}-${s.index}`}
                    aria-label={`${island.title} ${s.index + 1}`}
                    className={`stone${complete ? ' done' : ''}${open && !complete ? ' current' : ''}`}
                    onClick={() => navigate({ name: 'stage', island: island.id, index: s.index })}
                  >
                    {complete ? '★' : open ? s.index + 1 : '🔒'}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
