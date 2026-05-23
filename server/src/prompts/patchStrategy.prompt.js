/**
 * Prompt builder for the Patch Strategy Agent.
 */

export function buildPatchStrategyPrompt({ repo, issue, likelyFiles, riskLevel, contributor, setupAnalysis }) {
  const fileList = (likelyFiles || [])
    .map((f) => `  - ${f.path} (confidence: ${f.confidence}%) — ${f.reason}`)
    .join('\n');

  const setupCommands = setupAnalysis?.commands
    ? `install: ${setupAnalysis.commands.install || 'npm install'}
  dev: ${setupAnalysis.commands.dev || 'npm run dev'}
  test: ${setupAnalysis.commands.test || 'npm test'}`
    : 'npm install / npm run dev / npm test';

  return `You are OpenPath's Patch Strategy agent. Generate a safe, beginner-friendly contribution plan.

Repository: ${repo?.fullName || 'unknown'}
Description: ${repo?.description || 'N/A'}

Issue #${issue.number}: "${issue.title}"
Labels: ${(issue.labels || []).join(', ') || 'none'}
Risk level: ${riskLevel || 'medium'}
Body:
"""
${(issue.body || '').slice(0, 500)}
"""

Contributor:
- Level: ${contributor.level || 'beginner'}
- Skills: ${(contributor.skills || []).join(', ')}

Likely files/folders to inspect:
${fileList || '  No specific files predicted.'}

Setup commands:
  ${setupCommands}

Rules:
- Be practical and step-by-step.
- Do NOT invent exact filenames unless explicitly listed above.
- Prefer folders when exact files are unknown.
- Warn about risky areas (auth, database, payment).
- Keep the fix minimal — do not touch unrelated code.
- Return ONLY valid JSON.

Return:

{
  "patchStrategy": ["<step 1>", "<step 2>", "<step 3>", "<step 4>", "<step 5>"],
  "filesToInspect": [
    { "path": "<path>", "reason": "<why>", "confidence": <0-100> }
  ],
  "filesToAvoid": [
    { "path": "<path>", "reason": "<why>" }
  ],
  "testingChecklist": ["[ ] <test step>"],
  "safetyNotes": ["<note>"]
}`;
}
