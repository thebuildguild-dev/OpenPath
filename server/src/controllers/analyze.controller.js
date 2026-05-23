/**
 * Analyze Controller — Full 12-Agent Pipeline
 *
 * Pipeline order:
 *  1  Validate + parse
 *  2  Fetch GitHub data (parallel)
 *  3  Repo Scout Agent
 *  4  Architecture Mapper Agent
 *  5  Setup Inspector Agent
 *  6  Issue Miner Agent
 *  7  Code Risk Mapper Agent
 *  8  Issue Difficulty Agent
 *  9  Skill Match Agent
 * 10  File Predictor (per issue)
 * 11  Path Planner Agent
 * 12  Patch Strategy Agent (best issue)
 * 13  PR Coach Agent (best issue)
 * 14  Mentor Summary Agent
 * 15  Return frontend-ready JSON
 */

import {
  getRepoMetadata,
  getRepoIssues,
  getReadme,
  getTopLevelContents,
  getFileIfExists,
  getRepoLanguages,
} from '../services/github.service.js';
import { parseRepoUrl } from '../utils/parseRepoUrl.js';
import { validateAnalyzeBody } from '../utils/validators.js';
import { successResponse, errorResponse } from '../utils/response.js';

//  Agents 
import * as repoScoutAgent from '../services/agents/repoScout.agent.js';
import * as architectureMapperAgent from '../services/agents/architectureMapper.agent.js';
import * as issueMinerAgent from '../services/agents/issueMiner.agent.js';
import * as setupInspectorAgent from '../services/agents/setupInspector.agent.js';
import * as codeRiskMapperAgent from '../services/agents/codeRiskMapper.agent.js';
import * as issueDifficultyAgent from '../services/agents/issueDifficulty.agent.js';
import * as skillMatchAgent from '../services/agents/skillMatch.agent.js';
import * as pathPlannerAgent from '../services/agents/pathPlanner.agent.js';
import * as patchStrategyAgent from '../services/agents/patchStrategy.agent.js';
import * as prCoachAgent from '../services/agents/prCoach.agent.js';
import * as mentorSummaryAgent from '../services/agents/mentorSummary.agent.js';

//  Scoring + Predictors 
import { scoreIssues } from '../services/scoring/issueScoring.service.js';
import { predictForIssues } from '../services/predictors/filePredictor.service.js';

// 

