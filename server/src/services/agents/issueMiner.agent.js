/**
 * Issue Miner Agent
 * Cleans and enriches raw GitHub issues with structured signals.
 * Purely rule-based — no AI needed here.
 */

const GOOD_FIRST_LABELS = ['good first issue', 'good-first-issue', 'beginner', 'beginner-friendly', 'easy', 'starter', 'newbie'];
const HELP_WANTED_LABELS = ['help wanted', 'help-wanted', 'looking for contributor'];
const STALE_LABELS = ['stale', 'outdated', 'needs update', 'needs-update'];
const DOCS_KEYWORDS = ['docs', 'documentation', 'typo', 'readme', 'spelling', 'grammar', 'wiki', 'changelog'];
const UI_KEYWORDS = ['ui', 'css', 'style', 'layout', 'responsive', 'design', 'frontend', 'visual', 'button', 'modal', 'component', 'form', 'navbar', 'header', 'footer'];
const BUG_KEYWORDS = ['bug', 'fix', 'broken', 'error', 'crash', 'fail', 'issue', 'problem', 'incorrect', 'wrong', 'regression'];
const FEATURE_KEYWORDS = ['feat', 'feature', 'add', 'new', 'implement', 'enhancement', 'request', 'improvement'];
const SECURITY_RISKY = ['auth', 'security', 'payment', 'database', 'sql', 'migration', 'architecture', 'refactor', 'breaking', 'infra'];

function labelText(issue) {
  return (issue.labels || []).map((l) => l.toLowerCase()).join(' ');
}

function allText(issue) {
  return `${issue.title || ''} ${issue.body || ''} ${labelText(issue)}`.toLowerCase();
}

function matchesAny(text, keywords) {
  return keywords.some((kw) => text.includes(kw));
}

function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

/**
 * Enrich a single issue with structured signals.
 */
function enrichIssue(issue) {
  const text = allText(issue);
  const labels = labelText(issue);
  const age = daysSince(issue.updatedAt || issue.createdAt);

  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    body: issue.body || '',
    labels: issue.labels || [],
    comments: issue.comments || 0,
    assignees: issue.assignees || [],
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    url: issue.url,
    signals: {
      hasGoodFirstIssueLabel: matchesAny(labels, GOOD_FIRST_LABELS),
      hasHelpWantedLabel: matchesAny(labels, HELP_WANTED_LABELS),
      isAssigned: (issue.assignees || []).length > 0,
      hasClearBody: (issue.body || '').length > 100,
      isDocsIssue: matchesAny(text, DOCS_KEYWORDS),
      isUiIssue: matchesAny(text, UI_KEYWORDS),
      isBug: matchesAny(text, BUG_KEYWORDS),
      isFeature: matchesAny(text, FEATURE_KEYWORDS),
      isPotentiallyStale: age > 180 || matchesAny(labels, STALE_LABELS),
      isSecurityRisky: matchesAny(text, SECURITY_RISKY),
      hasReproductionSteps: /steps to reproduce|how to reproduce|reproduction/i.test(issue.body || ''),
      hasCodeBlock: /```/.test(issue.body || ''),
      ageDays: age,
    },
  };
}

/**
 * Run the Issue Miner Agent.
 * @param {{ issues: Array }} input
 * @returns {Array} enriched issues
 */
export function run({ issues }) {
  if (!Array.isArray(issues) || issues.length === 0) return [];
  return issues.map(enrichIssue);
}
