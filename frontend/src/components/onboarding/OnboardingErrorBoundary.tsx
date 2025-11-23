'use client';

import React from 'react';

interface OnboardingErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface OnboardingErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class OnboardingErrorBoundary extends React.Component<
  OnboardingErrorBoundaryProps,
  OnboardingErrorBoundaryState
> {
  constructor(props: OnboardingErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): OnboardingErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Onboarding Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Erreur d'onboarding
            </h3>
            <p className="text-gray-600 mb-4">
              Une erreur s'est produite lors du chargement de l'onboarding.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="btn btn-primary"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
