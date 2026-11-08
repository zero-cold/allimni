import { useState } from 'react';
import { useApp } from '../app/store';
import { artUrl } from '../content/art';
import { STORIES, type Story } from '../content/stories';
import { T } from '../content/strings';

export function StoriesScreen() {
  const { active, feedback, navigate } = useApp();
  const [story, setStory] = useState<Story | null>(null);
  const [page, setPage] = useState(0);
  const canListen = Boolean(active?.settings.sound && feedback?.canSpeak('ar'));

  if (story) {
    const p = story.pages[page];
    const last = page + 1 === story.pages.length;
    return (
      <main className="story" data-testid="story">
        <header className="top-bar">
          <button type="button" className="icon-button" aria-label={T.back} onClick={() => setStory(null)}>▶</button>
          <span className="story-dots" aria-hidden="true">
            {story.pages.map((_, i) => <span key={i} className={i <= page ? 'on' : ''} />)}
          </span>
        </header>
        <div className="story-page" data-testid="story-page" key={page}>
          <div className="story-art">{p.art.map((a, i) => <img key={i} src={artUrl(a)} alt="" />)}</div>
          <p className="story-text">{p.text}</p>
          {canListen && (
            <button type="button" className="listen" aria-label={T.listen} onClick={() => feedback?.speak(p.text, 'ar')}>🔊</button>
          )}
        </div>
        <button
          type="button"
          className="go-button"
          data-testid="story-next"
          aria-label={T.next}
          onClick={() => {
            if (last) { feedback?.celebrate(); setStory(null); setPage(0); } else setPage(page + 1);
          }}
        >
          {last ? '✓' : '◀'}
        </button>
      </main>
    );
  }

  return (
    <main className="stories" data-testid="stories">
      <header className="top-bar">
        <button type="button" className="icon-button" data-testid="stories-back" aria-label={T.toMap} onClick={() => navigate({ name: 'map' })}>▶</button>
        <h1 className="screen-title">{T.stories.title}</h1>
      </header>
      <div className="story-shelf">
        {STORIES.map((s) => (
          <button key={s.id} type="button" className="story-cover" data-testid={`story-${s.id}`} onClick={() => { setStory(s); setPage(0); }}>
            <img src={artUrl(s.cover)} alt="" />
            <span>{s.title}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
