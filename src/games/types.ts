import type { Item } from '../content/types';
import type { Feedback } from '../feedback/feedback';

export interface GameProps {
  items: Item[];
  feedback: Feedback;
  reduceMotion: boolean;
  onAnswer(itemId: string, a: { correct: boolean; hinted: boolean }): void;
  onDone(): void;
}
