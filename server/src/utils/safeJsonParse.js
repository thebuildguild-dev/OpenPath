/**
 * Safely parse a JSON string, returning fallback on any error.
 * Also strips ```json ... ``` markdown fences before parsing.
 */
export function safeJsonParse(text, fallback = null) {
  if (!text || typeof text !== 'string') return fallback;

  try {
    // Strip markdown fences
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    return JSON.parse(cleaned);
  } catch {
    // Try to extract first JSON object or array
    const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}
