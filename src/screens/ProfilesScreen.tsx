import { useState } from 'react';
import { useApp } from '../app/store';
import { artUrl } from '../content/art';
import { T } from '../content/strings';
import { MAX_PROFILES } from '../settings/settings';
import { ParentGate } from './ParentGate';
import { ProfileForm } from './ProfileForm';

// حروف تطفو على أطراف الشعار، بعيد عن الكلمة نفسها.
const FLOATERS: [string, string, string][] = [['أ', '8%', '12%'], ['ب', '14%', '42%'], ['A', '82%', '44%'], ['١', '78%', '30%']];

export function ProfilesScreen() {
  const { state, loadFailed, selectProfile, addProfile, navigate } = useApp();
  const empty = state.profiles.length === 0;
  const [view, setView] = useState<'list' | 'gate' | 'form'>(empty ? 'gate' : 'list');

  const warning = loadFailed && <p className="notice" data-testid="load-warning">{T.loadFailed}</p>;

  if (view === 'gate') {
    return <div className="screen-pad">{warning}<ParentGate onPass={() => setView('form')} onCancel={empty ? undefined : () => setView('list')} /></div>;
  }
  if (view === 'form') {
    return (
      <div className="screen-pad">
        <ProfileForm
          onSave={(p) => { addProfile(p); setView('list'); }}
          onCancel={state.profiles.length ? () => setView('list') : undefined}
        />
      </div>
    );
  }
  return (
    <main className="profiles">
      <button type="button" className="icon-button parent-link" data-testid="open-parent" aria-label={T.parentPanel} onClick={() => navigate({ name: 'parent' })}>⚙</button>
      <div className="hero">
        <div className="floaters" aria-hidden="true">
          {FLOATERS.map(([f, x, y], i) => <span key={f} style={{ '--i': i, '--x': x, '--y': y } as React.CSSProperties}>{f}</span>)}
        </div>
        <img className="hero-owl" src={artUrl('owl')} alt="" />
        <h1 className="logo">{T.appName}</h1>
      </div>
      {warning}
      <div className="profile-grid">
        {state.profiles.map((p, i) => (
          <button key={p.id} type="button" className={`profile-card tint-${i % 4}`} data-testid={`profile-card-${i}`} onClick={() => selectProfile(p.id)}>
            <span className="avatar-ring"><img src={artUrl(p.avatar)} alt="" /></span>
            <span className="profile-name">{p.name}</span>
          </button>
        ))}
        {state.profiles.length < MAX_PROFILES && (
          <button type="button" className="profile-card add" data-testid="profile-add" aria-label={T.addChild} onClick={() => setView('gate')}>
            <span className="avatar-ring">＋</span>
          </button>
        )}
      </div>
    </main>
  );
}
