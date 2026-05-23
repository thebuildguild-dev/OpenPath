export type ContributorLevel = 'beginner' | 'intermediate' | 'advanced';
export type ContributionGoal = 'first-pr' | 'bug-fix' | 'docs' | 'feature' | 'testing' | 'explore';
export type ContributionType = 'code' | 'docs' | 'testing' | 'ui' | 'backend' | 'any';
export type SetupDifficulty = 'easy' | 'medium' | 'hard';
export type RiskLevel = 'low' | 'medium' | 'high';
export type AppView = 'landing' | 'analyzing' | 'results' | 'error';

export interface Contributor {
  name?: string;
  level: ContributorLevel;
  skills: string[];
  goal: ContributionGoal;
  preferredContributionType?: ContributionType;
}

export interface AnalysisOptions {
  maxIssues?: number;
  includeAiRoadmap?: boolean;
  includePrDraft?: boolean;
  includeSetupAnalysis?: boolean;
}

export interface AnalysisRequest {
  repoUrl: string;
  contributor: Contributor;
  options?: AnalysisOptions;
}

export interface RepoInfo {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  primaryLanguage: string;
  languages: string[];
  topics: string[];
}

export interface RepoSummary {
  projectType: string;
  summary: string;
  importantFolders: string[];
  setupFiles: string[];
}

export interface SetupCommands {
  install?: string;
  dev?: string;
  test?: string;
  build?: string;
}

export interface SetupAnalysis {
  difficulty: SetupDifficulty;
  score: number;
  commands: SetupCommands;
  blockers: string[];
  recommendations: string[];
}

export interface IssueScores {
  finalScore: number;
  skillMatch: number;
  beginnerFriendliness: number;
  clarity: number;
  risk: number;
  confidence: number;
  staleness?: number;
}

export interface LikelyFile {
  path: string;
  reason: string;
}

export interface PRDraft {
  title: string;
  description: string;
}

export interface RecommendedIssue {
  rank: number;
  id: number;
  number: number;
  title: string;
  url: string;
  state: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
  comments: number;
  scores: IssueScores;
  difficulty: string;
  riskLevel: RiskLevel;
  whyRecommended: string;
  likelyFiles: LikelyFile[];
  safeAreas: string[];
  riskyAreas: string[];
  patchStrategy: string[];
  testingChecklist: string[];
  prDraft: PRDraft;
  maintainerComment: string;
}

export interface BestIssue {
  number: number;
  title: string;
  url: string;
  finalScore: number;
}

export interface OverallGuidance {
  suggestedFirstStep: string;
  filesToAvoid: string[];
  contributionAdvice: string[];
}

export interface AnalysisData {
  repo: RepoInfo;
  repoSummary: RepoSummary;
  setupAnalysis: SetupAnalysis;
  recommendedIssues: RecommendedIssue[];
  bestIssue: BestIssue;
  overallGuidance: OverallGuidance;
}

export interface AnalysisResponse {
  success: boolean;
  message: string;
  data: AnalysisData;
}
