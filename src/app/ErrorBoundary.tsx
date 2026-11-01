import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="panel">
        <h1>حدث خطأ غير متوقع</h1>
        <p>أعد فتح التطبيق للمتابعة. التقدم المحفوظ لم يتأثر.</p>
        <button type="button" className="primary" data-testid="error-reload" onClick={() => location.reload()}>إعادة الفتح</button>
      </main>
    );
  }
}
