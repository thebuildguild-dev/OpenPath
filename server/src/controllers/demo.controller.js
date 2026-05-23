import demoResult from '../data/demoResult.js';
import { successResponse } from '../utils/response.js';

export function getDemoResult(_req, res) {
  return successResponse(res, demoResult, 'Demo result loaded successfully');
}
