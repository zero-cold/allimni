import type { Feedback } from '../feedback/feedback';

export type FeedbackKind = 'correct' | 'wrong' | 'celebrate';
export const FEEDBACK_EVENT = 'allimni-feedback';

// يبث كل تغذية راجعة حتى تتفاعل البومة والفقاعات معها بصرياً.
export function withEvents(f: Feedback): Feedback {
  const emit = (kind: FeedbackKind) => window.dispatchEvent(new CustomEvent(FEEDBACK_EVENT, { detail: kind }));
  return {
    ...f,
    correct() { f.correct(); emit('correct'); },
    wrong() { f.wrong(); emit('wrong'); },
    celebrate() { f.celebrate(); emit('celebrate'); },
  };
}

export const motionReduced = () =>
  document.documentElement.dataset.reduceMotion === 'true'
  || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
