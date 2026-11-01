import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../app/store';
import { artUrl } from '../content/art';
import { getItem, getStages } from '../content/stages';
import type { IslandId } from '../content/types';
import { createFeedback } from '../feedback/feedback';
import { defaultSettings, type HearingMode, type Profile, type Settings } from '../settings/settings';
import { ParentGate } from './ParentGate';
import { prefersReducedMotion } from './ProfileForm';

const ISLANDS: [IslandId, string][] = [
  ['ar', 'الحروف العربية'], ['en', 'الحروف الإنجليزية'], ['num', 'الأرقام'], ['color', 'الألوان'],
];

function Toggle({ id, label, on, onClick }: { id: string; label: string; on: boolean; onClick(): void }) {
  return (
    <button type="button" data-testid={id} aria-pressed={on} className={on ? 'selected' : ''} onClick={onClick}>
      {label}: {on ? 'مفعّل' : 'مغلق'}
    </button>
  );
}

function ChildPanel({ profile }: { profile: Profile }) {
  const { updateProfile, removeProfile } = useApp();
  const [confirming, setConfirming] = useState(false);
  const { id, settings, progress, mode } = profile;
  const set = (patch: Partial<Settings>) =>
    updateProfile(id, (p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  const setMode = (m: HearingMode) =>
    updateProfile(id, (p) => ({ ...p, mode: m, settings: defaultSettings(m, prefersReducedMotion()) }));
  const practice = Object.keys(progress.practice).map(getItem);

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
        <strong>يحتاج تدريب: </strong>
        {practice.length ? practice.map((i) => (i.island === 'color' ? i.word : i.display)).join('، ') : 'لا شيء حالياً'}
      </p>
      <p className="field-label">طريقة الاستفادة من السمع</p>
      <div className="row">
        <button type="button" data-testid={`mode-visual-${id}`} aria-pressed={mode === 'visual'} className={mode === 'visual' ? 'selected' : ''} onClick={() => setMode('visual')}>يعتمد على النظر</button>
        <button type="button" data-testid={`mode-partial-${id}`} aria-pressed={mode === 'partial'} className={mode === 'partial' ? 'selected' : ''} onClick={() => setMode('partial')}>يسمع جزئياً</button>
      </div>
      <div className="row">
        <Toggle id={`sound-${id}`} label="الصوت" on={settings.sound} onClick={() => set({ sound: !settings.sound })} />
        <button type="button" data-testid={`rate-${id}`} onClick={() => set({ speechRate: settings.speechRate === 'slow' ? 'normal' : 'slow' })}>
          سرعة النطق: {settings.speechRate === 'slow' ? 'بطيء' : 'عادي'}
        </button>
        <Toggle id={`vibration-${id}`} label="الاهتزاز" on={settings.vibration} onClick={() => set({ vibration: !settings.vibration })} />
        <Toggle id={`motion-${id}`} label="تخفيف الحركة" on={settings.reduceMotion} onClick={() => set({ reduceMotion: !settings.reduceMotion })} />
      </div>
      {confirming ? (
        <div className="confirm" role="alertdialog" aria-label="تأكيد الحذف">
          <p>سيُحذف ملف {profile.name} وكل تقدمه نهائياً.</p>
          <div className="row">
            <button type="button" className="danger" data-testid="delete-confirm" onClick={() => removeProfile(id)}>حذف الملف</button>
            <button type="button" data-testid="delete-cancel" onClick={() => setConfirming(false)}>إلغاء</button>
          </div>
        </div>
      ) : (
        <button type="button" className="delete-link" data-testid={`delete-${id}`} onClick={() => setConfirming(true)}>حذف الملف</button>
      )}
    </section>
  );
}

export function ParentScreen() {
  const { state, active, saveFailed, navigate } = useApp();
  const [passed, setPassed] = useState(false);
  const [, refresh] = useState(0);
  const voices = useMemo(() => createFeedback(defaultSettings('partial', false)), []);
  useEffect(() => voices.onVoicesChanged(() => refresh((n) => n + 1)), [voices]);
  const back = () => navigate(active ? { name: 'map' } : { name: 'profiles' });

  if (!passed) return <ParentGate onPass={() => setPassed(true)} onCancel={back} />;

  const missing = [!voices.hasVoice('ar') && 'العربية', !voices.hasVoice('en') && 'الإنجليزية'].filter(Boolean);

  return (
    <main className="parent" data-testid="parent">
      <header className="parent-head">
        <button type="button" data-testid="parent-back" onClick={back}>رجوع</button>
        <h1>لوحة ولي الأمر</h1>
      </header>
      {missing.length > 0 && (
        <p className="notice" data-testid="voice-warning">لا يتوفر على هذا الجهاز صوت للغة {missing.join(' و')}، فلن يظهر زر الاستماع لها. يمكن إضافة الأصوات من إعدادات الجهاز.</p>
      )}
      {saveFailed && (
        <p className="notice" data-testid="save-warning">تعذر حفظ التقدم على هذا الجهاز. يستمر اللعب، لكن التقدم قد يضيع عند إغلاق التطبيق. تأكد من أن المتصفح ليس في التصفح الخاص.</p>
      )}
      {state.profiles.map((p) => <ChildPanel key={p.id} profile={p} />)}
      <p className="data-note" data-testid="data-note">كل البيانات محفوظة على هذا الجهاز فقط ولا تُرسل إلى أي مكان. إذا مُسحت بيانات المتصفح يضيع التقدم.</p>
    </main>
  );
}
