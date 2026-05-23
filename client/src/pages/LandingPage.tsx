import { ArrowRight, Zap, GitBranch, Map } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import AnalysisForm from '../components/AnalysisForm';
import type { AnalysisRequest } from '../types';

interface LandingPageProps {
  onSubmit: (req: AnalysisRequest) => void;
  loading: boolean;
}

const FEATURES = [
  {
    icon: <Zap size={16} className="text-accent-sunset" />,
    title: 'Smart Issue Matching',
    desc: 'AI scores every open issue against your skills, experience level, and goal — surfacing the ones where you can actually succeed.',
  },
  {
    icon: <Map size={16} className="text-accent-twilight" />,
    title: 'Step-by-Step Roadmap',
    desc: 'Patch strategy, likely files to edit, safe areas to touch, and a complete testing checklist — personalised to the issue.',
  },
  {
    icon: <GitBranch size={16} className="text-accent-breeze" />,
    title: 'PR Draft Ready',
    desc: 'Walk away with a ready-to-use PR title, description, and maintainer comment. No blank-page anxiety.',
  },
];

const EXAMPLE_REPOS = [
  'facebook/react',
  'vercel/next.js',
  'microsoft/vscode',
  'tailwindlabs/tailwindcss',
  'vitejs/vite',
  'supabase/supabase',
];

export default function LandingPage({ onSubmit, loading }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <NavBar />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="max-w-2xl">
            <p className="eyebrow mb-6 animate-fade-in">
              AI-Powered Contribution Roadmap
            </p>

            <h1 className="display-xl text-ink mb-6 animate-fade-up">
              Find your path<br />
              to{' '}
              <span className="gradient-text">open source.</span>
            </h1>

            <p className="text-body text-lg leading-7 mb-8 animate-fade-up animation-delay-100">
              Paste any GitHub repository URL, tell us your skills and goals, and get
              a personalised roadmap to your first merged PR — powered by AI.
            </p>

            {/* Social proof-style stats */}
            <div className="flex flex-wrap gap-6 mb-12 animate-fade-up animation-delay-200">
              {[
                ['Issues ranked', 'by your skills'],
                ['File-level', 'guidance'],
                ['PR draft', 'included'],
              ].map(([a, b]) => (
                <div key={a} className="flex flex-col">
                  <span className="font-mono text-xs uppercase tracking-[0.1em] text-accent-sunset-soft">
                    {a}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.1em] text-body-mid">
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="hairline-divider" />

        {/* Form section */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form */}
            <div className="animate-fade-up animation-delay-300">
              <p className="eyebrow mb-3">Analyze a Repository</p>
              <h2 className="display-sm text-ink mb-8">
                Your contribution<br />starts here.
              </h2>
              <AnalysisForm onSubmit={onSubmit} loading={loading} />

              {/* Example repos */}
              <div className="mt-6">
                <p className="eyebrow mb-3">Try with</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_REPOS.map((repo) => (
                    <button
                      key={repo}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        onSubmit({
                          repoUrl: `https://github.com/${repo}`,
                          contributor: {
                            level: 'beginner',
                            skills: ['JavaScript', 'TypeScript', 'React'],
                            goal: 'first-pr',
                            preferredContributionType: 'any',
                          },
                          options: {
                            maxIssues: 20,
                            includeAiRoadmap: true,
                            includePrDraft: true,
                            includeSetupAnalysis: true,
                          },
                        });
                      }}
                      className="btn-outline-sm"
                    >
                      {repo}
                      <ArrowRight size={10} className="text-body-mid" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Features sidebar */}
            <div className="space-y-6 animate-fade-up animation-delay-400">
              <div>
                <p className="eyebrow mb-6">What you get</p>
                <div className="space-y-4">
                  {FEATURES.map((f) => (
                    <div
                      key={f.title}
                      className="card-sm flex items-start gap-4 hover:border-body-mid transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-canvas-soft border border-hairline shrink-0">
                        {f.icon}
                      </div>
                      <div>
                        <h3 className="text-ink text-sm font-medium mb-1">{f.title}</h3>
                        <p className="text-body-mid text-sm leading-5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div className="card-sm">
                <p className="eyebrow mb-4">How it works</p>
                <div className="space-y-3">
                  {[
                    ['01', 'Paste a GitHub repo URL'],
                    ['02', 'Tell us your skills & goal'],
                    ['03', 'AI analyses issues & the codebase'],
                    ['04', 'Get your personalised roadmap'],
                  ].map(([n, step]) => (
                    <div key={n} className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-accent-sunset w-5 shrink-0">
                        {n}
                      </span>
                      <span className="text-body text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="hairline-divider" />

        {/* Bottom CTA band */}
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <p className="eyebrow mb-4">Open Source for Everyone</p>
          <h2 className="display-md text-ink mb-4">
            Every expert was once a beginner.
          </h2>
          <p className="text-body text-lg leading-7 max-w-xl mx-auto">
            OpenPath removes the guesswork from your first open source contribution. No more staring at a 40k-line codebase wondering where to start.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
