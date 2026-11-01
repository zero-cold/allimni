import { useState } from 'react';
import { useApp } from '../app/store';
import { artUrl } from '../content/art';
import { MAX_PROFILES } from '../settings/settings';
import { ParentGate } from './ParentGate';
import { ProfileForm } from './ProfileForm';

export function ProfilesScreen() {
  const { state, loadFailed, selectProfile, addProfile, navigate } = useApp();
  const empty = state.profiles.length === 0;
  const [view, setView] = useState<'list' | 'gate' | 'form'>(empty ? 'gate' : 'list');

  const warning = loadFailed && (
    <p className="notice" data-testid="load-warning">تعذرت قراءة البيانات المحفوظة على هذا الجهاز، وقد لا يظهر التقدم السابق.</p>
  );

  if (view === 'gate') {
    return <>{warning}<ParentGate onPass={() => setView('form')} onCancel={empty ? undefined : () => setView('list')} /></>;
  }
  if (view === 'form') {
    return (
      <ProfileForm
        onSave={(p) => { addProfile(p); setView('list'); }}
        onCancel={state.profiles.length ? () => setView('list') : undefined}
      />
    );
  }
  return (
    <main className="profiles">
      <h1 className="logo">علمني</h1>
      {warning}
      <div className="profile-grid">
        {state.profiles.map((p, i) => (
          <button key={p.id} type="button" className="profile-card" data-testid={`profile-card-${i}`} onClick={() => selectProfile(p.id)}>
            <img src={artUrl(p.avatar)} alt="" />
            <span>{p.name}</span>
          </button>
        ))}
        {state.profiles.length < MAX_PROFILES && (
          <button type="button" className="profile-card add" data-testid="profile-add" aria-label="إضافة طفل" onClick={() => setView('gate')}>＋</button>
        )}
      </div>
      <button type="button" className="parent-link" data-testid="open-parent" aria-label="لوحة ولي الأمر" onClick={() => navigate({ name: 'parent' })}>⚙</button>
    </main>
  );
}
