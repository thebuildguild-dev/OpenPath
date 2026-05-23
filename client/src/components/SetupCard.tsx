import { AlertTriangle, CheckCircle, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { SetupAnalysis } from '../types';
import clsx from 'clsx';

interface SetupCardProps {
  setup: SetupAnalysis;
}

const difficultyConfig = {
  easy: { label: 'Easy', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  medium: { label: 'Medium', color: 'text-accent-sunset-soft', bg: 'bg-accent-sunset/10 border-accent-sunset/20' },
  hard: { label: 'Hard', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
};

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 70 ? '#6ee7b7' : pct >= 40 ? '#ff7a17' : '#f87171';

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-canvas-mid rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="font-mono text-xs w-8 text-right"
        style={{ color }}
      >
        {pct}
      </span>
    </div>
  );
}

export default function SetupCard({ setup }: SetupCardProps) {
  const [showAll, setShowAll] = useState(false);
  const cfg = difficultyConfig[setup.difficulty];
  const commands = Object.entries(setup.commands).filter(([, v]) => v);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow mb-2">Setup Analysis</p>
          <h2 className="display-sm text-ink">Environment Setup</h2>
        </div>
        <span
          className={clsx(
            'font-mono text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 rounded-full border',
            cfg.color,
            cfg.bg
          )}
        >
          {cfg.label}
        </span>
      </div>

      {/* Setup score */}
      <div className="mb-6">
        <p className="text-body-mid text-xs mb-2">Setup Difficulty Score</p>
        <ScoreBar score={setup.score} />
        <p className="text-body-mid text-xs mt-1.5">
          {setup.score < 50
            ? 'This repo takes effort to set up locally. Read the docs carefully.'
            : setup.score < 75
            ? 'Moderate setup complexity — follow the contributing guide.'
            : 'Straightforward to get running locally.'}
        </p>
      </div>

      <div className="hairline-divider mb-6" />

      {/* Commands */}
      {commands.length > 0 && (
        <div className="mb-6">
          <p className="eyebrow mb-3">Commands</p>
          <div className="space-y-2">
            {commands.map(([key, val]) => (
              <div key={key} className="flex items-center gap-3 group">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-body-mid w-14 shrink-0">
                  {key}
                </span>
                <div className="flex-1 flex items-center gap-2 bg-canvas-soft border border-hairline rounded-[6px] px-3 py-2">
                  <Terminal size={11} className="text-body-mid shrink-0" />
                  <code className="font-mono text-xs text-accent-sunset-soft">{val}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blockers */}
      {setup.blockers.length > 0 && (
        <div className="mb-6">
          <p className="eyebrow mb-3">Blockers</p>
          <div className="space-y-2">
            {setup.blockers.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 bg-accent-sunset/5 border border-accent-sunset/15 rounded-[8px] px-3 py-2.5"
              >
                <AlertTriangle size={13} className="text-accent-sunset shrink-0 mt-0.5" />
                <p className="text-body text-sm leading-5">{b}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {setup.recommendations.length > 0 && (
        <div>
          <button
            className="flex items-center gap-2 eyebrow mb-3 hover:text-ink transition-colors cursor-pointer"
            onClick={() => setShowAll((v) => !v)}
          >
            Recommendations
            {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <div
            className={clsx(
              'space-y-2 overflow-hidden transition-all duration-300',
              showAll ? 'max-h-96' : 'max-h-0'
            )}
          >
            {setup.recommendations.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 bg-canvas-soft border border-hairline rounded-[8px] px-3 py-2.5"
              >
                <CheckCircle size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-body text-sm leading-5">{r}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
