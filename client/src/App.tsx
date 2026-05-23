import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import ResultsPage from './pages/ResultsPage';
import { analyzeRepository } from './api/openpath';
import type { AnalysisData, AnalysisRequest, AppView } from './types';

// Loading screen shown during analysis
function AnalyzingScreen({ repoUrl }: { repoUrl: string }) {
  const repoName = repoUrl.replace('https://github.com/', '');
  const steps = [
    'Fetching repository metadata…',
    'Scanning open issues…',
    'Matching your skills to issues…',
    'Running AI analysis…',
    'Generating your roadmap…',
  ];

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Animated ring */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8">
          <svg width="80" height="80" viewBox="0 0 80 80" className="absolute animate-spin-slow">
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke="url(#spinGrad)"
              strokeWidth="2"
              strokeDasharray="50 164"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff7a17" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
          <img src="/logo.svg" alt="OpenPath" width={28} height={28} className="opacity-80" />
        </div>

        <p className="eyebrow mb-3">Analyzing</p>
        <p className="font-mono text-sm text-body mb-8">{repoName}</p>

        {/* Step list */}
        <div className="text-left space-y-2">
          {steps.map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${i * 380}ms`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full bg-accent-sunset animate-pulse-glow shrink-0"
                style={{ animationDelay: `${i * 380}ms` }}
              />
              <span className="text-body-mid text-sm">{step}</span>
            </div>
          ))}
        </div>

        <p className="text-body-mid text-xs mt-8 font-mono">
          This takes 2 – 3 seconds…
        </p>
      </div>
    </div>
  );
}

// Error screen
function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full border border-red-400/30 bg-red-400/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-red-400 text-xl">!</span>
        </div>
        <p className="eyebrow mb-2 text-red-400/70">Analysis Failed</p>
        <h2 className="display-sm text-ink mb-4">Something went wrong</h2>
        <p className="text-body-mid text-sm leading-6 mb-8">{message}</p>
        <button onClick={onRetry} className="btn-primary mx-auto">
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [results, setResults] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string>('');
  const [pendingRepoUrl, setPendingRepoUrl] = useState('');

  const handleSubmit = async (req: AnalysisRequest) => {
    setPendingRepoUrl(req.repoUrl);
    setView('analyzing');
    setError('');
    try {
      const res = await analyzeRepository(req);
      if (!res.success) {
        throw new Error(res.message ?? 'Analysis failed. Please try again.');
      }
      setResults(res.data);
      setView('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setView('error');
    }
  };

  const handleBack = () => {
    setView('landing');
    setResults(null);
    setError('');
  };

  if (view === 'analyzing') {
    return <AnalyzingScreen repoUrl={pendingRepoUrl} />;
  }

  if (view === 'error') {
    return <ErrorScreen message={error} onRetry={handleBack} />;
  }

  if (view === 'results' && results) {
    return <ResultsPage data={results} onBack={handleBack} />;
  }

  return <LandingPage onSubmit={handleSubmit} loading={false} />;
}
