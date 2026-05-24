/**
 * Sanitize external text before embedding into LLM prompts.
 * - Remove markdown code fences
 * - Strip control characters
 * - Trim to max length
 */
export function sanitizeForPrompt(text, maxLength = 500) {
  if (!text || typeof text !== 'string') return '';
  // Remove fenced code blocks
  let s = text.replace(/```[\s\S]*?```/g, '[CODE_SNIPPED]');
  // Remove inline backticks
  s = s.replace(/`+/g, '');
  // Remove non-printable/control characters
  s = s.replace(/[\x00-\x1F\x7F]/g, '');
  // Collapse multiple newlines
  s = s.replace(/\n{3,}/g, '\n\n');
  s = s.trim();
  if (s.length > maxLength) s = s.slice(0, maxLength) + '\n...[truncated]';
  return s;
}
