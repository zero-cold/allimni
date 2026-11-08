import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../app/store';
import { fillRound, gamesForStage, getItem, getStages } from '../content/stages';
import type { GameId, IslandId, Item } from '../content/types';
import { BalloonGame } from '../games/BalloonGame';
import { MatchGame } from '../games/MatchGame';
import { MixGame } from '../games/MixGame';
import { SayGame } from '../games/SayGame';
import { WordGame } from '../games/WordGame';
import type { Profile } from '../settings/settings';
import { TraceGame } from '../games/TraceGame';
import type { GameProps } from '../games/types';
import { completeStage, practiceItems, recordCorrect, recordMistakes, type Progress } from '../progress/progress';
import { Celebration } from './Celebration';
import { LearnCard } from './LearnCard';
import { StageBar } from './StageBar';
import { T } from '../content/strings';

const ROUND_SIZE = 3;
const MAX_PRACTICE = 2;
const FIRST_STARS = 3;

const GAMES: Record<GameId, (p: GameProps) => React.JSX.Element> = {
  trace: TraceGame, match: MatchGame, balloon: BalloonGame, mix: MixGame, word: WordGame, say: SayGame,
};

// الأطفال اللي يسمعون شوي يتدربون على النطق في آخر كل مرحلة.
export function gamesFor(profile: Profile, island: IslandId, index: number): GameId[] {
  const games: GameId[] = [...gamesForStage(island, index)];
  return profile.mode === 'partial' ? [...games, 'say'] : games;
}

export function buildRound(p: Progress, island: IslandId, index: number): Item[] {
  const round = fillRound(island, index, ROUND_SIZE);
  const extra = practiceItems(p, island, MAX_PRACTICE)
    .filter((id) => !round.some((i) => i.id === id))
    .map(getItem);
  return [...round, ...extra];
}

type Answer = { itemId: string; correct: boolean; hinted: boolean };

export function StageScreen({ island, index }: { island: IslandId; index: number }) {
  const { active, feedback, updateProfile, navigate } = useApp();
  const profile = active!;
  const fb = feedback!;
  const { settings } = profile;
  const [newItems] = useState(() => getStages(island)[index].itemIds.map(getItem));
  const [round] = useState(() => buildRound(profile.progress, island, index));
  const [games] = useState(() => gamesFor(profile, island, index));
  const [runId] = useState(() => `${Date.now()}-${Math.random()}`);
  const [wasDone] = useState(() => profile.progress.completed[island].includes(index));
  const [phase, setPhase] = useState(0);
  const answers = useRef<Answer[]>([]);
  const finished = useRef(false);

  const learnEnd = newItems.length;
  const inLearn = phase < learnEnd;
  const gameIndex = phase - learnEnd;
  const done = gameIndex >= games.length;

  useEffect(() => () => fb.stop(), [fb]);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const log = answers.current;
    updateProfile(profile.id, (p) => {
      let progress = p.progress;
      for (const a of log) if (a.correct) progress = recordCorrect(progress, a.itemId, a.hinted);
      const mistakes = new Map<string, number>();
      for (const a of log) if (!a.correct) mistakes.set(a.itemId, (mistakes.get(a.itemId) ?? 0) + 1);
      for (const [id, n] of mistakes) progress = recordMistakes(progress, id, n);
      return { ...p, progress: completeStage(progress, island, index, runId) };
    });
    fb.celebrate();
  };

  const advanceGame = () => {
    if (gameIndex + 1 >= games.length) finish();
    setPhase(phase + 1);
  };

  const Game = useMemo(() => (inLearn || done ? null : GAMES[games[gameIndex]]), [phase]);

  return (
    <main className={`stage island-${island}`} data-testid="stage">
      <header className="stage-bar">
        <button type="button" className="icon-button" data-testid="stage-exit" aria-label={T.exit} onClick={() => navigate({ name: 'map' })}>✕</button>
        <StageBar step={phase} total={learnEnd + games.length} />
      </header>
      {inLearn && (
        <div className="learn-step">
          <LearnCard key={newItems[phase].id} item={newItems[phase]} mode={profile.mode} sound={settings.sound} feedback={fb} reduceMotion={settings.reduceMotion} />
          <button type="button" className="go-button" data-testid="learn-next" aria-label={T.next} onClick={() => setPhase(phase + 1)}>◀</button>
        </div>
      )}
      {Game && (
        <Game
          key={phase}
          items={round}
          feedback={fb}
          reduceMotion={settings.reduceMotion}
          onAnswer={(itemId, a) => answers.current.push({ itemId, ...a })}
          onDone={advanceGame}
        />
      )}
      {done && (
        <Celebration stars={wasDone ? 1 : FIRST_STARS} reduceMotion={settings.reduceMotion} onDone={() => navigate({ name: 'companion' })} />
      )}
    </main>
  );
}
