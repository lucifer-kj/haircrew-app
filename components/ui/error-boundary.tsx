'use client'

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Log error to service if needed
    // console.error(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-8">
          <h2 className="text-2xl font-bold mb-2 text-red-600">Something went wrong</h2>
          <p className="mb-4 text-gray-600">{this.state.error?.message || "An unexpected error occurred. Please try again."}</p>
          <button
            onClick={this.handleRetry}
            className="px-6 py-2 bg-secondary text-white rounded-full font-semibold shadow hover:bg-secondary/90 transition"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
} 