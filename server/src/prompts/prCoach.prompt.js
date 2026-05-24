/**
 * Prompt builder for the PR Coach Agent.
 */

import { sanitizeForPrompt } from '../utils/sanitize.js';

export function buildPrCoachPrompt({ repo, issue, patchStrategy, testingChecklist }) {
  const steps = (patchStrategy || []).map((s, i) => `  ${i + 1}. ${s}`).join('\n');
  const tests = (testingChecklist || []).map((t) => `  ${t}`).join('\n');

  return `You are OpenPath's PR Coach agent. Generate professional PR communication for a contributor.

Repository: ${repo?.fullName || 'unknown'}
Issue #${issue.number}: "${issue.title}"
Labels: ${(issue.labels || []).join(', ') || 'none'}
Issue URL: ${issue.url || '#'}

Body excerpt:
"""
${sanitizeForPrompt(issue.body, 400)}
"""

Patch strategy:
${steps || '  (no steps provided)'}

Testing checklist:
${tests || '  (no tests listed)'}

Rules:
- PR title must follow conventional commit format: fix: / feat: / docs: / test: / chore:
- PR description must use markdown with ## Summary, ## Changes, ## Testing sections.
- Maintainer comment should be polite, short (2-3 sentences), and professional.
- Do NOT be overly verbose — keep it clean and production-grade.
- Return ONLY valid JSON.

Return:

{
  "prDraft": {
    "title": "<conventional commit PR title>",
    "description": "<full PR description in markdown>"
  },
  "maintainerComment": "<short comment to post when asking to work on the issue>"
}`;
}
