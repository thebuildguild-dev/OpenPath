import { generatePrDraft } from '../services/prDraft.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function generatePrDraftHandler(req, res) {
  const { repo, issue, patchPlan, testingChecklist } = req.body;

  if (!issue) {
    return errorResponse(res, 'issue object is required', 'VALIDATION_ERROR', null, 400);
  }

  try {
    const draft = await generatePrDraft(repo, issue, patchPlan || [], testingChecklist || []);
    return successResponse(res, draft, 'PR draft generated successfully');
  } catch (err) {
    return errorResponse(res, 'PR draft generation failed', 'PR_DRAFT_ERROR', err.message, 500);
  }
}
