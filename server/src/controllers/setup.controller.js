import { analyzeSetup } from '../services/setupAnalyzer.service.js';
import { validateRepoUrl } from '../utils/validators.js';
import { successResponse, errorResponse } from '../utils/response.js';

export function analyzeSetupHandler(req, res) {
  const { repoUrl, files = {} } = req.body;

  const validationError = validateRepoUrl(repoUrl);
  if (validationError) {
    return errorResponse(res, validationError, 'VALIDATION_ERROR', null, 400);
  }

  try {
    const result = analyzeSetup({
      readme: files.readme || null,
      packageJson: files.packageJson || null,
      envExampleExists: Boolean(files.envExampleExists),
      contributingExists: Boolean(files.contributingExists),
      topLevelFiles: files.topLevelFiles || [],
    });
    return successResponse(res, result, 'Setup analysis complete');
  } catch (err) {
    return errorResponse(res, 'Setup analysis failed', 'ANALYSIS_ERROR', err.message, 500);
  }
}
