/**
 * Prompt builder for the Mentor Summary Agent.
 */

export function buildMentorSummaryPrompt({ contributor, bestIssue, setupAnalysis, riskAreas, repoScout }) {
  const riskList = (riskAreas || [])
    .filter((r) => r.risk === 'high')
    .map((r) => r.area)
    .join(', ') || 'none detected';

  return `You are OpenPath's Mentor Summary agent. Write final high-level guidance for this contributor.

Contributor:
- Name: ${contributor.name || 'Contributor'}
- Level: ${contributor.level || 'beginner'}
- Skills: ${(contributor.skills || []).join(', ')}
- Goal: ${contributor.goal || 'first-pr'}

Repository summary: ${repoScout?.summary || 'N/A'}
Project type: ${repoScout?.projectType || 'unknown'}

Best issue selected: #${bestIssue?.number || '?'} "${bestIssue?.title || 'N/A'}"
Risk level: ${bestIssue?.riskLevel || 'unknown'}
Difficulty: ${bestIssue?.difficulty || 'unknown'}

Setup difficulty: ${setupAnalysis?.difficulty || 'unknown'}
High-risk areas to avoid: ${riskList}

Rules:
- Be encouraging but honest.
- Mention specific areas to avoid for this contributor level.
- Give 3-5 actionable contribution tips.
- Keep mentorSummary under 3 sentences.
- Return ONLY valid JSON.

Return:

{
  "mentorSummary": "<2-3 sentence personalized mentor advice>",
  "contributionAdvice": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "suggestedFirstStep": "<the single most important first action to take>",
  "filesToAvoid": ["<path or area>"]
}`;
}
