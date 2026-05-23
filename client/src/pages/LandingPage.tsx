import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Map, GitBranch, CheckCircle } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const FEATURES = [
  {
    icon: <Zap size={18} className="text-accent-sunset" />,
    iconBg: 'bg-accent-sunset/10',
    title: 'Smart Issue Matching',
    desc: 'AI scores every open issue against your skills, experience level, and goal — surfacing the ones where you can actually succeed.',
  },
  {
    icon: <Map size={18} className="text-accent-twilight" />,
    iconBg: 'bg-accent-dusk/10',
    title: 'Step-by-Step Roadmap',
    desc: 'Patch strategy, likely files to edit, safe areas to touch, and a complete testing checklist — personalised to the issue.',
  },
  {
    icon: <GitBranch size={18} className="text-accent-breeze" />,
    iconBg: 'bg-accent-breeze/10',
    title: 'PR Draft Ready',
    desc: 'Walk away with a ready-to-use PR title, description, and maintainer comment. No blank-page anxiety.',
  },
];

const STEPS = [
  'Paste any public GitHub repository URL',
  'Tell us your skills, level, and goal',
  'AI analyses issues and the codebase',
  'Get your personalised contribution roadmap',
];

const PROOF_STATS = [
  { top: 'Issues ranked', bottom: 'by your skills' },
  { top: 'File-level', bottom: 'guidance' },
  { top: 'PR draft', bottom: 'included' },
  { top: 'Risk score', bottom: 'per issue' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <NavBar />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
          <p className="eyebrow mb-6 animate-fade-in">
            AI-Powered Contribution Roadmap
          </p>

          <h1 className="display-xl text-ink mb-7 animate-fade-up max-w-3xl">
            Find your path<br />
            to{' '}
            <span className="gradient-text">open source.</span>
          </h1>

          <p className="text-body text-xl leading-8 mb-10 max-w-xl animate-fade-up animation-delay-100">
            Paste any GitHub repo, tell us your skills, and get a personalised
            roadmap to your first merged PR — powered by AI.
          </p>

          <div className="flex flex-wrap items-center gap-4 animate-fade-up animation-delay-200">
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-ink text-canvas text-sm font-medium transition-all duration-200 hover:bg-ink-hover"
            >
              Get My Roadmap
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 text-body-mid text-sm hover:text-ink transition-colors"
            >
              Try a demo repo
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* ── Proof strip ──────────────────────────────────────────── */}
        <div className="border-t border-hairline" />
        <section className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            {PROOF_STATS.map(({ top, bottom }) => (
              <div key={top} className="flex flex-col">
                <span className="font-mono text-xs uppercase tracking-[0.1em] text-accent-sunset-soft">
                  {top}
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.1em] text-body-mid">
                  {bottom}
                </span>
              </div>
            ))}
          </div>
        </section>
        <div className="border-t border-hairline" />

        {/* ── Features ─────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <p className="eyebrow mb-3">What you get</p>
          <h2 className="display-md text-ink mb-12 max-w-xl">
            Everything you need<br />for your first PR.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-canvas-card rounded-[10px] p-6 flex flex-col gap-4"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-[8px] ${f.iconBg} shrink-0`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-ink text-base font-medium mb-2">{f.title}</h3>
                  <p className="text-body-mid text-sm leading-6">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="border-t border-hairline" />

        {/* ── How it works ─────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="eyebrow mb-3">How it works</p>
              <h2 className="display-md text-ink mb-8">
                Four steps to<br />your first commit.
              </h2>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-ink text-canvas text-sm font-medium transition-all duration-200 hover:bg-ink-hover"
              >
                Start now
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="space-y-0">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-start gap-5 py-5 border-b border-hairline last:border-b-0">
                  <span className="font-mono text-[11px] text-accent-sunset w-6 shrink-0 mt-0.5">
                    0{i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-body text-base leading-6">{step}</p>
                  </div>
                  <CheckCircle size={15} className="text-body-mid shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="border-t border-hairline" />

        {/* ── Bottom CTA ───────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <p className="eyebrow mb-5">Open Source for Everyone</p>
          <h2 className="display-md text-ink mb-5">
            Every expert was once a beginner.
          </h2>
          <p className="text-body text-lg leading-7 max-w-lg mx-auto mb-10">
            OpenPath removes the guesswork from your first open source contribution.
            No more staring at a 40k-line codebase wondering where to start.
          </p>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-ink text-canvas text-sm font-medium transition-all duration-200 hover:bg-ink-hover"
          >
            Analyze a Repository
            <ArrowRight size={15} />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
