import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

export class FirestoreErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('Application ErrorBoundary caught:', error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    let friendlyDetail = 'Something interrupted loading this section. You can safely reset below.';
    try {
      const parsed = JSON.parse(this.state.message);
      if (parsed?.operationType && parsed?.error) {
        friendlyDetail = `Database ${parsed.operationType} check noticed: ${parsed.error}`;
      }
    } catch {
      if (this.state.message) {
        friendlyDetail = this.state.message;
      }
    }

    return (
      <div className="min-h-[45vh] flex items-center justify-center p-6 bg-[#FAF7F2]">
        <div className="max-w-lg w-full bg-white border border-[#C2593F]/35 rounded-xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C2593F]">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            Service Notice
          </div>
          <h2 className="font-serif text-2xl font-semibold text-[#1E0B2B]">
            We hit a temporary pause
          </h2>
          <p className="text-sm text-[#3E3349] leading-relaxed">{friendlyDetail}</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#3B155F] text-[#FAF7F2] hover:bg-[#2C1042] rounded-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Return Safely
          </button>
        </div>
      </div>
    );
  }
}
