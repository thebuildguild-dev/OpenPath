import { generateJsonSafe } from './ai.service.js';

/**
 * Build a template-based PR draft when AI generation is unavailable.
 */
function buildTemplatePrDraft(repo, issue, patchPlan, testingChecklist) {
  const repoName = repo?.fullName || repo?.name || 'the repository';
  const issueNumber = issue?.number || '?';
  const issueTitle = issue?.title || 'Fix issue';
  const issueUrl = issue?.url || '';

  const patchLines = (patchPlan || []).map((step) => `- ${step}`).join('\n');
  const testLines = (testingChecklist || []).join('\n');

  const prTitle = `fix: ${issueTitle.toLowerCase().replace(/^fix[: ]*/i, '')}`;

  const prDescription = `## Summary

Fixes #${issueNumber}${issueUrl ? ` — [${issueTitle}](${issueUrl})` : ` — ${issueTitle}`}

## Changes Made

${patchLines || '- See commit history for detailed changes'}

## How to Test

${testLines || '- [ ] Run existing tests\n- [ ] Manual verification'}

## Checklist

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] No regressions introduced
- [ ] Self-reviewed the diff
- [ ] Linked the issue in the PR description

## Screenshots / Demo

<!-- Add screenshots or a short video if applicable -->
`;

  const maintainerComment = `Thank you for your contribution to ${repoName}! 🎉

This PR addresses #${issueNumber}. Our team will review it shortly.

A few reminders:
- Make sure all CI checks pass
- Respond to review comments promptly
- Feel free to ask questions if anything is unclear`;

  return { prTitle, prDescription, maintainerComment };
}

/**
 * Build the AI prompt for PR draft generation.
 */
function buildPrDraftPrompt(repo, issue, patchPlan, testingChecklist) {
  return `You are an expert open-source contributor helping write a professional Pull Request.

Repository: ${repo?.fullName || 'unknown'}
Issue #${issue?.number}: "${issue?.title || 'Fix'}"
Issue URL: ${issue?.url || 'N/A'}
Issue Body (truncated): ${(issue?.body || '').slice(0, 400)}

Patch Plan:
${(patchPlan || []).map((s, i) => `${i + 1}. ${s}`).join('\n') || 'Not specified'}

Testing Checklist:
${(testingChecklist || []).join('\n') || 'Not specified'}

Generate a JSON response ONLY (no markdown, no explanation outside JSON) with EXACTLY this structure:
{
  "prTitle": "<concise PR title following conventional commits format, e.g. fix: resolve button alignment in modal>",
  "prDescription": "<full GitHub markdown PR description with: Summary, Changes Made, How to Test sections>",
  "maintainerComment": "<a warm, professional comment a maintainer would leave on the PR>"
}`;
}

/**
 * Generate a PR draft using Groq or fall back to a template.
 */
export async function generatePrDraft(repo, issue, patchPlan, testingChecklist) {
  const fallback = buildTemplatePrDraft(repo, issue, patchPlan, testingChecklist);

  const prompt = buildPrDraftPrompt(repo, issue, patchPlan, testingChecklist);
  const { data, fromFallback } = await generateJsonSafe(prompt, fallback, 30000, {
    systemPrompt:
      'You are OpenPath, an AI mentor that writes safe, concise, high-quality pull request drafts for open-source contributors.',
  });

  return { ...data, fromFallback };
}
