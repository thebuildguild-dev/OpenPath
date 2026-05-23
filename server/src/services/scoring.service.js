/**
 * Rule-based issue scoring service.
 * All individual scores are 0-100. finalScore is normalised to 0-100.
 */

//  Keyword tables 

const HIGH_RISK_KEYWORDS = [
  'auth', 'authentication', 'authorization', 'security', 'token', 'oauth',
  'password', 'credential', 'secret', 'jwt', 'database', 'migration', 'schema',
  'prisma', 'sql', 'mongo', 'redis', 'payment', 'billing', 'stripe', 'invoice',
  'refactor', 'breaking', 'breaking change', 'core', 'architecture', 'infra',
  'infrastructure', 'deploy', 'ci/cd', 'pipeline', 'production', 'hotfix',
];

const MEDIUM_RISK_KEYWORDS = [
  'performance', 'cache', 'caching', 'async', 'race condition', 'concurrency',
  'api', 'endpoint', 'route', 'config', 'configuration', 'env',
];

const LOW_RISK_KEYWORDS = [
  'docs', 'documentation', 'typo', 'readme', 'spelling', 'grammar', 'comment',
  'css', 'style', 'ui', 'responsive', 'layout', 'button', 'modal', 'form',
  'test', 'spec', 'jest', 'vitest', 'lint', 'badge',
];

const BEGINNER_POSITIVE_LABELS = [
  'good first issue', 'good-first-issue', 'beginner', 'beginner-friendly',
  'help wanted', 'help-wanted', 'easy', 'starter', 'newbie',
];

const BEGINNER_POSITIVE_CONTENT = [
  'docs', 'typo', 'readme', 'ui', 'css', 'style', 'button', 'icon', 'small',
  'minor', 'clear reproduction', 'simple', 'straightforward', 'trivial',
];

const NEGATIVE_SIGNALS = [
  'stale', 'unclear', 'needs design decision', 'blocked', 'wontfix',
  'won\'t fix', 'needs investigation', 'complex', 'breaking change',
];

//  Skill keyword mapping 

const SKILL_KEYWORD_MAP = {
  react: ['react', 'jsx', 'component', 'hook', 'context', 'redux', 'recoil', 'zustand'],
  vue: ['vue', 'nuxt', 'vuex', 'pinia', 'composition api'],
  angular: ['angular', 'ng', 'directive', 'service', 'module'],
  javascript: ['javascript', 'js', 'es6', 'promise', 'async', 'node'],
  typescript: ['typescript', 'ts', 'types', 'interface', 'generics'],
  css: ['css', 'scss', 'sass', 'style', 'tailwind', 'responsive', 'layout', 'ui', 'design'],
  html: ['html', 'markup', 'template', 'dom'],
  python: ['python', 'django', 'flask', 'fastapi', 'pytest', 'pip'],
  nodejs: ['node', 'nodejs', 'express', 'npm', 'backend', 'server'],
  backend: ['api', 'endpoint', 'server', 'database', 'query', 'backend'],
  testing: ['test', 'spec', 'jest', 'vitest', 'cypress', 'e2e', 'unit test'],
  docs: ['docs', 'documentation', 'readme', 'wiki', 'comment', 'typo', 'spelling'],
  devops: ['docker', 'kubernetes', 'ci', 'cd', 'github actions', 'deploy'],
};

//  Helpers 

function textOf(issue) {
  return `${issue.title || ''} ${issue.body || ''} ${(issue.labels || []).join(' ')}`.toLowerCase();
}

function containsAny(text, keywords) {
  return keywords.some((kw) => text.includes(kw));
}

function countMatches(text, keywords) {
  return keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
}

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

//  Individual scorers 

function scoreSkillMatch(issue, contributor) {
  const skills = (contributor.skills || []).map((s) => s.toLowerCase());
  const text = textOf(issue);

  let matches = 0;
  let total = 0;

  for (const skill of skills) {
    const keywords = SKILL_KEYWORD_MAP[skill] || [skill];
    total += keywords.length;
    matches += countMatches(text, keywords);
  }

  if (total === 0) return 50; // neutral when no skills provided
  return clamp((matches / total) * 200); // scale up — even 1 match is meaningful
}

