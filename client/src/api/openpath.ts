/// <reference types="vite/client" />

import type {
  AnalysisRequest,
  AnalysisResponse,
  LikelyFile,
  RecommendedIssue,
  RepoInfo,
  RepoSummary,
  RiskLevel,
  SetupAnalysis,
} from '../types';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

type RawApiResponse = {
  success: boolean;
  message: string;
  data: RawAnalysisData;
  error?: {
    code?: string;
    details?: string;
  };
};

type RawAnalysisData = {
  repo: RepoInfo & {
    watchers?: number;
    license?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
  repoSummary?: {
    totalFilesScanned?: number;
    issuesFetched?: number;
    issuesFiltered?: number;
    topLanguages?: Record<string, number> | string[];
    hasContributing?: boolean;
    hasEnvExample?: boolean;
    readmeFound?: boolean;
    projectType?: string;
    summary?: string;
    importantFolders?: string[];
    setupFiles?: string[];
  };
  setupAnalysis?: {
    difficulty?: 'low' | 'medium' | 'high' | 'easy' | 'hard';
    score?: number;
    packageManager?: string;
    detectedStack?: string[];
    commands?: Record<string, string | null | undefined>;
    blockers?: Array<string | { message?: string }>;
    missingDocs?: string[];
    recommendations?: string[];
  } | null;
  recommendedIssues?: RawRecommendedIssue[];
  bestIssue?: {
    number: number;
    title: string;
    url: string;
    finalScore?: number;
    scores?: {
      finalScore?: number;
    };
  } | null;
  overallGuidance?: {
    suggestedFirstStep?: string;
    whyThisIssue?: string;
    patchStrategy?: string[];
    testingChecklist?: string[];
    filesToAvoid?: string[];
    contributionAdvice?: string[];
    riskAssessment?: {
      filesToAvoid?: string[];
    };
    prDraft?: {
      prTitle?: string;
      prDescription?: string;
      title?: string;
      description?: string;
      maintainerComment?: string;
    };
    maintainerComment?: string;
  } | null;
};

type RawRecommendedIssue = {
  id: number;
  number: number;
  title: string;
  url: string;
  state: string;
  labels?: string[];
  createdAt: string;
  updatedAt: string;
  comments: number;
  scores: {
    finalScore: number;
    skillMatch: number;
    beginnerFriendliness: number;
    clarity: number;
    risk: number;
    confidence: number;
    staleness?: number;
  };
  difficulty?: string;
  riskLevel?: RiskLevel;
  likelyFiles?: LikelyFile[];
  body?: string;
};

function normaliseSetupDifficulty(
  difficulty?: 'low' | 'medium' | 'high' | 'easy' | 'hard'
): SetupAnalysis['difficulty'] {
  if (difficulty === 'low' || difficulty === 'easy') return 'easy';
  if (difficulty === 'high' || difficulty === 'hard') return 'hard';
  return 'medium';
}

function toLanguageList(topLanguages?: Record<string, number> | string[]): string[] {
  if (!topLanguages) return [];
  if (Array.isArray(topLanguages)) return topLanguages;
  return Object.entries(topLanguages)
    .sort((a, b) => b[1] - a[1])
    .map(([language]) => language);
}

function buildRepoSummary(data: RawAnalysisData): RepoSummary {
  const repoSummary = data.repoSummary ?? {};
  const setup = data.setupAnalysis;
  const languages = toLanguageList(repoSummary.topLanguages);
  const detectedStack = setup?.detectedStack ?? [];
  const summaryParts = [
    detectedStack.length > 0
      ? `${data.repo.fullName} appears to use ${detectedStack.join(', ')}.`
      : data.repo.description ?? `${data.repo.fullName} is an active open source repository.`,
    typeof repoSummary.totalFilesScanned === 'number'
      ? `Top-level scan covered ${repoSummary.totalFilesScanned} files or folders.`
      : null,
    typeof repoSummary.issuesFetched === 'number'
      ? `OpenPath reviewed ${repoSummary.issuesFetched} open issues and ranked the best matches for this contributor.`
      : null,
    repoSummary.hasContributing ? 'A CONTRIBUTING guide is present.' : null,
    repoSummary.hasEnvExample ? 'An example env file exists.' : null,
  ].filter(Boolean);

  return {
    projectType:
      repoSummary.projectType ??
      (detectedStack.length > 0 ? detectedStack.join(' + ') : data.repo.primaryLanguage || 'Software Project'),
    summary:
      repoSummary.summary ??
      summaryParts.join(' ') ??
      (data.repo.description || 'Repository summary unavailable.'),
    importantFolders:
      repoSummary.importantFolders ??
      data.recommendedIssues?.flatMap((issue) => issue.likelyFiles?.map((file) => file.path.split('/').slice(0, -1).join('/')) ?? [])
        .filter(Boolean)
        .filter((value, index, items) => items.indexOf(value) === index)
        .slice(0, 4) ??
      [],
    setupFiles:
      repoSummary.setupFiles ??
      [
        repoSummary.readmeFound ? 'README.md' : null,
        repoSummary.hasContributing ? 'CONTRIBUTING.md' : null,
        repoSummary.hasEnvExample ? '.env.example' : null,
      ].filter((value): value is string => Boolean(value)),
  };
}

function buildSetupAnalysis(data: RawAnalysisData): SetupAnalysis {
  const setup = data.setupAnalysis;

  return {
    difficulty: normaliseSetupDifficulty(setup?.difficulty),
    score: setup?.score ?? 0,
    commands: {
      install: setup?.commands?.install ?? undefined,
      dev: setup?.commands?.dev ?? undefined,
      test: setup?.commands?.test ?? undefined,
      build: setup?.commands?.build ?? undefined,
    },
    blockers: (setup?.blockers ?? []).map((blocker) =>
      typeof blocker === 'string' ? blocker : blocker.message || 'Setup blocker detected.'
    ),
    recommendations: setup?.recommendations ?? [],
  };
}

function buildWhyRecommended(issue: RawRecommendedIssue): string {
  const labels = issue.labels ?? [];
  const labelSummary =
    labels.length > 0 ? `Tags: ${labels.slice(0, 3).join(', ')}.` : 'Issue metadata is limited.';
  return `Strong fit score of ${issue.scores.finalScore}/100 with ${issue.difficulty ?? 'unknown'} difficulty and ${issue.riskLevel ?? 'medium'} risk. ${labelSummary}`;
}

function buildSafeAreas(issue: RawRecommendedIssue): string[] {
  const folders = (issue.likelyFiles ?? [])
    .map((file) => file.path.split('/').slice(0, -1).join('/'))
    .filter(Boolean);
  return [...new Set(folders)].slice(0, 4);
}

function transformIssue(
  issue: RawRecommendedIssue,
  index: number,
  guidance: NonNullable<RawAnalysisData['overallGuidance']>
): RecommendedIssue {
  const prDraft = guidance.prDraft ?? {};
  return {
    rank: index + 1,
    id: issue.id,
    number: issue.number,
    title: issue.title,
    url: issue.url,
    state: issue.state,
    labels: issue.labels ?? [],
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    comments: issue.comments,
    scores: {
      finalScore: issue.scores.finalScore,
      skillMatch: issue.scores.skillMatch,
      beginnerFriendliness: issue.scores.beginnerFriendliness,
      clarity: issue.scores.clarity,
      risk: issue.scores.risk,
      confidence: issue.scores.confidence,
      staleness: issue.scores.staleness,
    },
    difficulty: issue.difficulty ?? 'intermediate',
    riskLevel: issue.riskLevel ?? 'medium',
    whyRecommended: buildWhyRecommended(issue),
    likelyFiles: issue.likelyFiles ?? [],
    safeAreas: buildSafeAreas(issue),
    riskyAreas: guidance.filesToAvoid ?? guidance.riskAssessment?.filesToAvoid ?? [],
    patchStrategy: guidance.patchStrategy ?? [],
    testingChecklist: guidance.testingChecklist ?? [],
    prDraft: {
      title: prDraft.title ?? prDraft.prTitle ?? `fix: ${issue.title}`,
      description:
        prDraft.description ??
        prDraft.prDescription ??
        `## Summary\n\nFixes #${issue.number}.\n\n## Testing\n\n- [ ] Run the relevant test suite`,
    },
    maintainerComment:
      guidance.maintainerComment ??
      prDraft.maintainerComment ??
      `Hi, I'd like to work on #${issue.number}.`,
  };
}

function normaliseAnalysisResponse(raw: RawApiResponse): AnalysisResponse {
  const guidance = raw.data.overallGuidance ?? {};
  const recommendedIssues = (raw.data.recommendedIssues ?? []).map((issue, index) =>
    transformIssue(issue, index, guidance)
  );
  const bestIssueNumber = raw.data.bestIssue?.number ?? recommendedIssues[0]?.number;
  const matchedBestIssue = recommendedIssues.find((issue) => issue.number === bestIssueNumber);

  const contributionAdvice =
    guidance.contributionAdvice ??
    [
      guidance.whyThisIssue,
      'Keep the first change small and scoped to one issue.',
      'Run tests before opening the pull request.',
    ].filter((value): value is string => Boolean(value));

  return {
    success: raw.success,
    message: raw.message,
    data: {
      repo: {
        ...raw.data.repo,
        languages:
          raw.data.repo.languages?.length > 0
            ? raw.data.repo.languages
            : toLanguageList(raw.data.repoSummary?.topLanguages),
      },
      repoSummary: buildRepoSummary(raw.data),
      setupAnalysis: buildSetupAnalysis(raw.data),
      recommendedIssues,
      bestIssue: {
        number: matchedBestIssue?.number ?? raw.data.bestIssue?.number ?? 0,
        title: matchedBestIssue?.title ?? raw.data.bestIssue?.title ?? 'No issue selected',
        url: matchedBestIssue?.url ?? raw.data.bestIssue?.url ?? raw.data.repo.url,
        finalScore:
          matchedBestIssue?.scores.finalScore ??
          raw.data.bestIssue?.finalScore ??
          raw.data.bestIssue?.scores?.finalScore ??
          0,
      },
      overallGuidance: {
        suggestedFirstStep:
          guidance.suggestedFirstStep ??
          guidance.patchStrategy?.[0] ??
          'Review the issue details and reproduce the problem locally.',
        filesToAvoid: guidance.filesToAvoid ?? guidance.riskAssessment?.filesToAvoid ?? [],
        contributionAdvice,
      },
    },
  };
}

/**
 * POST /analyze
 * Main API: accepts a GitHub repo URL + contributor profile,
 * returns a personalised open-source contribution roadmap.
 *
 * TODO: Remove mock and uncomment the real fetch when backend is ready.
 */
export async function analyzeRepository(
  request: AnalysisRequest
): Promise<AnalysisResponse> {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const payload = (await res.json()) as RawApiResponse;

  if (!res.ok || !payload.success) {
    throw new Error(payload.message ?? 'Analysis failed');
  }

  return normaliseAnalysisResponse(payload);
}

/**
 * GET /health
 * Check if the backend server is running.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * GET /demo-result
 * Fallback static demo result when GitHub / Gemini APIs fail.
 */
export async function getDemoResult(): Promise<AnalysisResponse> {
  const res = await fetch(`${BASE_URL}/demo-result`, {
    signal: AbortSignal.timeout(3000),
  });
  const payload = (await res.json()) as RawApiResponse;

  if (!res.ok || !payload.success) {
    throw new Error(payload.message ?? 'Demo result failed to load');
  }

  return normaliseAnalysisResponse(payload);
}
