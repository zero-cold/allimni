import { useState, type FormEvent } from 'react';
import { T } from '../content/strings';

const toAscii = (v: string) =>
  v.trim().replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660)).replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x6f0));

export function makeGateQuestion(rand: () => number = Math.random) {
  const pick = () => 2 + Math.floor(rand() * 8);
  const a = pick();
  const b = pick();
  return { a, b, answer: a * b };
}

export function ParentGate({ onPass, onCancel }: { onPass(): void; onCancel?: () => void }) {
  const [q, setQ] = useState(() => makeGateQuestion());
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (Number(toAscii(value)) === q.answer) { onPass(); return; }
    setWrong(true);
    setValue('');
    setQ(makeGateQuestion());
  };

  return (
    <form className="panel gate" onSubmit={submit}>
      <h1>{T.gate.title}</h1>
      <p>{T.gate.hint}</p>
      <p className="gate-question" data-testid="gate-question" dir="ltr">{q.a} × {q.b} = ?</p>
      <input
        id="gate-answer"
        data-testid="gate-answer"
        aria-label={T.gate.answer}
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {wrong && <p role="alert">{T.gate.wrong}</p>}
      <div className="row">
        <button type="submit" className="primary" data-testid="gate-submit">{T.gate.go}</button>
        {onCancel && <button type="button" onClick={onCancel}>{T.back}</button>}
      </div>
    </form>
  );
}
