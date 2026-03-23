import React, { Component } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center px-4"
                    style={{ backgroundColor: '#0d0d14' }}>
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                            style={{ backgroundColor: '#ef444422', border: '1px solid #ef444444' }}>
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                        <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                                style={{ backgroundColor: '#3e3f3e', color: '#e2e8f0' }}
                            >
                                <RefreshCcw size={16} />
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black"
                                style={{ backgroundColor: '#54c750' }}
                            >
                                Go to Dashboard
                            </button>
                        </div>
                        {this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="text-xs cursor-pointer" style={{ color: '#4a4a6a' }}>
                                    Technical Details
                                </summary>
                                <pre className="mt-2 p-3 rounded-xl text-xs overflow-auto"
                                    style={{ backgroundColor: '#060c06', color: '#ef4444', border: '1px solid #3e3f3e' }}>
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
