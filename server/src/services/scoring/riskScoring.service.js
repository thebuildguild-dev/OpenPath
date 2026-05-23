/**
 * Rule-based risk scorer for issues.
 * Returns a 0-100 score where higher = more risky.
 */

const HIGH_RISK = [
  'auth', 'authentication', 'authorization', 'security', 'token', 'oauth',
  'password', 'credential', 'secret', 'jwt', 'session', 'cors',
  'database', 'migration', 'schema', 'prisma', 'sql', 'mongo', 'redis',
  'payment', 'billing', 'stripe', 'invoice', 'checkout',
  'refactor', 'breaking change', 'core', 'architecture', 'infra',
  'infrastructure', 'deploy', 'ci/cd', 'pipeline', 'hotfix',
];

const MEDIUM_RISK = [
  'performance', 'cache', 'caching', 'async', 'race condition', 'concurrency',
  'api', 'endpoint', 'route', 'config', 'configuration', 'env', 'server',
  'state', 'store', 'context', 'provider',
];

const LOW_RISK = [
  'docs', 'documentation', 'typo', 'readme', 'spelling', 'grammar', 'comment',
  'css', 'style', 'ui', 'responsive', 'layout', 'button', 'modal', 'form',
  'test', 'spec', 'jest', 'vitest', 'lint', 'badge', 'icon', 'tooltip',
];

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

function textOf(issue) {
  return `${issue.title || ''} ${issue.body || ''} ${(issue.labels || []).join(' ')}`.toLowerCase();
}

function countMatches(text, keywords) {
  return keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
}

/**
 * Score issue risk. Higher = riskier.
 * @param {object} issue
 * @returns {number} 0-100
 */
export function scoreRisk(issue) {
  const text = textOf(issue);

  const highCount = countMatches(text, HIGH_RISK);
  const medCount = countMatches(text, MEDIUM_RISK);
  const lowCount = countMatches(text, LOW_RISK);

  if (highCount > 0) return clamp(60 + highCount * 7);
  if (medCount > 0) return clamp(30 + medCount * 6);
  if (lowCount > 0) return clamp(5 + lowCount * 3);
  return 40; // unknown = medium-ish
}

/**
 * Classify a risk score into a label.
 * @param {number} score
 * @returns {'low'|'medium'|'high'}
 */
export function classifyRiskLevel(score) {
  if (score <= 30) return 'low';
  if (score <= 60) return 'medium';
  return 'high';
}