export async function analyzeRepo(req, res) {
  const { repoUrl, contributor, options = {} } = req.body;

  //  Step 1: Validate 
  const validationError = validateAnalyzeBody({ repoUrl, contributor });
  if (validationError) {
    return errorResponse(res, validationError, 'VALIDATION_ERROR', null, 400);
  }

  const maxIssues = Math.min(Number(options.maxIssues) || 20, 50);
  const includeAiAnalysis = options.includeAiAnalysis !== false;
  const includePrDraft = options.includePrDraft !== false;
  const includeSetupAnalysis = options.includeSetupAnalysis !== false;
  const includeArchitectureAnalysis = options.includeArchitectureAnalysis !== false;

  const startTime = Date.now();

  try {
    //  Step 2: Parse + fetch GitHub data in parallel 
    const { owner, repo } = parseRepoUrl(repoUrl);

    const [repoMeta, topLevelContents, languages] = await Promise.all([
      getRepoMetadata(owner, repo),
      getTopLevelContents(owner, repo),
      getRepoLanguages(owner, repo),
    ]);

    const fileNames = topLevelContents.map((f) => f.name.toLowerCase());
    const hasPackageJson = fileNames.includes('package.json');
    const envExampleExists = fileNames.includes('.env.example') || fileNames.includes('.env.sample');
    const contributingExists = fileNames.some((n) => n.startsWith('contributing'));

    const [readme, packageJsonRaw, rawIssues] = await Promise.all([
      getReadme(owner, repo),
      hasPackageJson ? getFileIfExists(owner, repo, 'package.json') : Promise.resolve(null),
      getRepoIssues(owner, repo, { state: 'open', limit: maxIssues }),
    ]);

    let packageJson = null;
    if (packageJsonRaw) {
      try { packageJson = JSON.parse(packageJsonRaw); } catch { /* ignore */ }
    }

    console.log(`[Analyze] GitHub data fetched in ${Date.now() - startTime}ms — ${rawIssues.length} issues`);

    //  Step 3: Repo Scout Agent 
    const t3 = Date.now();
    const repoScout = await repoScoutAgent.run({
      repoMetadata: repoMeta,
      readme,
      languages,
      topLevelContents,
      packageJson,
    });
    console.log(`[Agent 3] Repo Scout (${repoScout._source}) — ${Date.now() - t3}ms`);

    //  Step 4: Architecture Mapper Agent 
    let architecture = null;
    if (includeArchitectureAnalysis) {
      const t4 = Date.now();
      architecture = await architectureMapperAgent.run({
        topLevelContents,
        packageJson,
        readme,
        detectedStack: repoScout.detectedStack || [],
      });
      console.log(`[Agent 4] Architecture Mapper (${architecture._source}) — ${Date.now() - t4}ms`);
    }

    //  Step 5: Setup Inspector Agent 
    let setupAnalysis = null;
    if (includeSetupAnalysis) {
      const t5 = Date.now();
      setupAnalysis = setupInspectorAgent.run({
        readme,
        packageJson,
        envExampleExists,
        contributingExists,
        topLevelFiles: topLevelContents,
      });
      console.log(`[Agent 5] Setup Inspector — ${Date.now() - t5}ms`);
    }

    //  Step 6: Issue Miner Agent 
    const t6 = Date.now();
    const minedIssues = issueMinerAgent.run({ issues: rawIssues });
    console.log(`[Agent 6] Issue Miner — ${minedIssues.length} issues enriched — ${Date.now() - t6}ms`);

    //  Step 7: Code Risk Mapper Agent 
    const t7 = Date.now();
    const riskMap = codeRiskMapperAgent.run({
      architecture: architecture || {},
      issues: minedIssues,
      topLevelContents,
    });
    console.log(`[Agent 7] Code Risk Mapper — ${Date.now() - t7}ms`);

    //  Step 8: Issue Difficulty Agent 
    const t8 = Date.now();
    const difficultyResults = issueDifficultyAgent.run({ issues: minedIssues, contributor });
    console.log(`[Agent 8] Issue Difficulty — ${Date.now() - t8}ms`);

    //  Step 9: Skill Match Agent 
    const t9 = Date.now();
    const skillMatchResults = skillMatchAgent.run({ contributor, issues: minedIssues, difficultyResults });
    console.log(`[Agent 9] Skill Match — ${Date.now() - t9}ms`);

    // Build skill match map for quick lookup
    const skillMatchMap = {};
    for (const sm of skillMatchResults) skillMatchMap[sm.number] = sm;

    //  Step 10: File Predictor (per issue) 
    const t10 = Date.now();
    const filePredictions = predictForIssues(minedIssues.slice(0, 10));
    console.log(`[Agent 10] File Predictor — ${Date.now() - t10}ms`);

    //  Merge all issue-level signals into scored + enriched issues 
    const scoredIssues = scoreIssues(minedIssues, contributor);

    const enrichedIssues = scoredIssues.map((issue) => {
      const sm = skillMatchMap[issue.number] || {};
      const diff = difficultyResults.find((d) => d.number === issue.number) || {};
      const riskHint = riskMap.issueRiskHints?.[issue.number] || {};
      const likelyFiles = filePredictions[issue.number] || [];

      return {
        rank: 0, // filled in below
        number: issue.number,
        title: issue.title,
        url: issue.url,
        labels: issue.labels,
        difficulty: diff.difficulty || issue.difficulty,
        riskLevel: riskHint.riskLevel || issue.riskLevel,
        scores: {
          ...issue.scores,
          skillMatch: sm.skillMatch ?? issue.scores?.skillMatch,
        },
        whyRecommended: sm.matchReason || diff.difficultyReason || '',
        matchedSkills: sm.matchedSkills || [],
        likelyFiles,
        safeAreas: (riskMap.safeAreas || []).map((s) => s.area),
        riskyAreas: (riskHint.avoidAreas || []),
        signals: issue.signals || {},
      };
    });

    // Assign ranks
    enrichedIssues.forEach((issue, idx) => { issue.rank = idx + 1; });

    //  Step 11: Path Planner Agent 
    const t11 = Date.now();
    const pathPlan = await pathPlannerAgent.run({
      repoScout,
      architecture: architecture || {},
      setupAnalysis,
      scoredIssues: enrichedIssues,
      contributor,
    });
    console.log(`[Agent 11] Path Planner (${pathPlan._source}) — ${Date.now() - t11}ms`);

    // Resolve the best issue object
    const bestIssueNumber = pathPlan.bestIssue?.number || enrichedIssues[0]?.number;
    const bestIssueEnriched = enrichedIssues.find((i) => i.number === bestIssueNumber) || enrichedIssues[0];

    //  Step 12: Patch Strategy Agent (best issue only) 
    let patchStrategyResult = null;
    if (bestIssueEnriched) {
      const t12 = Date.now();
      patchStrategyResult = await patchStrategyAgent.run({
        repo: repoMeta,
        issue: bestIssueEnriched,
        likelyFiles: bestIssueEnriched.likelyFiles,
        riskLevel: bestIssueEnriched.riskLevel,
        contributor,
        setupAnalysis,
      });
      console.log(`[Agent 12] Patch Strategy (${patchStrategyResult._source}) — ${Date.now() - t12}ms`);
    }

    //  Step 13: PR Coach Agent 
    let prCoachResult = null;
    if (includePrDraft && bestIssueEnriched && patchStrategyResult) {
      const t13 = Date.now();
      prCoachResult = await prCoachAgent.run({
        repo: repoMeta,
        issue: bestIssueEnriched,
        patchStrategy: patchStrategyResult.patchStrategy,
        testingChecklist: patchStrategyResult.testingChecklist,
      });
      console.log(`[Agent 13] PR Coach (${prCoachResult._source}) — ${Date.now() - t13}ms`);
    }

    //  Step 14: Mentor Summary Agent 
    const t14 = Date.now();
    const mentorResult = await mentorSummaryAgent.run({
      contributor,
      bestIssue: bestIssueEnriched,
      setupAnalysis,
      riskAreas: riskMap.globalRiskAreas || [],
      repoScout,
    });
    console.log(`[Agent 14] Mentor Summary (${mentorResult._source}) — ${Date.now() - t14}ms`);

    //  Step 15: Attach patch strategy + PR draft to the best issue 
    const recommendedIssues = enrichedIssues.slice(0, 10).map((issue) => {
      if (issue.number !== bestIssueNumber) return issue;

      return {
        ...issue,
        patchStrategy: patchStrategyResult?.patchStrategy || [],
        testingChecklist: patchStrategyResult?.testingChecklist || [],
        filesToAvoid: patchStrategyResult?.filesToAvoid || [],
        safetyNotes: patchStrategyResult?.safetyNotes || [],
        prDraft: prCoachResult?.prDraft || null,
        maintainerComment: prCoachResult?.maintainerComment || null,
      };
    });

    const bestIssueFull = recommendedIssues.find((i) => i.number === bestIssueNumber);

    const totalMs = Date.now() - startTime;
    console.log(`[Analyze] Pipeline complete in ${totalMs}ms`);

    //  Step 15: Assemble final response 
    return successResponse(
      res,
      {
        repo: {
          owner: repoMeta.owner,
          name: repoMeta.name,
          fullName: repoMeta.fullName,
          url: repoMeta.url,
          description: repoMeta.description,
          stars: repoMeta.stars,
          forks: repoMeta.forks,
          openIssues: repoMeta.openIssues,
          defaultBranch: repoMeta.defaultBranch,
          primaryLanguage: repoMeta.primaryLanguage,
          languages: Object.keys(languages || {}),
          topics: repoMeta.topics || [],
        },
        repoScout: {
          projectType: repoScout.projectType,
          summary: repoScout.summary,
          mainPurpose: repoScout.mainPurpose,
          importantFiles: repoScout.importantFiles,
          importantFolders: repoScout.importantFolders,
          beginnerFriendlyAreas: repoScout.beginnerFriendlyAreas,
          complexAreas: repoScout.complexAreas,
        },
        architecture: architecture
          ? {
              detectedStack: architecture.detectedStack,
              frontendFolders: architecture.frontendFolders,
              backendFolders: architecture.backendFolders,
              testFolders: architecture.testFolders,
              configFiles: architecture.configFiles,
              architectureSummary: architecture.architectureSummary,
              riskMap: architecture.riskMap,
            }
          : null,
        setupAnalysis: setupAnalysis
          ? {
              difficulty: setupAnalysis.difficulty,
              score: setupAnalysis.score,
              packageManager: setupAnalysis.packageManager,
              detectedStack: setupAnalysis.detectedStack,
              commands: setupAnalysis.commands,
              blockers: setupAnalysis.blockers,
              warnings: setupAnalysis.warnings,
              recommendations: setupAnalysis.recommendations,
            }
          : null,
        recommendedIssues,
        bestIssue: bestIssueFull
          ? {
              number: bestIssueFull.number,
              title: bestIssueFull.title,
              url: bestIssueFull.url,
              finalScore: bestIssueFull.scores?.finalScore,
              riskLevel: bestIssueFull.riskLevel,
              difficulty: bestIssueFull.difficulty,
              likelyFiles: bestIssueFull.likelyFiles,
              prDraft: bestIssueFull.prDraft,
              maintainerComment: bestIssueFull.maintainerComment,
            }
          : null,
        overallGuidance: {
          suggestedFirstStep: pathPlan.suggestedFirstStep || mentorResult.suggestedFirstStep,
          overallReasoning: pathPlan.overallReasoning,
          filesToAvoid: mentorResult.filesToAvoid || [],
          contributionAdvice: mentorResult.contributionAdvice || [],
          mentorSummary: mentorResult.mentorSummary,
        },
        meta: {
          totalIssuesFetched: rawIssues.length,
          issuesAnalyzed: enrichedIssues.length,
          pipelineMs: totalMs,
          agentSources: {
            repoScout: repoScout._source,
            architecture: architecture?._source,
            pathPlanner: pathPlan._source,
            patchStrategy: patchStrategyResult?._source,
            prCoach: prCoachResult?._source,
            mentorSummary: mentorResult._source,
          },
        },
      },
      'Repository analyzed successfully'
    );
  } catch (err) {
    console.error('[Analyze] Pipeline error:', err.message);

    if (err.message?.includes('not found') || err.message?.includes('404')) {
      return errorResponse(res, `Repository not found: ${repoUrl}`, 'NOT_FOUND', err.message, 404);
    }
    if (err.message?.includes('GitHub API')) {
      return errorResponse(res, err.message, 'GITHUB_ERROR', err.message, 502);
    }
    return errorResponse(res, 'Analysis failed. Please try again.', 'ANALYSIS_ERROR', err.message, 500);
  }
}
