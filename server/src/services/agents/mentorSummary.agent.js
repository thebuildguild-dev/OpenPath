/**
 * Mentor Summary Agent
 * Generates the final high-level contributor advice.
 * Layer 1: template fallback
 * Layer 2: Groq
 */

import { generateJsonSafe } from '../ai.service.js';
import { buildMentorSummaryPrompt } from '../../prompts/mentorSummary.prompt.js';

const LEVEL_ADVICE = {
  beginner: [
    'Keep your first PR small and focused — change as little as possible',
    'Avoid auth, database, payment, and core architecture files in your first contribution',
    'Write a clear PR description mentioning how you tested the fix',
    'Ask questions before starting — post a comment on the issue first',
    'Run the full test suite before submitting your PR',
  ],
  intermediate: [
    'Read the full context of the issue before coding — look at related files',
    'Trace the call stack to understand root cause, not just symptoms',
    'Add tests for your changes if the project has a test suite',
    'Keep your PR focused — avoid fixing unrelated issues in the same PR',
    'Use conventional commit messages for your commits',
  ],
  advanced: [
    'Review recent commit history to understand code evolution before changing it',
    'Discuss architectural decisions with maintainers in the issue before implementing',
    'Write comprehensive tests including edge cases',
    'Consider performance and security implications of your changes',
    'Update documentation if your changes affect the public API',
  ],
};

const FILES_TO_AVOID_BY_LEVEL = {
  beginner: ['auth/', 'database/', 'migrations/', 'payment/', 'billing/', 'prisma/', 'core/', 'middleware/', 'security/'],
  intermediate: ['migrations/', 'payment/', 'billing/', 'security/'],
  advanced: ['payment/', 'billing/'],
};

function buildFallbackSummary({ contributor, bestIssue, setupAnalysis, riskAreas, repoScout }) {
  const level = contributor.level || 'beginner';
  const name = contributor.name || 'Contributor';
  const issueRef = bestIssue?.number ? `#${bestIssue.number} "${bestIssue.title}"` : 'the selected issue';
  const riskHigh = (riskAreas || []).filter((r) => r.risk === 'high').map((r) => r.area).slice(0, 3);

  const mentorSummary = `${name} should start with issue ${issueRef}, which matches their skill set and has ${bestIssue?.riskLevel || 'manageable'} risk. As a ${level} contributor, focusing on a small, well-scoped change will maximize the chance of a successful first merge. ${riskHigh.length > 0 ? `Avoid touching ${riskHigh.join(', ')} during this contribution.` : 'Keep the change minimal and focused.'}`;

  return {
    mentorSummary,
    contributionAdvice: LEVEL_ADVICE[level] || LEVEL_ADVICE.beginner,
    suggestedFirstStep: bestIssue?.number
      ? `Fork the repo, clone it locally, read issue #${bestIssue.number} thoroughly, then reproduce the problem before writing any code.`
      : 'Fork the repository, clone it locally, and explore the codebase to find a good first issue.',
    filesToAvoid: FILES_TO_AVOID_BY_LEVEL[level] || FILES_TO_AVOID_BY_LEVEL.beginner,
    _source: 'rule-based',
  };
}

/**
 * Run the Mentor Summary Agent.
 */
export async function run({ contributor, bestIssue, setupAnalysis, riskAreas, repoScout }) {
  const fallback = buildFallbackSummary({ contributor, bestIssue, setupAnalysis, riskAreas, repoScout });

  const prompt = buildMentorSummaryPrompt({ contributor, bestIssue, setupAnalysis, riskAreas, repoScout });
  const { data, fromFallback } = await generateJsonSafe(prompt, fallback, 20000, {
    systemPrompt: 'You are OpenPath, an AI open-source mentor. Return ONLY valid JSON, no markdown.',
  });

  if (fromFallback) return fallback;

  return {
    mentorSummary: data.mentorSummary || fallback.mentorSummary,
    contributionAdvice: Array.isArray(data.contributionAdvice) && data.contributionAdvice.length > 0
      ? data.contributionAdvice
      : fallback.contributionAdvice,
    suggestedFirstStep: data.suggestedFirstStep || fallback.suggestedFirstStep,
    filesToAvoid: Array.isArray(data.filesToAvoid) ? data.filesToAvoid : fallback.filesToAvoid,
    _source: 'ai',
  };
}
