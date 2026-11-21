import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F1F2F3] flex items-center justify-center p-6 text-gray-900">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#D0D8D8] p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 text-[#D94343] flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#0F161D]">Something went wrong</h2>
              <p className="text-sm text-[#777F83] mt-2">
                An unexpected display error occurred while rendering this view.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-red-50 text-left rounded-lg text-xs font-mono text-red-800 border border-red-200 overflow-x-auto max-h-28">
                {this.state.error.toString()}
              </div>
            )}
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="px-4 py-2.5 rounded-xl border border-[#D0D8D8] text-sm font-semibold text-[#30383D] hover:bg-gray-100 transition-all"
              >
                Go Home
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 rounded-xl bg-[#1E4252] text-[#C3FF01] text-sm font-bold flex items-center gap-2 hover:bg-[#193847] transition-all shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                Reload View
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
