/**
 * Confidence scorer — how confident are we that this issue is a good pick?
 * Returns 0-100; higher = more confident the issue is well-defined and workable.
 */

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

/**
 * Score prediction confidence for a single issue.
 * @param {object} issue
 * @returns {number} 0-100
 */
export function scoreConfidence(issue) {
  const body = issue.body || '';
  let score = 50; // neutral baseline

  // Body quality
  if (body.length > 500) score += 15;
  else if (body.length > 200) score += 10;
  else if (body.length > 50) score += 5;
  else if (body.length === 0) score -= 20;

  // Structured signals in body
  if (/steps to reproduce|reproduction|how to reproduce/i.test(body)) score += 10;
  if (/expected behavior|expected result/i.test(body)) score += 5;
  if (/actual behavior|actual result/i.test(body)) score += 5;
  if (/```/.test(body)) score += 5; // code block
  if (/screenshot|image|gif/i.test(body)) score += 5;

  // Label quality
  const labels = (issue.labels || []).map((l) => l.toLowerCase());
  if (labels.length > 0) score += 8;
  if (labels.some((l) => l.includes('good first issue') || l.includes('help wanted'))) score += 7;

  // Activity signals
  const comments = issue.comments || 0;
  if (comments > 0 && comments <= 5) score += 5; // some activity = positive
  if (comments > 20) score -= 10; // too many comments = unresolved complexity

  // Assigned = already taken
  if ((issue.assignees || []).length > 0) score -= 15;

  return clamp(score);
}
