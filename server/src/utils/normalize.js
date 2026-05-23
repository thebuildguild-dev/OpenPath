/**
 * Normalize helpers used across the codebase.
 */

/**
 * Clamp a number between min and max.
 */
export function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

/**
 * Normalise a raw score from [minRaw, maxRaw] into [0, 100].
 */
export function normalise(val, minRaw, maxRaw) {
  if (maxRaw === minRaw) return 50;
  return clamp(((val - minRaw) / (maxRaw - minRaw)) * 100);
}

/**
 * Deduplicate an array by a key extractor.
 */
export function dedupBy(arr, keyFn) {
  const seen = new Set();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
