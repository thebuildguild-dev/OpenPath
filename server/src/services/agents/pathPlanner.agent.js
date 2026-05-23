/**
 * Path Planner Agent
 * Ranks scored issues and produces a personalized contribution roadmap.
 * Layer 1: deterministic ranking formula
 * Layer 2: Groq for reasoning (which issue + why)
 */

import { generateJsonSafe } from '../ai.service.js';
import { buildPathPlannerPrompt } from '../../prompts/pathPlanner.prompt.js';

//  Ranking formula 

function computeFinalScore(issue) {
  const s = issue.scores || {};
  const raw =
    (s.skillMatch || 0) * 0.30 +
    (s.beginnerFriendliness || 0) * 0.25 +
    (s.clarity || 0) * 0.20 +
    (s.confidence || 0) * 0.15 -
    (s.risk || 0) * 0.25 -
    (s.staleness || 0) * 0.10;

  return Math.max(0, Math.min(100, Math.round(((raw + 35) / 135) * 100)));
}

function rankIssues(scoredIssues, contributor) {
  return [...scoredIssues]
    .map((issue) => ({
      ...issue,
      _finalScore: issue.scores?.finalScore ?? computeFinalScore(issue),
    }))
    .filter((issue) => {
      // Filter out already-assigned issues for beginners
      if (contributor.level === 'beginner' && (issue.assignees || []).length > 0) return false;
      return true;
    })
    .sort((a, b) => b._finalScore - a._finalScore);
}

function buildFallbackPlanning(ranked, contributor) {
  const best = ranked[0] || null;
  const backup = ranked[1] || null;

  if (!best) {
    return {
      bestIssue: null,
      backupIssue: null,
      overallReasoning: 'No suitable issues found in this repository.',
      suggestedFirstStep: 'Explore the repository README and look for open issues manually.',
      _source: 'rule-based',
    };
  }

  return {
    bestIssue: {
      number: best.number,
      title: best.title,
      url: best.url,
      reason: `Highest score (${best._finalScore}) for a ${contributor.level} contributor with matching skills.`,
    },
    backupIssue: backup
      ? {
          number: backup.number,
          title: backup.title,
          reason: `Second-highest score (${backup._finalScore}) — a good fallback option.`,
        }
      : null,
    overallReasoning: `Issue #${best.number} "${best.title}" scored ${best._finalScore}/100 with ${best.riskLevel} risk and ${best.difficulty} difficulty — best fit for this contributor's skills and goals.`,
    suggestedFirstStep: `Fork and clone the repository, then read issue #${best.number} thoroughly before making any changes.`,
    _source: 'rule-based',
  };
}

//  Agent 

export async function run({ repoScout, architecture, setupAnalysis, scoredIssues, contributor }) {
  const ranked = rankIssues(scoredIssues, contributor);
  const fallback = buildFallbackPlanning(ranked, contributor);

  const prompt = buildPathPlannerPrompt({ repoScout, architecture, setupAnalysis, scoredIssues: ranked, contributor });
  const { data, fromFallback } = await generateJsonSafe(prompt, fallback, 25000, {
    systemPrompt: 'You are OpenPath, an AI open-source mentor. Return ONLY valid JSON, no markdown.',
  });

  if (fromFallback) return { ...fallback, rankedIssues: ranked };

  return {
    bestIssue: data.bestIssue || fallback.bestIssue,
    backupIssue: data.backupIssue || fallback.backupIssue,
    overallReasoning: data.overallReasoning || fallback.overallReasoning,
    suggestedFirstStep: data.suggestedFirstStep || fallback.suggestedFirstStep,
    rankedIssues: ranked,
    _source: 'ai',
  };
}