function scoreBeginnerFriendliness(issue, contributor) {
  const text = textOf(issue);
  const labels = (issue.labels || []).map((l) => l.toLowerCase());
  const allText = `${text} ${labels.join(' ')}`;

  let score = 40; // baseline

  // Positive label bonuses
  const labelBonus = BEGINNER_POSITIVE_LABELS.filter((kw) =>
    labels.some((l) => l.includes(kw))
  ).length;
  score += labelBonus * 20;

  // Positive content bonuses
  const contentBonus = countMatches(allText, BEGINNER_POSITIVE_CONTENT);
  score += contentBonus * 5;

  // Contributor level adjustments
  if (contributor.level === 'beginner') score += 10;
  if (contributor.level === 'advanced') score -= 20; // advanced devs don't need beginner issues

  // Negative signals
  const neg = countMatches(allText, NEGATIVE_SIGNALS);
  score -= neg * 15;

  // Assigned issues are less beginner-friendly
  if ((issue.assignees || []).length > 0) score -= 20;

  // Comment-heavy = complex
  if ((issue.comments || 0) > 20) score -= 20;
  else if ((issue.comments || 0) > 10) score -= 10;

  return clamp(score);
}

function scoreClarity(issue) {
  const body = issue.body || '';
  let score = 20; // baseline for no body

  if (body.length > 50) score += 10;
  if (body.length > 200) score += 20;
  if (body.length > 500) score += 10;

  // Structured signals
  if (/steps to reproduce|reproduction steps|how to reproduce/i.test(body)) score += 20;
  if (/expected behavior|expected result/i.test(body)) score += 10;
  if (/actual behavior|actual result/i.test(body)) score += 10;
  if (/```/i.test(body)) score += 10; // code block present
  if (/screenshot|image|gif/i.test(body)) score += 5;

  // Vague signals
  if (/unclear|not sure|maybe|might|could/i.test(body)) score -= 10;
  if (body.length < 30) score -= 20;

  return clamp(score);
}

function scoreRisk(issue) {
  const text = textOf(issue);

  if (containsAny(text, HIGH_RISK_KEYWORDS)) {
    const count = countMatches(text, HIGH_RISK_KEYWORDS);
    return clamp(65 + count * 5);
  }
  if (containsAny(text, MEDIUM_RISK_KEYWORDS)) {
    return clamp(35 + countMatches(text, MEDIUM_RISK_KEYWORDS) * 5);
  }
  if (containsAny(text, LOW_RISK_KEYWORDS)) {
    return clamp(10 + countMatches(text, LOW_RISK_KEYWORDS) * 3);
  }
  return 40; // unknown = medium risk
}

function scoreStaleness(issue) {
  const days = daysSince(issue.updatedAt || issue.createdAt);
  const text = textOf(issue);

  let score = 0;
  if (days > 365) score = 80;
  else if (days > 180) score = 60;
  else if (days > 90) score = 40;
  else if (days > 30) score = 20;
  else score = 5;

  if (containsAny(text, ['stale', 'outdated', 'old'])) score += 20;
  return clamp(score);
}

function scoreConfidence(issue) {
  let score = 60; // baseline

  if (issue.body && issue.body.length > 100) score += 10;
  if ((issue.labels || []).length > 0) score += 10;
  if ((issue.comments || 0) > 0 && (issue.comments || 0) <= 5) score += 10; // some activity = good
  if ((issue.comments || 0) > 15) score -= 10; // too many comments = complex discussion

  return clamp(score);
}

//  Difficulty / risk classification 

function classifyDifficulty(finalScore) {
  if (finalScore <= 40) return 'beginner';
  if (finalScore <= 70) return 'intermediate';
  return 'advanced';
}

function classifyRiskLevel(riskScore) {
  if (riskScore <= 30) return 'low';
  if (riskScore <= 60) return 'medium';
  return 'high';
}

//  Main export 

/**
 * Score a single issue for a given contributor.
 * @returns {object} scored issue with all fields
 */
export function scoreIssue(issue, contributor) {
  const skillMatch = scoreSkillMatch(issue, contributor);
  const beginnerFriendliness = scoreBeginnerFriendliness(issue, contributor);
  const clarity = scoreClarity(issue);
  const risk = scoreRisk(issue);
  const staleness = scoreStaleness(issue);
  const confidence = scoreConfidence(issue);

  // Raw finalScore (can exceed 0-100 range)
  const raw = skillMatch + beginnerFriendliness + clarity + confidence - risk - staleness;

  // Normalise from theoretical [-200, 400] range to [0, 100]
  const finalScore = clamp(((raw + 200) / 600) * 100);

  return {
    ...issue,
    scores: {
      finalScore,
      skillMatch,
      beginnerFriendliness,
      clarity,
      risk,
      staleness,
      confidence,
    },
    difficulty: classifyDifficulty(finalScore),
    riskLevel: classifyRiskLevel(risk),
  };
}

/**
 * Score an array of issues and return sorted by finalScore descending.
 */
export function scoreIssues(issues, contributor) {
  return issues
    .map((issue) => scoreIssue(issue, contributor))
    .sort((a, b) => b.scores.finalScore - a.scores.finalScore);
}
