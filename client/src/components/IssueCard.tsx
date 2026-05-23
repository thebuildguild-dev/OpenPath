import {
  ExternalLink,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  FileCode,
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
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#1a1c20" strokeWidth="3" />
        <circle
          cx="32" cy="32" r={radius}
          fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute font-mono text-sm font-medium" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function MiniScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, value);
  const isRisk = label === 'Risk';
  const color = isRisk
    ? value <= 20 ? '#6ee7b7' : value <= 40 ? '#ffc285' : '#f87171'
    : pct >= 80 ? '#ff7a17' : pct >= 60 ? '#ffc285' : '#7d8187';

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-body-mid w-28 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1 bg-canvas-mid rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${isRisk ? value : pct}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-[10px] w-6 text-right" style={{ color }}>{value}</span>
    </div>
  );
}

const riskConfig = {
  low:    { label: 'Low Risk',  color: 'text-emerald-400',           bg: 'bg-emerald-400/10' },
  medium: { label: 'Med Risk',  color: 'text-accent-sunset-soft',    bg: 'bg-accent-sunset/10' },
  high:   { label: 'High Risk', color: 'text-red-400',               bg: 'bg-red-400/10' },
};

const labelColors: Record<string, string> = {
  'good first issue':  'text-emerald-400 bg-emerald-400/10',
  accessibility:       'text-accent-breeze bg-accent-breeze/10',
  bug:                 'text-red-400 bg-red-400/10',
  documentation:       'text-accent-twilight bg-accent-twilight/10',
  docs:                'text-accent-twilight bg-accent-twilight/10',
  dx:                  'text-accent-dusk bg-accent-dusk/20',
  'error-messages':    'text-accent-sunset-soft bg-accent-sunset/10',
};
const defaultLabelColor = 'text-body-mid bg-canvas-soft';

export default function IssueCard({ issue, isTop }: IssueCardProps) {
  const [expanded, setExpanded] = useState(isTop ?? false);
  const riskCfg = riskConfig[issue.riskLevel];

  return (
    <div
      className={clsx(
        'rounded-[10px] transition-all duration-200',
        isTop
          ? 'bg-canvas-card shadow-[0_0_0_1px_rgba(255,122,23,0.2),0_0_20px_rgba(255,122,23,0.06)]'
          : 'bg-canvas-card hover:bg-[#1f2024]'
      )}
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Score ring + rank */}
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
                <ExternalLink size={11} className="inline ml-1.5 text-body-mid opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-mono text-[11px] text-body-mid">#{issue.number}</span>
              <span className="text-hairline">·</span>
              <span className={clsx('font-mono text-[10px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full', riskCfg.color, riskCfg.bg)}>
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
                  className={clsx('text-[10px] px-2 py-0.5 rounded-full', labelColors[label] ?? defaultLabelColor)}
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
                <MiniScoreBar label="Skill Match"        value={issue.scores.skillMatch} />
                <MiniScoreBar label="Beginner Friendly"  value={issue.scores.beginnerFriendliness} />
                <MiniScoreBar label="Clarity"            value={issue.scores.clarity} />
                <MiniScoreBar label="Risk"               value={issue.scores.risk} />
                <MiniScoreBar label="Confidence"         value={issue.scores.confidence} />
              </div>
            </div>

            <div className="hairline-divider" />

            {/* Likely files */}
            <div>
              <p className="eyebrow mb-3">Likely Files</p>
              <div className="space-y-2">
                {issue.likelyFiles.map((f) => (
                  <div key={f.path} className="flex items-start gap-2.5 bg-canvas-soft rounded-[6px] px-3 py-2.5">
                    <FileCode size={12} className="text-accent-sunset shrink-0 mt-0.5" />
                    <div>
                      <code className="font-mono text-xs text-accent-sunset-soft block">{f.path}</code>
                      <p className="text-body-mid text-xs mt-0.5 leading-4">{f.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hairline-divider" />

            {/* Safe areas */}
            {issue.safeAreas.length > 0 && (
              <div>
                <p className="eyebrow mb-3">Safe Areas</p>
                <div className="flex flex-wrap gap-2">
                  {issue.safeAreas.map((area) => (
                    <code key={area} className="font-mono text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded">
                      {area}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
