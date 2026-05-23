import { generateRoadmap } from '../services/roadmap.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export async function generateRoadmapHandler(req, res) {
  const { repo, contributor, issues, setupAnalysis } = req.body;

  if (!contributor || !contributor.level) {
    return errorResponse(res, 'contributor.level is required', 'VALIDATION_ERROR', null, 400);
  }
  if (!Array.isArray(issues)) {
    return errorResponse(res, 'issues must be an array', 'VALIDATION_ERROR', null, 400);
  }

  try {
    const roadmap = await generateRoadmap(repo, contributor, issues, setupAnalysis);
    return successResponse(res, roadmap, 'Roadmap generated successfully');
  } catch (err) {
    return errorResponse(res, 'Roadmap generation failed', 'ROADMAP_ERROR', err.message, 500);
  }
}
