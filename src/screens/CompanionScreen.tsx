import { useEffect, useState } from 'react';
import { PearlCount } from '../app/Pearls';
import { useApp } from '../app/store';
import { artUrl, FOODS } from '../content/art';
import { T } from '../content/strings';
import { OUTFITS, unlockedOutfits } from '../progress/progress';

export function CompanionScreen() {
  const { active, feedback, updateProfile, navigate } = useApp();
  const profile = active!;
  const [eating, setEating] = useState<string | null>(null);
  const open = unlockedOutfits(profile.progress.stars);

  useEffect(() => {
    if (!eating) return;
    const t = setTimeout(() => setEating(null), 900);
    return () => clearTimeout(t);
  }, [eating]);

  return (
    <main className="companion" data-testid="companion">
      <header className="top-bar">
        <button type="button" className="icon-button" data-testid="companion-back" aria-label={T.toMap} onClick={() => navigate({ name: 'map' })}>▶</button>
        <span className="child-name" />
        <PearlCount n={profile.progress.stars} />
      </header>
      <div className="room">
        <div className="window" aria-hidden="true"><img src={artUrl('boat')} alt="" /></div>
        <div className={`pet${eating && !profile.settings.reduceMotion ? ' happy' : ''}`}>
          <img src={artUrl('owl')} alt="" />
          {profile.outfit && <img className={`worn worn-${profile.outfit}`} src={artUrl(profile.outfit)} alt="" />}
          {eating && <img key={eating} className="eaten" src={artUrl(eating)} alt="" />}
        </div>
        <div className="rug" aria-hidden="true" />
      </div>
      <div className="shelf food-shelf">
        {FOODS.map((f) => (
          <button key={f} type="button" className="tile" data-testid={`food-${f}`} aria-label={f} onClick={() => { setEating(f); feedback?.correct(); }}>
            <img src={artUrl(f)} alt="" />
          </button>
        ))}
      </div>
      <div className="shelf">
        {OUTFITS.map((o) => {
          const unlocked = open.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              className={`tile outfit${profile.outfit === o.id ? ' selected' : ''}`}
              data-testid={`outfit-${o.id}`}
              aria-label={o.id}
              aria-pressed={profile.outfit === o.id}
              disabled={!unlocked}
              onClick={() => updateProfile(profile.id, (p) => ({ ...p, outfit: p.outfit === o.id ? undefined : o.id }))}
            >
              <img src={artUrl(o.id)} alt="" />
              {!unlocked && <small className="price"><span className="pearl" aria-hidden="true" /> {o.stars}</small>}
            </button>
          );
        })}
      </div>
    </main>
  );
}
