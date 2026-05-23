/**
 * Agents Controller
 * Individual agent endpoints for debugging, testing, and direct invocation.
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
import { successResponse, errorResponse } from '../utils/response.js';

import * as repoScoutAgent from '../services/agents/repoScout.agent.js';
import * as architectureMapperAgent from '../services/agents/architectureMapper.agent.js';
import * as issueMinerAgent from '../services/agents/issueMiner.agent.js';
import * as setupInspectorAgent from '../services/agents/setupInspector.agent.js';
import * as codeRiskMapperAgent from '../services/agents/codeRiskMapper.agent.js';
import * as pathPlannerAgent from '../services/agents/pathPlanner.agent.js';
import { scoreIssues } from '../services/scoring/issueScoring.service.js';

//  Helper 

async function fetchBaseRepoData(repoUrl) {
  const { owner, repo } = parseRepoUrl(repoUrl);
  const [repoMeta, topLevelContents, languages] = await Promise.all([
    getRepoMetadata(owner, repo),
    getTopLevelContents(owner, repo),
    getRepoLanguages(owner, repo),
  ]);
  const fileNames = topLevelContents.map((f) => f.name.toLowerCase());
  const hasPackageJson = fileNames.includes('package.json');
  const [readme, packageJsonRaw] = await Promise.all([
    getReadme(owner, repo),
    hasPackageJson ? getFileIfExists(owner, repo, 'package.json') : Promise.resolve(null),
  ]);
  let packageJson = null;
  if (packageJsonRaw) {
    try { packageJson = JSON.parse(packageJsonRaw); } catch { /* ignore */ }
  }
  return { owner, repo, repoMeta, topLevelContents, languages, readme, packageJson };
}

//  POST /api/agents/repo-scout 

export async function runRepoScout(req, res) {
  const { repoUrl } = req.body;
  if (!repoUrl) return errorResponse(res, 'repoUrl is required', 'VALIDATION_ERROR', null, 400);
  try {
    const { repoMeta, topLevelContents, languages, readme, packageJson } = await fetchBaseRepoData(repoUrl);
    const result = await repoScoutAgent.run({ repoMetadata: repoMeta, readme, languages, topLevelContents, packageJson });
    return successResponse(res, result, 'Repo Scout completed');
  } catch (err) {
    return errorResponse(res, err.message, 'AGENT_ERROR', err.message, 500);
  }
}

//  POST /api/agents/architecture 

export async function runArchitectureMapper(req, res) {
  const { repoUrl } = req.body;
  if (!repoUrl) return errorResponse(res, 'repoUrl is required', 'VALIDATION_ERROR', null, 400);
  try {
    const { topLevelContents, readme, packageJson } = await fetchBaseRepoData(repoUrl);
    const result = await architectureMapperAgent.run({ topLevelContents, packageJson, readme, detectedStack: [] });
    return successResponse(res, result, 'Architecture Mapper completed');
  } catch (err) {
    return errorResponse(res, err.message, 'AGENT_ERROR', err.message, 500);
  }
}

//  POST /api/agents/issues 

export async function runIssueMiner(req, res) {
  const { repoUrl, limit = 20 } = req.body;
  if (!repoUrl) return errorResponse(res, 'repoUrl is required', 'VALIDATION_ERROR', null, 400);
  try {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const rawIssues = await getRepoIssues(owner, repo, { state: 'open', limit });
    const result = issueMinerAgent.run({ issues: rawIssues });
    return successResponse(res, result, `Issue Miner completed — ${result.length} issues enriched`);
  } catch (err) {
    return errorResponse(res, err.message, 'AGENT_ERROR', err.message, 500);
  }
}

//  POST /api/agents/setup 

export async function runSetupInspector(req, res) {
  const { repoUrl } = req.body;
  if (!repoUrl) return errorResponse(res, 'repoUrl is required', 'VALIDATION_ERROR', null, 400);
  try {
    const { topLevelContents, readme, packageJson } = await fetchBaseRepoData(repoUrl);
    const fileNames = topLevelContents.map((f) => f.name.toLowerCase());
    const result = setupInspectorAgent.run({
      readme,
      packageJson,
      envExampleExists: fileNames.includes('.env.example') || fileNames.includes('.env.sample'),
      contributingExists: fileNames.some((n) => n.startsWith('contributing')),
      topLevelFiles: topLevelContents,
    });
    return successResponse(res, result, 'Setup Inspector completed');
  } catch (err) {
    return errorResponse(res, err.message, 'AGENT_ERROR', err.message, 500);
  }
}

//  POST /api/agents/risk 

export async function runRiskMapper(req, res) {
  const { repoUrl } = req.body;
  if (!repoUrl) return errorResponse(res, 'repoUrl is required', 'VALIDATION_ERROR', null, 400);
  try {
    const { topLevelContents } = await fetchBaseRepoData(repoUrl);
    const result = codeRiskMapperAgent.run({ architecture: {}, issues: [], topLevelContents });
    return successResponse(res, result, 'Code Risk Mapper completed');
  } catch (err) {
    return errorResponse(res, err.message, 'AGENT_ERROR', err.message, 500);
  }
}

//  POST /api/agents/path 

export async function runPathPlanner(req, res) {
  const { repoUrl, contributor } = req.body;
  if (!repoUrl) return errorResponse(res, 'repoUrl is required', 'VALIDATION_ERROR', null, 400);
  if (!contributor) return errorResponse(res, 'contributor is required', 'VALIDATION_ERROR', null, 400);
  try {
    const { owner, repo, repoMeta, topLevelContents, languages, readme, packageJson } = await fetchBaseRepoData(repoUrl);
    const rawIssues = await getRepoIssues(owner, repo, { state: 'open', limit: 20 });
    const scoredIssues = scoreIssues(rawIssues, contributor);
    const [repoScout, architecture] = await Promise.all([
      repoScoutAgent.run({ repoMetadata: repoMeta, readme, languages, topLevelContents, packageJson }),
      architectureMapperAgent.run({ topLevelContents, packageJson, readme, detectedStack: [] }),
    ]);
    const result = await pathPlannerAgent.run({ repoScout, architecture, setupAnalysis: null, scoredIssues, contributor });
    return successResponse(res, result, 'Path Planner completed');
  } catch (err) {
    return errorResponse(res, err.message, 'AGENT_ERROR', err.message, 500);
  }
}
