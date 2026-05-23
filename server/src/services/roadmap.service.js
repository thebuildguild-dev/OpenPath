import { generateJsonSafe } from './gemini.service.js';
import { predictLikelyFiles } from './filePredictor.service.js';

/**
 * Build a rule-based fallback roadmap when Gemini is unavailable.
 */
function buildFallbackRoadmap(repo, contributor, issues, setupAnalysis) {
  const best = issues[0] || null;
  if (!best) {
    return {
      bestIssue: null,
      whyThisIssue:
        'No suitable issues found. Consider checking the repository for open issues or creating one.',
      likelyFiles: [],
      riskAssessment: {
        level: 'unknown',
        reason: 'No issues available to assess',
        filesToAvoid: [],
      },
      patchStrategy: [
        'Fork the repository',
        'Clone your fork locally',
        'Create a new branch: git checkout -b fix/your-fix',
        'Make your changes following the existing code style',
        'Run tests to verify your changes',
        'Submit a Pull Request with a clear description',
      ],
      testingChecklist: [
        '[ ] All existing tests pass',
        '[ ] New tests added if needed',
        '[ ] Manual testing completed',
        '[ ] No console errors or warnings',
      ],
      filesToAvoid: ['Core authentication files', 'Database migrations', 'Payment processing'],
      prDraft: buildFallbackPrDraft(repo, best, []),
      maintainerComment: 'Please follow the contribution guidelines and ensure all tests pass.',
      fromFallback: true,
    };
  }

  const likelyFiles = predictLikelyFiles(best);

  const riskLevel = best.riskLevel || 'medium';
  const riskReasons = {
    low: 'This issue involves low-risk changes (docs, UI, or tests).',
    medium: 'This issue involves moderate complexity. Proceed carefully and test thoroughly.',
    high: 'This issue touches sensitive or complex areas. Extra caution is needed.',
  };

  const patchStrategy = [
    `Fork and clone ${repo?.fullName || 'the repository'}`,
    `Create a branch: git checkout -b fix/issue-${best.number}`,
    `Navigate to the likely files: ${likelyFiles.slice(0, 2).map((f) => f.path).join(', ')}`,
    'Read related code and understand the context before changing anything',
    'Implement the minimal change needed to fix the issue',
    `Run tests: ${setupAnalysis?.commands?.test || 'npm test'}`,
    'Commit with a descriptive message referencing the issue',
    `Create a PR and reference #${best.number} in the description`,
  ];

  const testingChecklist = [
    `[ ] Run: ${setupAnalysis?.commands?.test || 'npm test'}`,
    '[ ] All existing tests pass',
    '[ ] Manually tested the fix in a browser / terminal',
    '[ ] No regressions introduced',
    '[ ] Code follows the existing style conventions',
  ];

  if (riskLevel === 'high') {
    testingChecklist.push('[ ] Security impact reviewed');
    testingChecklist.push('[ ] Edge cases tested');
  }

  return {
    bestIssue: {
      number: best.number,
      title: best.title,
      url: best.url,
      scores: best.scores,
      riskLevel: best.riskLevel,
      difficulty: best.difficulty,
    },
    whyThisIssue: `Issue #${best.number} "${best.title}" was selected because it has the highest compatibility score for a ${contributor.level || 'beginner'} contributor with your skill set.`,
    likelyFiles,
    riskAssessment: {
      level: riskLevel,
      reason: riskReasons[riskLevel] || riskReasons.medium,
      filesToAvoid: riskLevel === 'high' ? ['auth/', 'database/', 'migrations/'] : [],
    },
    patchStrategy,
    testingChecklist,
    filesToAvoid: riskLevel === 'high' ? ['auth/', 'database/', 'migrations/', 'prisma/'] : ['migrations/', 'config/secrets'],
    prDraft: buildFallbackPrDraft(repo, best, testingChecklist),
    maintainerComment: `Thank you for working on this! Please ensure all tests pass and reference #${best.number} in your PR description.`,
    fromFallback: true,
  };
}

