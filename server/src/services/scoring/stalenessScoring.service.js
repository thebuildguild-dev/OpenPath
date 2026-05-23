/**
 * Rule-based staleness scorer for issues.
 * Returns a 0-100 score where higher = more stale / harder to pick up.
 */

function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

/**
 * Score issue staleness.
 * @param {object} issue
 * @returns {number} 0-100
 */
export function scoreStaleness(issue) {
  const days = daysSince(issue.updatedAt || issue.createdAt);
  const text = `${issue.title || ''} ${(issue.labels || []).join(' ')}`.toLowerCase();

  let score = 0;
  if (days > 365) score = 85;
  else if (days > 180) score = 65;
  else if (days > 90) score = 45;
  else if (days > 30) score = 20;
  else score = 5;

  if (text.includes('stale') || text.includes('outdated') || text.includes('wontfix')) score += 20;
  if ((issue.assignees || []).length > 0) score += 15;

  return clamp(score);
}
