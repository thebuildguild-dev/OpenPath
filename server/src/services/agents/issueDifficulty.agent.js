/**
 * Issue Difficulty Agent
 * Scores each enriched issue for difficulty, clarity, risk, and beginner friendliness.
 * Uses the modular scoring services. Purely rule-based.
 */

import { scoreIssue } from '../scoring/issueScoring.service.js';

const DIFFICULTY_REASONS = {
  beginner: 'Clear, low-risk issue that matches beginner skills and has good documentation.',
  intermediate: 'Moderate complexity — requires some familiarity with the codebase.',
  advanced: 'High complexity or risk — better suited for experienced contributors.',
};

/**
 * Run the Issue Difficulty Agent.
 * @param {{ issues, contributor }} input
 * @returns {Array} scored issues with difficulty metadata
 */
export function run({ issues, contributor }) {
  if (!Array.isArray(issues) || issues.length === 0) return [];

  return issues.map((issue) => {
    const scored = scoreIssue(issue, contributor);

    return {
      number: issue.number,
      title: issue.title,
      url: issue.url,
      labels: issue.labels,
      difficulty: scored.difficulty,
      riskLevel: scored.riskLevel,
      scores: scored.scores,
      difficultyReason: DIFFICULTY_REASONS[scored.difficulty] || 'Unable to determine difficulty.',
      signals: issue.signals || {},
    };
  });
}
