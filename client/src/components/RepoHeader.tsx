import { Star, GitFork, CircleDot, GitBranch, ExternalLink } from 'lucide-react';
import type { RepoInfo, RepoSummary } from '../types';

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

interface RepoHeaderProps {
  repo: RepoInfo;
  repoSummary: RepoSummary;
}

export default function RepoHeader({ repo, repoSummary }: RepoHeaderProps) {
  return (
    <section className="border-b border-hairline">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="eyebrow mb-4">Repository</p>

        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="display-sm text-ink mb-2">{repo.fullName}</h1>
            <p className="text-body text-base leading-6 max-w-2xl">{repo.description}</p>
          </div>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline shrink-0"
          >
            View on GitHub
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <StatChip icon={<Star size={13} />}       label={formatNumber(repo.stars)}  title="Stars" />
          <StatChip icon={<GitFork size={13} />}    label={formatNumber(repo.forks)}  title="Forks" />
          <StatChip icon={<CircleDot size={13} />}  label={String(repo.openIssues)}   title="Open Issues" />
          <StatChip icon={<GitBranch size={13} />}  label={repo.defaultBranch}        title="Default Branch" />

          <div className="h-4 w-px bg-hairline hidden sm:block" />

          {/* Language chips — background only */}
          <div className="flex flex-wrap gap-2">
            {repo.languages.slice(0, 4).map((lang) => (
              <span
                key={lang}
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-body-mid px-2.5 py-1 rounded-full bg-canvas-soft"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Topics */}
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {repo.topics.map((topic) => (
              <span
                key={topic}
                className="text-xs text-accent-breeze bg-accent-midnight/60 px-2.5 py-1 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* AI summary */}
        <div className="mt-6 p-4 bg-canvas-soft rounded-[8px]">
          <p className="eyebrow mb-2">AI Summary</p>
          <p className="text-body text-sm leading-6">{repoSummary.summary}</p>
          {repoSummary.importantFolders.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {repoSummary.importantFolders.map((folder) => (
                <code
                  key={folder}
                  className="font-mono text-[11px] text-accent-sunset-soft bg-canvas-mid/50 px-2 py-0.5 rounded"
                >
                  {folder}/
                </code>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatChip({ icon, label, title }: { icon: React.ReactNode; label: string; title: string }) {
  return (
    <div className="flex items-center gap-1.5" title={title}>
      <span className="text-body-mid">{icon}</span>
      <span className="text-body text-sm font-mono">{label}</span>
    </div>
  );
}
