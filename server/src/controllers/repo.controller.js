import { getRepoMetadata } from '../services/github.service.js';
import { parseRepoUrl } from '../utils/parseRepoUrl.js';
import { validateRepoUrl } from '../utils/validators.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function getRepo(req, res) {
  const { repoUrl } = req.query;

  const validationError = validateRepoUrl(repoUrl);
  if (validationError) {
    return errorResponse(res, validationError, 'VALIDATION_ERROR', null, 400);
  }

  try {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const metadata = await getRepoMetadata(owner, repo);
    return successResponse(res, metadata, 'Repository metadata fetched successfully');
  } catch (err) {
    const statusCode = err.message?.includes('not found') ? 404 : 502;
    return errorResponse(res, err.message, 'GITHUB_ERROR', err.message, statusCode);
  }
}
