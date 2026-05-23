/**
 * PR Coach Agent
 * Generates PR title, description, and maintainer comment.
 * Layer 1: template fallback
 * Layer 2: Groq
 */

import { generateJsonSafe } from '../ai.service.js';
import { buildPrCoachPrompt } from '../../prompts/prCoach.prompt.js';

function inferPrPrefix(issue) {
  const text = `${issue.title || ''} ${(issue.labels || []).join(' ')}`.toLowerCase();
  if (/docs|documentation|typo|readme|spelling/i.test(text)) return 'docs';
  if (/test|spec|coverage/i.test(text)) return 'test';
  if (/chore|ci|config|lint|dep|upgrade|bump/i.test(text)) return 'chore';
  if (/feat|feature|add|new|implement|enhancement/i.test(text)) return 'feat';
  return 'fix';
}

function buildFallbackPr({ repo, issue, patchStrategy, testingChecklist }) {
  const prefix = inferPrPrefix(issue);
  const shortTitle = (issue.title || 'resolve issue')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .slice(0, 60);

  const prTitle = `${prefix}: ${shortTitle} (#${issue.number})`;

  const changes = (patchStrategy || []).slice(0, 4).map((s) => `- ${s}`).join('\n');
  const tests = (testingChecklist || []).slice(0, 4).join('\n');

  const prDescription = `## Summary
Fixes #${issue.number} — ${issue.title}

## Changes
${changes || '- Implement fix as described in the issue'}

## Testing
${tests || '- [ ] All existing tests pass\n- [ ] Manual testing completed'}

## Screenshots
<!-- If applicable, add screenshots to help explain your changes -->

## Checklist
- [ ] I have read the contributing guidelines
- [ ] My changes follow the existing code style
- [ ] I have tested my changes locally
- [ ] I referenced the issue number in this PR`;

  const maintainerComment = `Hi maintainers! I would like to work on issue #${issue.number}. I plan to ${prefix === 'fix' ? 'fix' : 'implement'} the ${issue.title.toLowerCase().slice(0, 60)} with a minimal, focused change and verify it locally. Please let me know if you have any guidance!`;

  return { prDraft: { title: prTitle, description: prDescription }, maintainerComment, _source: 'rule-based' };
}

/**
 * Run the PR Coach Agent.
 */
export async function run({ repo, issue, patchStrategy, testingChecklist }) {
  const fallback = buildFallbackPr({ repo, issue, patchStrategy, testingChecklist });

  const prompt = buildPrCoachPrompt({ repo, issue, patchStrategy, testingChecklist });
  const { data, fromFallback } = await generateJsonSafe(prompt, fallback, 25000, {
    systemPrompt: 'You are OpenPath, an AI open-source mentor. Return ONLY valid JSON, no markdown.',
  });

  if (fromFallback) return fallback;

  return {
    prDraft: {
      title: data.prDraft?.title || fallback.prDraft.title,
      description: data.prDraft?.description || fallback.prDraft.description,
    },
    maintainerComment: data.maintainerComment || fallback.maintainerComment,
    _source: 'ai',
  };
}
