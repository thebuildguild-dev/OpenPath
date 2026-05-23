/**
 * Send a standardised success JSON response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} message
 * @param {number} statusCode
 */
export function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

/**
 * Send a standardised error JSON response.
 * @param {import('express').Response} res
 * @param {string} message  Human-readable message
 * @param {string} code     Machine-readable error code
 * @param {string} details  Extra details (stack / validation info)
 * @param {number} statusCode
 */
export function errorResponse(res, message, code = 'ERROR', details = null, statusCode = 500) {
  const body = { success: false, message, error: { code } };
  if (details) body.error.details = details;
  return res.status(statusCode).json(body);
}
