import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../app/store';
import { artUrl } from '../content/art';
import { getItem, getStages } from '../content/stages';
import type { IslandId } from '../content/types';
import { createFeedback } from '../feedback/feedback';
import { defaultSettings, type HearingMode, type Profile, type Settings } from '../settings/settings';
import { MAX_PROFILES } from '../settings/settings';
import { T } from '../content/strings';
import { ParentGate } from './ParentGate';
import { ProfileForm, prefersReducedMotion } from './ProfileForm';

const ISLANDS = (Object.keys(T.parentIslands) as IslandId[]).map((id) => [id, T.parentIslands[id]] as const);

function Toggle({ id, label, on, onClick }: { id: string; label: string; on: boolean; onClick(): void }) {
  return (
    <button type="button" data-testid={id} aria-pressed={on} className={on ? 'selected' : ''} onClick={onClick}>
      {label}: {on ? T.parent.on : T.parent.off}
    </button>
  );
}

function ChildPanel({ profile }: { profile: Profile }) {
  const { updateProfile, removeProfile } = useApp();
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const { id, settings, progress, mode } = profile;
  const set = (patch: Partial<Settings>) =>
    updateProfile(id, (p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  const setMode = (m: HearingMode) =>
    updateProfile(id, (p) => ({ ...p, mode: m, settings: defaultSettings(m, prefersReducedMotion()) }));
  const practice = Object.keys(progress.practice).map(getItem);

  if (editing) {
    return (
      <ProfileForm
        initial={profile}
        onCancel={() => setEditing(false)}
        onSave={(next) => { updateProfile(id, (p) => ({ ...p, name: next.name, avatar: next.avatar })); setEditing(false); }}
      />
    );
  }

  return (
    <section className="child-panel">
      <h2><img src={artUrl(profile.avatar)} alt="" />{profile.name}</h2>
      <ul className="progress-list">
        {ISLANDS.map(([island, title]) => (
          <li key={island} data-testid={`progress-${id}-${island}`}>
            <span>{title}</span>
            <span dir="ltr">{progress.completed[island].length} / {getStages(island).length}</span>
          </li>
        ))}
      </ul>
      <p data-testid={`practice-${id}`}>
        <strong>{T.parent.needsPractice} </strong>
        {practice.length ? practice.map((i) => (i.island === 'color' ? i.word : i.display)).join('، ') : T.parent.nothing}
      </p>
      <p className="field-label">{T.parent.hearing}</p>
      <div className="row">
        <button type="button" data-testid={`mode-visual-${id}`} aria-pressed={mode === 'visual'} className={mode === 'visual' ? 'selected' : ''} onClick={() => setMode('visual')}>{T.form.visual}</button>
        <button type="button" data-testid={`mode-partial-${id}`} aria-pressed={mode === 'partial'} className={mode === 'partial' ? 'selected' : ''} onClick={() => setMode('partial')}>{T.form.partial}</button>
      </div>
      <div className="row">
        <Toggle id={`sound-${id}`} label={T.parent.sound} on={settings.sound} onClick={() => set({ sound: !settings.sound })} />
        <button type="button" data-testid={`rate-${id}`} onClick={() => set({ speechRate: settings.speechRate === 'slow' ? 'normal' : 'slow' })}>
          {T.parent.speechRate}: {settings.speechRate === 'slow' ? T.parent.slow : T.parent.normal}
        </button>
        <Toggle id={`vibration-${id}`} label={T.parent.vibration} on={settings.vibration} onClick={() => set({ vibration: !settings.vibration })} />
        <Toggle id={`motion-${id}`} label={T.parent.reduceMotion} on={settings.reduceMotion} onClick={() => set({ reduceMotion: !settings.reduceMotion })} />
      </div>
      {confirming ? (
        <div className="confirm" role="alertdialog" aria-label={T.parent.confirmLabel}>
          <p>{T.parent.confirmDelete(profile.name)}</p>
          <div className="row">
            <button type="button" className="danger" data-testid="delete-confirm" onClick={() => removeProfile(id)}>{T.parent.delete}</button>
            <button type="button" data-testid="delete-cancel" onClick={() => setConfirming(false)}>{T.parent.cancel}</button>
          </div>
        </div>
      ) : (
        <div className="row">
          <button type="button" data-testid={`edit-${id}`} onClick={() => setEditing(true)}>{T.parent.edit}</button>
          <button type="button" className="delete-link" data-testid={`delete-${id}`} onClick={() => setConfirming(true)}>{T.parent.delete}</button>
        </div>
      )}
    </section>
  );
}

export function ParentScreen() {
  const { state, active, saveFailed, loadFailed, addProfile, navigate } = useApp();
  const [adding, setAdding] = useState(false);
  const [passed, setPassed] = useState(false);
  const [, refresh] = useState(0);
  const voices = useMemo(() => createFeedback(defaultSettings('partial', false)), []);
  useEffect(() => voices.onVoicesChanged(() => refresh((n) => n + 1)), [voices]);
  const back = () => navigate(active ? { name: 'map' } : { name: 'profiles' });

  if (!passed) return <ParentGate onPass={() => setPassed(true)} onCancel={back} />;

  const missing = [!voices.hasVoice('ar') && T.parent.langAr, !voices.hasVoice('en') && T.parent.langEn].filter(Boolean);

  return (
    <main className="parent" data-testid="parent">
      <header className="parent-head">
        <button type="button" data-testid="parent-back" onClick={back}>{T.back}</button>
        <h1>{T.parentPanel}</h1>
      </header>
      {missing.length > 0 && (
        <p className="notice" data-testid="voice-warning">{T.parent.voiceMissing(missing.join(' و'))}</p>
      )}
      {saveFailed && (
        <p className="notice" data-testid="save-warning">{T.parent.saveFailed}</p>
      )}
      {loadFailed && (
        <p className="notice" data-testid="load-warning">{T.loadFailed}</p>
      )}
      {state.profiles.map((p) => <ChildPanel key={p.id} profile={p} />)}
      {adding
        ? <ProfileForm onCancel={() => setAdding(false)} onSave={(p) => { addProfile(p); setAdding(false); }} />
        : state.profiles.length < MAX_PROFILES && <button type="button" data-testid="parent-add" onClick={() => setAdding(true)}>{T.addChild}</button>}
      <p className="notice" data-testid="offline-status">
        {typeof navigator !== 'undefined' && navigator.serviceWorker?.controller ? T.parent.offlineReady : T.parent.offlineNotReady}
      </p>
      <p className="data-note" data-testid="data-note">{T.parent.dataNote}</p>
    </main>
  );
}
