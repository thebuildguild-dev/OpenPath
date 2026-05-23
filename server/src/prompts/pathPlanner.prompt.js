/**
 * Prompt builder for the Path Planner Agent.
 */

export function buildPathPlannerPrompt({ repoScout, architecture, setupAnalysis, scoredIssues, contributor }) {
  const issueList = scoredIssues
    .slice(0, 8)
    .map(
      (i, idx) =>
        `${idx + 1}. #${i.number} "${i.title}"
   finalScore=${i.scores?.finalScore || 0} | risk=${i.riskLevel} | difficulty=${i.difficulty}
   labels=[${(i.labels || []).join(', ')}] | comments=${i.comments || 0}
   body: ${(i.body || '').slice(0, 200)}`
    )
    .join('\n\n');

  return `You are OpenPath's Path Planner agent. Choose the single best issue for this contributor and explain why.

Contributor:
- Level: ${contributor.level}
- Skills: ${(contributor.skills || []).join(', ')}
- Goal: ${contributor.goal || 'first-pr'}
- Preferred contribution type: ${contributor.preferredContributionType || 'any'}

Repository:
- Type: ${repoScout?.projectType || 'unknown'}
- Summary: ${repoScout?.summary || 'N/A'}
- Beginner-friendly areas: ${(repoScout?.beginnerFriendlyAreas || []).join(', ')}
- Complex areas: ${(repoScout?.complexAreas || []).join(', ')}

Setup difficulty: ${setupAnalysis?.difficulty || 'unknown'}
Setup blockers: ${(setupAnalysis?.blockers || []).map((b) => (b.message || b)).join('; ') || 'none'}

Architecture risk areas:
${(architecture?.riskMap || []).map((r) => `  ${r.area}: ${r.risk}`).join('\n') || 'none'}

Scored issues (ranked):
${issueList || 'No issues available.'}

Return ONLY valid JSON (no markdown):

{
  "bestIssue": {
    "number": <issue number>,
    "title": "<issue title>",
    "url": "<issue url>",
    "reason": "<why this is the best pick for this contributor>"
  },
  "backupIssue": {
    "number": <issue number>,
    "title": "<issue title>",
    "reason": "<why this is a good backup>"
  },
  "overallReasoning": "<2-3 sentences explaining the selection strategy>",
  "suggestedFirstStep": "<first concrete action the contributor should take>"
}`;
}
