import { Component, type ReactNode } from 'react';
import { T } from '../content/strings';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="panel">
        <h1>{T.error.title}</h1>
        <p>{T.error.body}</p>
        <button type="button" className="primary" data-testid="error-reload" onClick={() => location.reload()}>{T.error.reload}</button>
      </main>
    );
  }
}
