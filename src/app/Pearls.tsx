export const Pearl = ({ dim = false }: { dim?: boolean }) => <span className={`pearl${dim ? ' dim' : ''}`} aria-hidden="true" />;

export function PearlCount({ n, testId }: { n: number; testId?: string }) {
  return (
    <span className="pearl-count" data-testid={testId}>
      <Pearl />
      <span>{n}</span>
    </span>
  );
}
