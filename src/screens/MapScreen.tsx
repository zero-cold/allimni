import { useApp } from '../app/store';
import { PearlCount } from '../app/Pearls';
import { artUrl } from '../content/art';
import { getStages } from '../content/stages';
import { T } from '../content/strings';
import { ISLAND_IDS } from '../content/types';
import { ISLAND_LOOK } from '../content/islands';
import { isStageUnlocked } from '../progress/progress';

const ISLANDS = ISLAND_IDS.map((id) => ({ id, ...ISLAND_LOOK[id] }));

const ROW = 96;
const WIDTH = 300;
// الطريق يتلوى يمين ويسار مثل مسار قارب بين الجزر.
const OFFSETS = [0, 70, 100, 70, 0, -70, -100, -70];
const xAt = (i: number) => WIDTH / 2 + OFFSETS[i % OFFSETS.length];
const yAt = (i: number) => i * ROW + ROW / 2;

export function MapScreen() {
  const { active, navigate, selectProfile } = useApp();
  const { progress, avatar, name } = active!;

  return (
    <main className="map" data-testid="map">
      <header className="top-bar">
        <button type="button" className="icon-button avatar-button" aria-label={T.changeChild} data-testid="change-child" onClick={() => selectProfile(null)}>
          <img src={artUrl(avatar)} alt="" />
        </button>
        <span className="child-name">{name}</span>
        <PearlCount n={progress.stars} testId="stars" />
        <button type="button" className="icon-button" aria-label={T.talk.title} data-testid="open-talk" onClick={() => navigate({ name: 'talk' })}>
          <img src={artUrl('speech')} alt="" />
        </button>
        <button type="button" className="icon-button" aria-label={T.stories.title} data-testid="open-stories" onClick={() => navigate({ name: 'stories' })}>
          <img src={artUrl('book')} alt="" />
        </button>
        <button type="button" className="icon-button" aria-label={T.companion} data-testid="open-companion" onClick={() => navigate({ name: 'companion' })}>
          <img src={artUrl('owl')} alt="" />
        </button>
        <button type="button" className="icon-button quiet" aria-label={T.parentPanel} data-testid="open-parent" onClick={() => navigate({ name: 'parent' })}>⚙</button>
      </header>

      <nav className="island-tabs" aria-label={T.toMap}>
        {ISLANDS.map((island) => (
          <button
            key={island.id}
            type="button"
            className={`island-tab island-${island.id}`}
            aria-label={T.islands[island.id]}
            onClick={() => document.getElementById(`island-${island.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            {island.badge}
          </button>
        ))}
      </nav>

      <div className="islands">
        {ISLANDS.map((island) => {
          const stages = getStages(island.id);
          const done = progress.completed[island.id].length;
          const currentIndex = stages.findIndex((s) => isStageUnlocked(progress, island.id, s.index) && !progress.completed[island.id].includes(s.index));
          const points = stages.map((s) => `${xAt(s.index)},${yAt(s.index)}`).join(' ');
          return (
            <section key={island.id} id={`island-${island.id}`} className={`island island-${island.id}`} data-testid={`island-${island.id}`}>
              <header className="island-banner">
                <span className="badge" aria-hidden="true">{island.badge}</span>
                <h2 dir={island.id === 'en' ? 'ltr' : undefined}>{T.islands[island.id]}</h2>
                <span className="island-score" dir="ltr">{done}/{stages.length}</span>
                <img className="island-art" src={artUrl(island.art)} alt="" />
              </header>
              <div className="path" style={{ height: stages.length * ROW }}>
                <svg className="path-line" viewBox={`0 0 ${WIDTH} ${stages.length * ROW}`} aria-hidden="true">
                  <polyline points={points} />
                </svg>
                {stages.map((s) => {
                  const open = isStageUnlocked(progress, island.id, s.index);
                  const complete = progress.completed[island.id].includes(s.index);
                  const current = s.index === currentIndex;
                  return (
                    <div key={s.index} className="stop" style={{ left: xAt(s.index), top: yAt(s.index) }}>
                      {current && <img className="you-are-here" src={artUrl('boat')} alt="" />}
                      <button
                        type="button"
                        disabled={!open}
                        data-testid={`stage-${island.id}-${s.index}`}
                        aria-label={`${T.islands[island.id]} ${s.index + 1}`}
                        className={`stone${complete ? ' done' : ''}${current ? ' current' : ''}`}
                        onClick={() => navigate({ name: 'stage', island: island.id, index: s.index })}
                      >
                        {complete ? <span className="pearl big" aria-hidden="true" /> : open ? s.index + 1 : <span aria-hidden="true">🔒</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
