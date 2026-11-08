import { useEffect, useState, type ReactNode } from 'react';
import { artUrl } from '../content/art';
import { MEDIA } from '../content/media';
import { recordingFor } from '../content/recordings';
import { playClips } from '../app/audio';
import { T } from '../content/strings';
import { getStrokes, type Stroke } from '../content/strokes';
import { WORD_ISLANDS, type Item } from '../content/types';
import type { Feedback } from '../feedback/feedback';
import { ItemGlyph, ItemPicture } from '../games/ItemFace';
import type { HearingMode } from '../settings/settings';

interface Props {
  item: Item;
  mode: HearingMode;
  sound: boolean;
  feedback: Feedback;
  reduceMotion: boolean;
}

const toPath = (s: Stroke) => s.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');

function WritingDemo({ strokes, reduceMotion }: { strokes: Stroke[]; reduceMotion: boolean }) {
  return (
    <svg className={`writing-demo${reduceMotion ? ' still' : ''}`} viewBox="0 0 100 100" aria-hidden="true">
      {strokes.map((s, i) => (s.length > 1
        ? <path key={i} d={toPath(s)} pathLength={1} style={{ animationDelay: `${i * 0.9}s` }} />
        : <circle key={i} cx={s[0].x} cy={s[0].y} r={4.5} style={{ animationDelay: `${i * 0.9}s` }} />))}
    </svg>
  );
}

export function LearnCard({ item, mode, sound, feedback, reduceMotion }: Props) {
  const [, refresh] = useState(0);
  useEffect(() => feedback.onVoicesChanged(() => refresh((n) => n + 1)), [feedback]);

  const media = MEDIA[item.id] ?? {};
  // الحروف تنقال باسمها ثم كلمتها، والباقي بكلمته.
  const clips = [media.audio, recordingFor(`${item.id}:name`), recordingFor(item.id)].filter((c): c is string => Boolean(c));
  const canListen = sound && (clips.length > 0 || feedback.canSpeak(item.lang));
  const listen = () => {
    if (clips.length) playClips(clips);
    else feedback.speak(item.word, item.lang);
  };

  const sign: ReactNode = media.sign && (
    <video key="sign" data-testid="media-sign" className="media" src={media.sign} controls loop muted playsInline />
  );
  const mouth: ReactNode = media.mouth && (
    <img key="mouth" data-testid="media-mouth" className="media" src={media.mouth} alt="" />
  );
  const speech: ReactNode = canListen && (
    <button key="listen" type="button" className="listen" data-testid="listen" aria-label={T.listen} onClick={listen}>🔊</button>
  );
  const aids = mode === 'visual' ? [sign, mouth, speech] : [speech, mouth, sign];
  const strokes = getStrokes(item);

  return (
    <div className="learn-card" data-testid="learn-card" data-item={item.id}>
      <div className="learn-main">
        {!WORD_ISLANDS.includes(item.island) && (
          <div className="learn-glyph">
            <ItemGlyph item={item} />
            {item.island === 'en' && <span className="lower" dir="ltr">{item.altDisplay}</span>}
          </div>
        )}
        <ItemPicture item={item} />
      </div>
      <p className="learn-word" data-testid="learn-word" dir={item.lang === 'en' ? 'ltr' : 'rtl'}>{item.word}</p>
      {strokes.length > 0 && strokes.length < 2 && <WritingDemo strokes={strokes[0]} reduceMotion={reduceMotion} />}
      {aids.some(Boolean) && <div className="learn-aids">{aids}</div>}
    </div>
  );
}
