/**
 * Patch Strategy Agent
 * Generates a safe, beginner-friendly patch strategy for a specific issue.
 * Always falls back to a template if Groq is unavailable.
 */

import { generateJsonSafe } from '../ai.service.js';
import { buildPatchStrategyPrompt } from '../../prompts/patchStrategy.prompt.js';

const GLOBAL_AVOID_AREAS = ['auth/', 'database/', 'migrations/', 'payment/', 'billing/', 'prisma/'];

function buildFallbackStrategy({ repo, issue, likelyFiles, riskLevel, contributor, setupAnalysis }) {
  const topFiles = (likelyFiles || []).slice(0, 3).map((f) => f.path);
  const pm = setupAnalysis?.packageManager || 'npm';

  const installCmd = setupAnalysis?.commands?.install || `${pm} install`;
  const devCmd = setupAnalysis?.commands?.dev || `${pm} run dev`;
  const testCmd = setupAnalysis?.commands?.test || `${pm} test`;

  const patchStrategy = [
    `Fork ${repo?.fullName || 'the repository'} on GitHub`,
    `Clone your fork: git clone <your-fork-url>`,
    `Install dependencies: ${installCmd}`,
    `Create a branch: git checkout -b fix/issue-${issue.number}`,
    topFiles.length > 0
      ? `Open and read these files first: ${topFiles.join(', ')}`
      : 'Explore the codebase to understand the issue context',
    `Reproduce the issue locally with: ${devCmd}`,
    'Make the minimal change needed — do not touch unrelated code',
    `Run tests to verify: ${testCmd}`,
    `Commit: git commit -m "fix: <short description> (fixes #${issue.number})"`,
    'Push your branch and open a Pull Request',
  ];

  const testingChecklist = [
    `[ ] Run: ${testCmd}`,
    '[ ] All existing tests pass',
    `[ ] Run: ${devCmd} and test manually`,
    '[ ] No console errors or regressions',
    '[ ] Code follows the existing style conventions',
  ];

  const filesToInspect = (likelyFiles || []).map((f) => ({ path: f.path, reason: f.reason || 'Predicted relevant file', confidence: f.confidence || 60 }));

  const filesToAvoid = riskLevel === 'high'
    ? GLOBAL_AVOID_AREAS.map((p) => ({ path: p, reason: 'High-risk area — avoid unless explicitly needed' }))
    : [{ path: 'migrations/', reason: 'Database changes are risky for first PRs' }];

  const safetyNotes = [
    'Keep your PR focused — only touch files related to this issue',
    'If you discover related problems, open a separate issue instead of fixing them here',
    contributor.level === 'beginner'
      ? 'As a beginner, avoid touching authentication, database, or payment files'
      : 'Test edge cases before submitting your PR',
  ];

  return { patchStrategy, filesToInspect, filesToAvoid, testingChecklist, safetyNotes, _source: 'rule-based' };
}

/**
 * Run the Patch Strategy Agent for a single issue.
 */
export async function run({ repo, issue, likelyFiles, riskLevel, contributor, setupAnalysis }) {
  const fallback = buildFallbackStrategy({ repo, issue, likelyFiles, riskLevel, contributor, setupAnalysis });

  const prompt = buildPatchStrategyPrompt({ repo, issue, likelyFiles, riskLevel, contributor, setupAnalysis });
  const { data, fromFallback } = await generateJsonSafe(prompt, fallback, 25000, {
    systemPrompt: 'You are OpenPath, an AI open-source mentor. Return ONLY valid JSON, no markdown.',
  });

  if (fromFallback) return fallback;

  return {
    patchStrategy: Array.isArray(data.patchStrategy) && data.patchStrategy.length > 0 ? data.patchStrategy : fallback.patchStrategy,
    filesToInspect: Array.isArray(data.filesToInspect) ? data.filesToInspect : fallback.filesToInspect,
    filesToAvoid: Array.isArray(data.filesToAvoid) ? data.filesToAvoid : fallback.filesToAvoid,
    testingChecklist: Array.isArray(data.testingChecklist) && data.testingChecklist.length > 0 ? data.testingChecklist : fallback.testingChecklist,
    safetyNotes: Array.isArray(data.safetyNotes) ? data.safetyNotes : fallback.safetyNotes,
    _source: 'ai',
  };
}
