import { useState } from 'react';
import { playClips } from '../app/audio';
import { useApp } from '../app/store';
import { artUrl } from '../content/art';
import { recordingFor } from '../content/recordings';
import { T } from '../content/strings';
import { TALK, TALK_SECTIONS, type TalkCard, type TalkSection } from '../content/talk';

// صورة العيلة تطلع على بطاقة الشخص، وعلى «أبي ماما» و«أبي بابا» بعد.
export const photoKey = (id: string) => id.replace(/^talk-(mama|baba)$/, 'family-$1');

export function TalkScreen() {
  const { state, active, feedback, navigate } = useApp();
  const [section, setSection] = useState<TalkSection>('want');
  const [open, setOpen] = useState<TalkCard | null>(null);
  const photos = state.photos ?? {};
  const picture = (c: TalkCard) => photos[photoKey(c.id)] ?? artUrl(c.art);

  const show = (c: TalkCard) => {
    setOpen(c);
    feedback?.correct();
    if (!active?.settings.sound) return;
    const clip = recordingFor(c.id);
    if (clip) playClips([clip]);
    else feedback?.speak(c.word, 'ar');
  };

  return (
    <main className="talk" data-testid="talk">
      <header className="top-bar">
        <button type="button" className="icon-button" data-testid="talk-back" aria-label={T.toMap} onClick={() => navigate({ name: 'map' })}>▶</button>
        <h1 className="screen-title">{T.talk.title}</h1>
      </header>
      <nav className="talk-tabs">
        {TALK_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            data-testid={`talk-tab-${s.id}`}
            aria-pressed={section === s.id}
            className={`talk-tab${section === s.id ? ' selected' : ''}`}
            onClick={() => setSection(s.id)}
          >
            <img src={artUrl(s.art)} alt="" />
            <span>{T.talk.sections[s.id]}</span>
          </button>
        ))}
      </nav>
      <div className="talk-grid">
        {TALK.filter((c) => c.section === section).map((c) => (
          <button key={c.id} type="button" className="talk-card" data-testid={`talk-card-${c.id}`} onClick={() => show(c)}>
            <img className={photos[photoKey(c.id)] ? 'photo' : ''} src={picture(c)} alt="" />
            <span>{c.word}</span>
          </button>
        ))}
      </div>
      {open && (
        <div className="talk-big" data-testid="talk-big" role="dialog" aria-label={open.word}>
          <img className={photos[photoKey(open.id)] ? 'photo' : ''} src={picture(open)} alt="" />
          <p>{open.word}</p>
          <button type="button" className="icon-button" data-testid="talk-close" aria-label={T.talk.close} onClick={() => setOpen(null)}>✕</button>
        </div>
      )}
    </main>
  );
}