function buildFallbackPrDraft(repo, issue, testingChecklist) {
  if (!issue) {
    return {
      prTitle: 'fix: resolve issue',
      prDescription: 'Resolves the issue described in the linked ticket.\n\n## Changes\n- \n\n## Testing\n- [ ] Tests pass',
      maintainerComment: 'Thank you for your contribution!',
    };
  }
  return {
    prTitle: `fix: ${issue.title}`,
    prDescription: `## Summary\nFixes #${issue.number} — ${issue.title}\n\n## Changes\n- \n\n## Testing\n${testingChecklist.join('\n')}\n\n## Screenshots\n<!-- If applicable -->\n`,
    maintainerComment: `Thanks for contributing! This PR addresses #${issue.number}. Please ensure all CI checks pass.`,
  };
}

/**
 * Build the Gemini prompt for roadmap generation.
 */
function buildRoadmapPrompt(repo, contributor, issues, setupAnalysis) {
  return `You are an expert open-source contribution mentor. Analyze this GitHub repository and generate a personalized contribution roadmap for a developer.

Repository: ${repo?.fullName || 'unknown'}
Description: ${repo?.description || 'N/A'}
Primary Language: ${repo?.primaryLanguage || 'N/A'}
Stars: ${repo?.stars || 0}

Contributor Profile:
- Name: ${contributor?.name || 'Developer'}
- Level: ${contributor?.level || 'beginner'}
- Skills: ${(contributor?.skills || []).join(', ') || 'not specified'}
- Goal: ${contributor?.goal || 'first-pr'}
- Preferred Contribution Type: ${contributor?.preferredContributionType || 'code'}

Setup Analysis:
- Difficulty: ${setupAnalysis?.difficulty || 'unknown'}
- Package Manager: ${setupAnalysis?.packageManager || 'npm'}
- Detected Stack: ${(setupAnalysis?.detectedStack || []).join(', ') || 'unknown'}
- Blockers: ${(setupAnalysis?.blockers || []).map((b) => b.message).join('; ') || 'none'}

Top Scored Issues (pick the BEST one for this contributor):
${issues
  .slice(0, 5)
  .map(
    (i, idx) =>
      `${idx + 1}. Issue #${i.number}: "${i.title}"
   Risk: ${i.riskLevel || 'unknown'} | Difficulty: ${i.difficulty || 'unknown'} | Final Score: ${i.scores?.finalScore || 0}
   Labels: ${(i.labels || []).join(', ') || 'none'}
   Body (truncated): ${(i.body || '').slice(0, 300)}`
  )
  .join('\n\n')}

Generate a JSON response ONLY (no markdown, no explanation outside JSON) with EXACTLY this structure:
{
  "bestIssue": {
    "number": <issue number>,
    "title": "<issue title>",
    "url": "<issue url>"
  },
  "whyThisIssue": "<2-3 sentence explanation of why this issue is best for this contributor>",
  "likelyFiles": [
    { "path": "<file or folder path>", "reason": "<why this file is involved>" }
  ],
  "riskAssessment": {
    "level": "<low|medium|high>",
    "reason": "<1-2 sentence risk assessment>",
    "filesToAvoid": ["<path>"]
  },
  "patchStrategy": [
    "<step 1>",
    "<step 2>"
  ],
  "testingChecklist": [
    "[ ] <test step>"
  ],
  "filesToAvoid": ["<path>"],
  "prDraft": {
    "prTitle": "<suggested PR title>",
    "prDescription": "<full PR description with markdown>",
    "maintainerComment": "<what a maintainer might reply>"
  },
  "maintainerComment": "<encouraging message to send maintainers>"
}`;
}

/**
 * Generate a full contribution roadmap.
 * Uses Gemini if available, falls back to rule-based.
 */
export async function generateRoadmap(repo, contributor, issues, setupAnalysis) {
  const fallback = buildFallbackRoadmap(repo, contributor, issues, setupAnalysis);

  if (!process.env.GEMINI_API_KEY) {
    console.warn('[Roadmap] GEMINI_API_KEY not set — using rule-based fallback');
    return fallback;
  }

  const prompt = buildRoadmapPrompt(repo, contributor, issues, setupAnalysis);
  const { data, fromFallback } = await generateJsonSafe(prompt, fallback);

  if (fromFallback) return fallback;

  // Merge Gemini result with best issue scores from our scoring service
  const best = issues.find((i) => i.number === data.bestIssue?.number) || issues[0];
  return {
    ...data,
    bestIssue: best
      ? {
          number: best.number,
          title: best.title,
          url: best.url,
          scores: best.scores,
          riskLevel: best.riskLevel,
          difficulty: best.difficulty,
        }
      : data.bestIssue,
    fromFallback: false,
  };
}
