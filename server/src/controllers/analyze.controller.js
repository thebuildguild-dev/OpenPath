import {
  getRepoMetadata,
  getRepoIssues,
  getReadme,
  getTopLevelContents,
  getFileIfExists,
  getRepoLanguages,
} from '../services/github.service.js';
import { scoreIssues } from '../services/scoring.service.js';
import { predictForIssues } from '../services/filePredictor.service.js';
import { analyzeSetup } from '../services/setupAnalyzer.service.js';
import { generateRoadmap } from '../services/roadmap.service.js';
import { parseRepoUrl } from '../utils/parseRepoUrl.js';
import { validateAnalyzeBody } from '../utils/validators.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function analyzeRepo(req, res) {
  const { repoUrl, contributor, options = {} } = req.body;

  // ── 1. Validate input ──────────────────────────────────────────────────────
  const validationError = validateAnalyzeBody({ repoUrl, contributor });
  if (validationError) {
    return errorResponse(res, validationError, 'VALIDATION_ERROR', null, 400);
  }

  const maxIssues = Math.min(Number(options.maxIssues) || 20, 50);
  const includeAiRoadmap = options.includeAiRoadmap !== false;
  const includePrDraft = options.includePrDraft !== false;
  const includeSetupAnalysis = options.includeSetupAnalysis !== false;

  try {
    // ── 2. Parse owner/repo ──────────────────────────────────────────────────
    const { owner, repo } = parseRepoUrl(repoUrl);

    // ── 3. Fetch repo metadata and top-level contents in parallel ─────────────
    const [repoMeta, topLevelContents, languages] = await Promise.all([
      getRepoMetadata(owner, repo),
      getTopLevelContents(owner, repo),
      getRepoLanguages(owner, repo),
    ]);

    // ── 4. Determine which optional files exist ────────────────────────────
    const fileNames = topLevelContents.map((f) => f.name.toLowerCase());
    const hasPackageJson = fileNames.includes('package.json');
    const envExampleExists =
      fileNames.includes('.env.example') || fileNames.includes('.env.sample');
    const contributingExists = fileNames.some((n) =>
      n.toLowerCase().startsWith('contributing')
    );

    // ── 5. Fetch README, package.json, issues in parallel ─────────────────
    const [readme, packageJsonRaw, rawIssues] = await Promise.all([
      getReadme(owner, repo),
      hasPackageJson ? getFileIfExists(owner, repo, 'package.json') : Promise.resolve(null),
      getRepoIssues(owner, repo, { state: 'open', limit: maxIssues }),
    ]);

    // ── 6. Parse package.json safely ──────────────────────────────────────
    let packageJson = null;
    if (packageJsonRaw) {
      try {
        packageJson = JSON.parse(packageJsonRaw);
      } catch {
        // silently ignore parse errors
      }
    }

    // ── 7. Score issues ───────────────────────────────────────────────────
    const scoredIssues = scoreIssues(rawIssues, contributor);

    // ── 8. Predict likely files for top 5 issues ─────────────────────────
    const top5 = scoredIssues.slice(0, 5);
    const filePredictions = predictForIssues(top5);

    // Attach file predictions to scored issues
    const recommendedIssues = scoredIssues.map((issue) => ({
      ...issue,
      likelyFiles: filePredictions[issue.number] || [],
    }));

    // ── 9. Analyze setup ──────────────────────────────────────────────────
    const setupAnalysis = includeSetupAnalysis
      ? analyzeSetup({ readme, packageJson, envExampleExists, contributingExists, topLevelFiles: topLevelContents })
      : null;

    // ── 10. Generate AI roadmap (top 5 scored issues) ────────────────────
    let overallGuidance = null;
    if (includeAiRoadmap && top5.length > 0) {
      overallGuidance = await generateRoadmap(repoMeta, contributor, top5, setupAnalysis);
    }

    // Attach likely files to bestIssue inside guidance
    if (overallGuidance?.bestIssue) {
      const bestFull = recommendedIssues.find(
        (i) => i.number === overallGuidance.bestIssue.number
      );
      if (bestFull) {
        overallGuidance.bestIssue = {
          ...overallGuidance.bestIssue,
          likelyFiles: bestFull.likelyFiles,
        };
      }
    }

    // ── 11. Build repo summary ────────────────────────────────────────────
    const repoSummary = {
      totalFilesScanned: topLevelContents.length,
      issuesFetched: rawIssues.length,
      issuesFiltered: scoredIssues.length,
      topLanguages: languages,
      hasContributing: contributingExists,
      hasEnvExample: envExampleExists,
      readmeFound: Boolean(readme),
    };

    // ── 12. Return combined result ────────────────────────────────────────
    return successResponse(
      res,
      {
        repo: repoMeta,
        repoSummary,
        setupAnalysis,
        recommendedIssues: recommendedIssues.slice(0, 10),
        bestIssue: overallGuidance?.bestIssue || recommendedIssues[0] || null,
        overallGuidance,
      },
      'Repository analyzed successfully'
    );
  } catch (err) {
    console.error('[Analyze] Error:', err.message);

    if (err.message?.includes('not found') || err.message?.includes('404')) {
      return errorResponse(res, `Repository not found: ${repoUrl}`, 'NOT_FOUND', err.message, 404);
    }
    if (err.message?.includes('GitHub API')) {
      return errorResponse(res, err.message, 'GITHUB_ERROR', err.message, 502);
    }
    return errorResponse(res, 'Analysis failed. Please try again.', 'ANALYSIS_ERROR', err.message, 500);
  }
}
