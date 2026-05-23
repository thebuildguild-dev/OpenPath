import {
  ExternalLink,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldCheck,
  AlertOctagon,
  Trophy,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import type { RecommendedIssue } from '../types';

interface IssueCardProps {
  issue: RecommendedIssue;
  isTop?: boolean;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 85 ? '#ff7a17' : score >= 70 ? '#ffc285' : '#7d8187';

  return (
    <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#212327" strokeWidth="3" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span
        className="absolute font-mono text-sm font-medium"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

function MiniScoreBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const isRisk = label === 'Risk';
  const effectiveColor = isRisk
    ? value <= 20 ? '#6ee7b7' : value <= 40 ? '#ffc285' : '#f87171'
    : pct >= 80 ? '#ff7a17' : pct >= 60 ? '#ffc285' : '#7d8187';

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-body-mid w-24 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1 bg-canvas-mid rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${isRisk ? value : pct}%`, backgroundColor: effectiveColor }}
        />
      </div>
      <span className="font-mono text-[10px] w-6 text-right" style={{ color: effectiveColor }}>
        {value}
      </span>
    </div>
  );
}

const riskConfig = {
  low: { label: 'Low Risk', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  medium: { label: 'Med Risk', color: 'text-accent-sunset-soft', bg: 'bg-accent-sunset/10 border-accent-sunset/20' },
  high: { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
};

const labelColors: Record<string, string> = {
  'good first issue': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  accessibility: 'text-accent-breeze bg-accent-breeze/10 border-accent-breeze/20',
  bug: 'text-red-400 bg-red-400/10 border-red-400/20',
  documentation: 'text-accent-twilight bg-accent-twilight/10 border-accent-twilight/20',
  docs: 'text-accent-twilight bg-accent-twilight/10 border-accent-twilight/20',
  dx: 'text-accent-dusk bg-accent-dusk/20 border-accent-dusk/30',
  'error-messages': 'text-accent-sunset-soft bg-accent-sunset/10 border-accent-sunset/20',
};
const defaultLabelColor = 'text-body-mid bg-canvas-soft border-hairline';

export default function IssueCard({ issue, isTop }: IssueCardProps) {
  const [expanded, setExpanded] = useState(isTop ?? false);
  const riskCfg = riskConfig[issue.riskLevel];

  return (
    <div
      className={clsx(
        'border rounded-[8px] transition-all duration-200',
        isTop
          ? 'bg-canvas-card border-accent-sunset/30 shadow-[0_0_0_1px_rgba(255,122,23,0.1)]'
          : 'bg-canvas-card border-hairline hover:border-body-mid'
      )}
    >
      {/* Card header — always visible */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank + score */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <ScoreRing score={issue.scores.finalScore} />
            <div className="flex items-center gap-1">
              {isTop && <Trophy size={10} className="text-accent-sunset" />}
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-body-mid">
                #{issue.rank}
              </span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink text-base font-medium leading-6 hover:text-body-mid transition-colors line-clamp-2 group"
              >
                {issue.title}
                <ExternalLink
                  size={11}
                  className="inline ml-1.5 text-body-mid opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-mono text-[11px] text-body-mid">#{issue.number}</span>
              <span className="text-hairline">·</span>
              <span
                className={clsx(
                  'font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full border',
                  riskCfg.color,
                  riskCfg.bg
                )}
              >
                {riskCfg.label}
              </span>
              <span className="text-hairline">·</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-body-mid">
                {issue.difficulty}
              </span>
              <span className="text-hairline">·</span>
              <span className="flex items-center gap-1 text-body-mid text-xs">
                <MessageCircle size={11} />
                {issue.comments}
              </span>
            </div>

            {/* Labels */}
            <div className="flex flex-wrap gap-1.5">
              {issue.labels.map((label) => (
                <span
                  key={label}
                  className={clsx(
                    'text-[10px] px-2 py-0.5 rounded-full border',
                    labelColors[label] ?? defaultLabelColor
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="btn-outline-sm shrink-0 mt-1"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Why recommended — always visible */}
        <p className="text-body-mid text-sm leading-5 mt-3 ml-20">
          {issue.whyRecommended}
        </p>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-hairline">
          <div className="p-5 space-y-6">
            {/* Score breakdown */}
            <div>
              <p className="eyebrow mb-3">Score Breakdown</p>
              <div className="space-y-2">
                <MiniScoreBar label="Skill Match" value={issue.scores.skillMatch} />
                <MiniScoreBar label="Beginner Friendly" value={issue.scores.beginnerFriendliness} />
                <MiniScoreBar label="Clarity" value={issue.scores.clarity} />
                <MiniScoreBar label="Risk" value={issue.scores.risk} />
                <MiniScoreBar label="Confidence" value={issue.scores.confidence} />
              </div>
            </div>

            <div className="hairline-divider" />

            {/* Likely files */}
            <div>
              <p className="eyebrow mb-3">Likely Files</p>
              <div className="space-y-2">
                {issue.likelyFiles.map((f) => (
                  <div
                    key={f.path}
                    className="flex items-start gap-2.5 bg-canvas-soft border border-hairline rounded-[6px] px-3 py-2.5"
                  >
                    <FileCode size={12} className="text-accent-sunset shrink-0 mt-0.5" />
                    <div>
                      <code className="font-mono text-xs text-accent-sunset-soft">{f.path}</code>
                      <p className="text-body-mid text-xs mt-0.5">{f.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safe / Risky areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="eyebrow mb-2 text-emerald-400/70">Safe to touch</p>
                <div className="flex flex-wrap gap-1.5">
                  {issue.safeAreas.map((area) => (
                    <span key={area} className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                      <ShieldCheck size={10} />
                      {area}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="eyebrow mb-2 text-red-400/70">Avoid touching</p>
                <div className="flex flex-wrap gap-1.5">
                  {issue.riskyAreas.map((area) => (
                    <span key={area} className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                      <AlertOctagon size={10} />
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
