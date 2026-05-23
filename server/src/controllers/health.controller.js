import { successResponse } from '../utils/response.js';

export function getHealth(_req, res) {
  return successResponse(res, {
    status: 'ok',
    service: 'openpath-backend',
    version: '1.0.0',
  }, 'OpenPath backend is running');
}
