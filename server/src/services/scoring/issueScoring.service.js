/**
 * Composite issue scoring service.
 * Combines all individual scorers into a single finalScore per issue.
 */

import { scoreRisk, classifyRiskLevel } from './riskScoring.service.js';
import { scoreStaleness } from './stalenessScoring.service.js';
import { scoreConfidence } from './confidenceScoring.service.js';

//  Skill keyword map 

const SKILL_KEYWORD_MAP = {
  react: ['react', 'jsx', 'component', 'hook', 'context', 'redux', 'recoil', 'zustand', 'ui'],
  vue: ['vue', 'nuxt', 'vuex', 'pinia', 'composition api'],
  angular: ['angular', 'ng', 'directive', 'service', 'module'],
  javascript: ['javascript', 'js', 'es6', 'promise', 'async', 'node', 'frontend'],
  typescript: ['typescript', 'ts', 'types', 'interface', 'generics'],
  css: ['css', 'scss', 'sass', 'style', 'tailwind', 'responsive', 'layout', 'ui', 'design', 'mobile', 'navbar'],
  html: ['html', 'markup', 'template', 'dom'],
  python: ['python', 'django', 'flask', 'fastapi', 'pytest', 'pip'],
  nodejs: ['node', 'nodejs', 'express', 'npm', 'backend', 'server'],
  backend: ['api', 'endpoint', 'server', 'database', 'query', 'backend'],
  testing: ['test', 'spec', 'jest', 'vitest', 'cypress', 'e2e', 'unit test', 'playwright'],
  docs: ['docs', 'documentation', 'readme', 'wiki', 'comment', 'typo', 'spelling'],
  devops: ['docker', 'kubernetes', 'ci', 'cd', 'github actions', 'deploy', 'pipeline'],
  go: ['go', 'golang', 'goroutine'],
  rust: ['rust', 'cargo', 'crate'],
  java: ['java', 'spring', 'maven', 'gradle'],
};

const BEGINNER_POSITIVE_LABELS = [
  'good first issue', 'good-first-issue', 'beginner', 'beginner-friendly',
  'help wanted', 'help-wanted', 'easy', 'starter', 'newbie',
];

const BEGINNER_POSITIVE_KEYWORDS = [
  'docs', 'typo', 'readme', 'ui', 'css', 'style', 'button', 'icon', 'small',
  'minor', 'simple', 'straightforward', 'trivial', 'clear', 'test',
];

const NEGATIVE_SIGNALS = [
  'stale', 'unclear', 'needs design decision', 'blocked', 'wontfix',
  "won't fix", 'needs investigation', 'complex', 'breaking change',
];

//  Helpers 

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

function textOf(issue) {
  return `${issue.title || ''} ${issue.body || ''} ${(issue.labels || []).join(' ')}`.toLowerCase();
}

function countMatches(text, keywords) {
  return keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
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

  // Also factor in preferredContributionType
  const pct = (contributor.preferredContributionType || '').toLowerCase();
  if (pct) {
    const pctKeywords = SKILL_KEYWORD_MAP[pct] || [pct];
    total += pctKeywords.length;
    matches += countMatches(text, pctKeywords);
  }

  if (total === 0) return 50;
  return clamp((matches / total) * 200);
}

function scoreBeginnerFriendliness(issue, contributor) {
  const text = textOf(issue);
  const labels = (issue.labels || []).map((l) => l.toLowerCase());

  let score = 40; // baseline

  const labelBonus = BEGINNER_POSITIVE_LABELS.filter((kw) =>
    labels.some((l) => l.includes(kw))
  ).length;
  score += labelBonus * 20;

  const contentBonus = countMatches(text, BEGINNER_POSITIVE_KEYWORDS);
  score += contentBonus * 5;

  if (contributor.level === 'beginner') score += 10;
  if (contributor.level === 'advanced') score -= 15;

  const neg = countMatches(text, NEGATIVE_SIGNALS);
  score -= neg * 15;

  if ((issue.assignees || []).length > 0) score -= 20;
  if ((issue.comments || 0) > 20) score -= 20;
  else if ((issue.comments || 0) > 10) score -= 10;

  return clamp(score);
}

function scoreClarity(issue) {
  const body = issue.body || '';
  let score = 20;

  if (body.length > 50) score += 10;
  if (body.length > 200) score += 20;
  if (body.length > 500) score += 10;

  if (/steps to reproduce|reproduction steps|how to reproduce/i.test(body)) score += 20;
  if (/expected behavior|expected result/i.test(body)) score += 10;
  if (/actual behavior|actual result/i.test(body)) score += 10;
  if (/```/i.test(body)) score += 10;
  if (/screenshot|image|gif/i.test(body)) score += 5;

  if (/unclear|not sure|maybe|might|could/i.test(body)) score -= 10;
  if (body.length < 30) score -= 20;

  return clamp(score);
}

function classifyDifficulty(score) {
  if (score >= 65) return 'beginner';
  if (score >= 40) return 'intermediate';
  return 'advanced';
}

//  Exports 

/**
 * Score a single issue for a given contributor.
 */
export function scoreIssue(issue, contributor) {
  const skillMatch = scoreSkillMatch(issue, contributor);
  const beginnerFriendliness = scoreBeginnerFriendliness(issue, contributor);
  const clarity = scoreClarity(issue);
  const risk = scoreRisk(issue);
  const staleness = scoreStaleness(issue);
  const confidence = scoreConfidence(issue);

  // Weighted formula
  const raw =
    skillMatch * 0.30 +
    beginnerFriendliness * 0.25 +
    clarity * 0.20 +
    confidence * 0.15 -
    risk * 0.25 -
    staleness * 0.10;

  // Normalise from theoretical [-35, 100] to [0, 100]
  const finalScore = clamp(((raw + 35) / 135) * 100);

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
