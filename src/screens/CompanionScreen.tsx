import { useState } from 'react';
import { useApp } from '../app/store';
import { artUrl, FOODS } from '../content/art';
import { OUTFITS, unlockedOutfits } from '../progress/progress';

export function CompanionScreen() {
  const { active, feedback, updateProfile, navigate } = useApp();
  const profile = active!;
  const [eating, setEating] = useState<string | null>(null);
  const open = unlockedOutfits(profile.progress.stars);
  const motion = !profile.settings.reduceMotion;

  return (
    <main className="companion" data-testid="companion">
      <header className="map-bar">
        <button type="button" className="icon-button" data-testid="companion-back" aria-label="الخريطة" onClick={() => navigate({ name: 'map' })}>▶</button>
        <span className="star-count"><span aria-hidden="true">★</span> {profile.progress.stars}</span>
      </header>
      <div className={`pet${eating && motion ? ' happy' : ''}`} onAnimationEnd={() => setEating(null)}>
        <img src={artUrl('owl')} alt="" />
        {profile.outfit && <img className={`worn worn-${profile.outfit}`} src={artUrl(profile.outfit)} alt="" />}
        {eating && <img className="eaten" src={artUrl(eating)} alt="" />}
      </div>
      <div className="shelf">
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
              {!unlocked && <small><span aria-hidden="true">★</span> {o.stars}</small>}
            </button>
          );
        })}
      </div>
    </main>
  );
}
