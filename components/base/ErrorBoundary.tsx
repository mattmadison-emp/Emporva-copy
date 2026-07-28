import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // TODO: Send to error reporting service (e.g., Sentry)
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-red-100 rounded-full">
              <i className="ri-error-warning-line text-3xl text-red-600"></i>
            </div>
            <h1
              className="text-2xl font-bold text-[#0B1F33] mb-3"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Something went wrong
            </h1>
            <p
              className="text-[#6B7C8F] mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors cursor-pointer"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
