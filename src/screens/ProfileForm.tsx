import { useState, type FormEvent } from 'react';
import { artUrl, AVATARS } from '../content/art';
import { emptyProgress } from '../progress/progress';
import { defaultSettings, type HearingMode, type Profile } from '../settings/settings';

export const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function ProfileForm({ initial, onSave, onCancel }: { initial?: Profile; onSave(p: Profile): void; onCancel?: () => void }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [avatar, setAvatar] = useState(initial?.avatar ?? AVATARS[0]);
  const [mode, setMode] = useState<HearingMode>('visual');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (initial) { onSave({ ...initial, name: name.trim(), avatar }); return; }
    onSave({
      id: newId(), name: name.trim(), avatar, mode,
      settings: defaultSettings(mode, prefersReducedMotion()), progress: emptyProgress(),
    });
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h1>{initial ? 'تعديل الملف' : 'ملف طفل جديد'}</h1>
      <label htmlFor="profile-name">اسم الطفل</label>
      <input id="profile-name" data-testid="profile-name" maxLength={20} value={name} onChange={(e) => setName(e.target.value)} />
      <p className="field-label">الصورة</p>
      <div className="avatars">
        {AVATARS.map((a) => (
          <button key={a} type="button" aria-label={a} aria-pressed={avatar === a} className={`avatar-pick${avatar === a ? ' selected' : ''}`} onClick={() => setAvatar(a)}>
            <img src={artUrl(a)} alt="" />
          </button>
        ))}
      </div>
      {!initial && (
        <>
      <p className="field-label">كيف يستفيد الطفل من السمع؟</p>
      <div className="row">
        <button type="button" data-testid="mode-visual" aria-pressed={mode === 'visual'} className={mode === 'visual' ? 'selected' : ''} onClick={() => setMode('visual')}>يعتمد على النظر</button>
        <button type="button" data-testid="mode-partial" aria-pressed={mode === 'partial'} className={mode === 'partial' ? 'selected' : ''} onClick={() => setMode('partial')}>يسمع جزئياً</button>
      </div>
        </>
      )}
      <div className="row">
        <button type="submit" className="primary" data-testid="profile-save" disabled={!name.trim()}>حفظ</button>
        {onCancel && <button type="button" onClick={onCancel}>رجوع</button>}
      </div>
    </form>
  );
}
