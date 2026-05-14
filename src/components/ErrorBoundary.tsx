import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '../services/crashService';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void reportError(error, {
      componentStack: info.componentStack?.slice(0, 1000) ?? 'unknown',
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[100dvh] items-center justify-center p-6">
          <div className="max-w-sm rounded-2xl bg-white/70 p-6 text-center shadow-lg backdrop-blur-sm dark:bg-slate-800/70">
            <p className="mb-3 text-2xl">😵‍💫</p>
            <p className="mb-4 text-sm text-gray-700 dark:text-gray-200">
              Algo deu errado. Tente reabrir o app.
            </p>
            <button
              type="button"
              onClick={this.reset}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
