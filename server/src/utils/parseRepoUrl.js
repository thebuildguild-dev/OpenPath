/**
 * Parse a GitHub repository URL into { owner, repo }.
 * Accepts:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   https://github.com/owner/repo/tree/main
 *   git@github.com:owner/repo.git
 */
export function parseRepoUrl(repoUrl) {
  if (!repoUrl || typeof repoUrl !== 'string') {
    throw new Error('repoUrl must be a non-empty string');
  }

  const cleaned = repoUrl.trim().replace(/\/$/, '');

  // SSH format: git@github.com:owner/repo.git
  const sshMatch = cleaned.match(/^git@github\.com:([^/]+)\/([^/.]+?)(?:\.git)?$/);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  // HTTPS format: https://github.com/owner/repo[.git][/...]
  const httpsMatch = cleaned.match(/^https?:\/\/github\.com\/([^/]+)\/([^/.]+?)(?:\.git)?(\/.*)?$/);
  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2] };
  }

  // Shorthand: owner/repo
  const shortMatch = cleaned.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }

  throw new Error(`Cannot parse GitHub repository URL: "${repoUrl}"`);
}
