/** Simple API key middleware for protecting expensive endpoints. */
export function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key || req.headers['authorization'];
  const expected = process.env.API_KEY || process.env.OPENPATH_API_KEY;
  if (!expected) {
    // If no API key configured, deny by default (fail-safe)
    return res.status(401).json({ success: false, message: 'Unauthorized', error: { code: 'NO_API_KEY_CONFIGURED' } });
  }

  // Accept header style "Bearer <key>" as well
  const normalized = (key || '').toString().replace(/^Bearer\s+/i, '').trim();
  if (!normalized || normalized !== expected) {
    return res.status(401).json({ success: false, message: 'Unauthorized', error: { code: 'INVALID_API_KEY' } });
  }

  return next();
}
