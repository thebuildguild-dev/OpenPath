import { FileCode, CheckSquare, Square, ExternalLink, Map } from 'lucide-react';
import { useState } from 'react';
import type { RecommendedIssue, OverallGuidance } from '../types';

interface RoadmapCardProps {
  issue: RecommendedIssue;
  guidance: OverallGuidance;
}

export default function RoadmapCard({ issue, guidance }: RoadmapCardProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-[8px] bg-accent-sunset/10 border border-accent-sunset/20 shrink-0">
          <Map size={18} className="text-accent-sunset" />
        </div>
        <div className="flex-1">
          <p className="eyebrow mb-1.5">Your Roadmap</p>
          <h2 className="display-sm text-ink leading-tight">
            {issue.title}
          </h2>
          <a
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-body-mid hover:text-ink transition-colors"
          >
            Issue #{issue.number}
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      <div className="hairline-divider mb-6" />

      {/* Suggested first step */}
      <div className="bg-accent-sunset/5 border border-accent-sunset/20 rounded-[8px] px-4 py-3 mb-6">
        <p className="eyebrow mb-1.5">Start Here</p>
        <p className="text-body text-sm leading-5">{guidance.suggestedFirstStep}</p>
      </div>

      {/* Patch strategy */}
      <div className="mb-6">
        <p className="eyebrow mb-4">Patch Strategy</p>
        <ol className="space-y-3">
          {issue.patchStrategy.map((step, i) => (
            <li key={i} className="flex items-start gap-3 group">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-hairline bg-canvas-soft shrink-0 mt-0.5">
                <span className="font-mono text-[10px] text-body-mid">{i + 1}</span>
              </div>
              <div className="flex-1 bg-canvas-soft border border-hairline rounded-[6px] px-3 py-2.5 group-hover:border-body-mid transition-colors">
                <p className="text-body text-sm leading-5">{step}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="hairline-divider mb-6" />

      {/* Likely files */}
      <div className="mb-6">
        <p className="eyebrow mb-3">Files to Edit</p>
        <div className="space-y-2">
          {issue.likelyFiles.map((f) => (
            <div
              key={f.path}
              className="flex items-start gap-2.5 bg-canvas-soft border border-hairline rounded-[6px] px-3 py-2.5"
            >
              <FileCode size={12} className="text-accent-sunset shrink-0 mt-0.5" />
              <div>
                <code className="font-mono text-xs text-accent-sunset-soft block">{f.path}</code>
                <p className="text-body-mid text-xs mt-0.5 leading-4">{f.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hairline-divider mb-6" />

      {/* Testing checklist */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="eyebrow">Testing Checklist</p>
          <span className="font-mono text-[11px] text-body-mid">
            {checked.size}/{issue.testingChecklist.length}
          </span>
        </div>
        <div className="space-y-2">
          {issue.testingChecklist.map((item, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className="w-full flex items-start gap-2.5 bg-canvas-soft border border-hairline rounded-[6px] px-3 py-2.5 hover:border-body-mid transition-colors text-left cursor-pointer"
            >
              {checked.has(i) ? (
                <CheckSquare size={13} className="text-accent-sunset shrink-0 mt-0.5" />
              ) : (
                <Square size={13} className="text-body-mid shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm leading-5 transition-colors ${
                  checked.has(i) ? 'text-body-mid line-through' : 'text-body'
                }`}
              >
                {item}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="hairline-divider mb-6" />

      {/* Contribution advice */}
      <div>
        <p className="eyebrow mb-3">Contribution Advice</p>
        <div className="space-y-2">
          {guidance.contributionAdvice.map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 px-3 py-2.5"
            >
              <span className="font-mono text-[11px] text-body-mid shrink-0 mt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-body text-sm leading-5">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
