import { getRepoIssues } from '../services/github.service.js';
import { scoreIssues } from '../services/scoring.service.js';
import { parseRepoUrl } from '../utils/parseRepoUrl.js';
import { validateRepoUrl, validateScoreBody } from '../utils/validators.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function getIssues(req, res) {
  const { repoUrl, state = 'open', limit = 20, labels = '', sort = 'updated', direction = 'desc' } = req.query;

  const validationError = validateRepoUrl(repoUrl);
  if (validationError) {
    return errorResponse(res, validationError, 'VALIDATION_ERROR', null, 400);
  }

  try {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const issues = await getRepoIssues(owner, repo, { state, limit, labels, sort, direction });
    return successResponse(res, { count: issues.length, issues }, 'Issues fetched successfully');
  } catch (err) {
    const statusCode = err.message?.includes('not found') ? 404 : 502;
    return errorResponse(res, err.message, 'GITHUB_ERROR', err.message, statusCode);
  }
}

export function scoreIssuesHandler(req, res) {
  const { repoUrl, contributor, issues } = req.body;

  const validationError = validateScoreBody({ repoUrl, contributor, issues });
  if (validationError) {
    return errorResponse(res, validationError, 'VALIDATION_ERROR', null, 400);
  }

  try {
    const scored = scoreIssues(issues, contributor);
    return successResponse(res, { count: scored.length, issues: scored }, 'Issues scored successfully');
  } catch (err) {
    return errorResponse(res, 'Scoring failed', 'SCORING_ERROR', err.message, 500);
  }
}
