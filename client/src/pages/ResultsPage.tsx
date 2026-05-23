import { Trophy, LayoutList, Map, GitPullRequest, Settings2 } from 'lucide-react';
import { useRef, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import RepoHeader from '../components/RepoHeader';
import SetupCard from '../components/SetupCard';
import IssueCard from '../components/IssueCard';
import RoadmapCard from '../components/RoadmapCard';
import PRDraftCard from '../components/PRDraftCard';
import type { AnalysisData } from '../types';

interface ResultsPageProps {
  data: AnalysisData;
  onBack: () => void;
}

const TABS = [
  { id: 'issues',  label: 'Issues',   icon: <LayoutList size={14} /> },
  { id: 'roadmap', label: 'Roadmap',  icon: <Map size={14} /> },
  { id: 'pr',      label: 'PR Draft', icon: <GitPullRequest size={14} /> },
  { id: 'setup',   label: 'Setup',    icon: <Settings2 size={14} /> },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function ResultsPage({ data, onBack }: ResultsPageProps) {
  const { repo, repoSummary, setupAnalysis, recommendedIssues, bestIssue, overallGuidance } = data;
  const bestIssueData = recommendedIssues.find((i) => i.number === bestIssue.number) ?? recommendedIssues[0];

  const [activeTab, setActiveTab] = useState<TabId>('issues');
  const contentRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <NavBar repoUrl={repo.url} repoName={repo.fullName} onBack={onBack} />

      {/* Repo header */}
      <RepoHeader repo={repo} repoSummary={repoSummary} />

      {/* Best issue banner — no box outline, use bg */}
      <div className="border-b border-hairline bg-canvas-soft">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent-sunset/15">
                <Trophy size={13} className="text-accent-sunset" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-accent-sunset mb-0.5">
                  Best Match · Score {bestIssue.finalScore}
                </p>
                <p className="text-ink text-sm font-medium leading-5">
                  {bestIssue.title}
                </p>
              </div>
            </div>
            <a
              href={bestIssueData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-sm shrink-0"
            >
              View Issue #{bestIssue.number}
            </a>
          </div>
        </div>
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-14 z-40 bg-canvas/95 backdrop-blur-sm border-b border-hairline">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-ink text-canvas font-medium'
                    : 'text-body-mid hover:text-ink hover:bg-canvas-soft'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1" ref={contentRef}>
        <div className="max-w-6xl mx-auto px-6 py-10">

          {/* ISSUES TAB */}
          {activeTab === 'issues' && (
            <div className="animate-fade-up">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="eyebrow mb-1">Recommended Issues</p>
                  <h2 className="display-sm text-ink">
                    {recommendedIssues.length} issues matched
                  </h2>
                </div>
                <span className="font-mono text-[11px] text-body-mid">Ranked by fit</span>
              </div>

              <div className="space-y-3">
                {recommendedIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} isTop={issue.number === bestIssue.number} />
                ))}
              </div>

              {/* Files to avoid */}
              {overallGuidance.filesToAvoid.length > 0 && (
                <div className="mt-8 bg-canvas-card rounded-[10px] p-5">
                  <p className="eyebrow mb-2">Files to Avoid</p>
                  <p className="text-body-mid text-sm mb-3">
                    Stay away from these areas for your first contribution — they carry high risk.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {overallGuidance.filesToAvoid.map((f) => (
                      <code key={f} className="font-mono text-xs text-red-400 bg-red-400/10 px-2.5 py-1 rounded">
                        {f}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ROADMAP TAB */}
          {activeTab === 'roadmap' && (
            <div className="animate-fade-up max-w-3xl">
              <div className="mb-6">
                <p className="eyebrow mb-1">Contribution Roadmap</p>
                <h2 className="display-sm text-ink">Your action plan</h2>
              </div>
              <RoadmapCard issue={bestIssueData} guidance={overallGuidance} />
            </div>
          )}

          {/* PR DRAFT TAB */}
          {activeTab === 'pr' && (
            <div className="animate-fade-up max-w-3xl">
              <div className="mb-6">
                <p className="eyebrow mb-1">Pull Request Draft</p>
                <h2 className="display-sm text-ink">Ready to ship</h2>
              </div>
              <PRDraftCard issue={bestIssueData} />
            </div>
          )}

          {/* SETUP TAB */}
          {activeTab === 'setup' && (
            <div className="animate-fade-up max-w-3xl">
              <div className="mb-6">
                <p className="eyebrow mb-1">Environment Setup</p>
                <h2 className="display-sm text-ink">Getting started locally</h2>
              </div>
              <SetupCard setup={setupAnalysis} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
