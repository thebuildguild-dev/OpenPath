const GITHUB_URL_RE = /github\.com[/:]([^/]+)\/([^/\s]+)/;

export function validateRepoUrl(repoUrl) {
  if (!repoUrl) return 'repoUrl is required';
  if (typeof repoUrl !== 'string') return 'repoUrl must be a string';
  if (!GITHUB_URL_RE.test(repoUrl) && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repoUrl.trim())) {
    return 'repoUrl must be a valid GitHub repository URL (e.g. https://github.com/owner/repo)';
  }
  return null;
}

export function validateContributor(contributor) {
  if (!contributor || typeof contributor !== 'object') return 'contributor object is required';
  if (!contributor.level) return 'contributor.level is required';
  const validLevels = ['beginner', 'intermediate', 'advanced'];
  if (!validLevels.includes(contributor.level)) {
    return `contributor.level must be one of: ${validLevels.join(', ')}`;
  }
  if (!Array.isArray(contributor.skills)) return 'contributor.skills must be an array';
  return null;
}

export function validateIssuesArray(issues) {
  if (!Array.isArray(issues)) return 'issues must be an array';
  return null;
}

export function validateScoreBody(body) {
  const repoErr = validateRepoUrl(body.repoUrl);
  if (repoErr) return repoErr;

  const contribErr = validateContributor(body.contributor);
  if (contribErr) return contribErr;

  return validateIssuesArray(body.issues);
}

export function validateAnalyzeBody(body) {
  const repoErr = validateRepoUrl(body.repoUrl);
  if (repoErr) return repoErr;

  return validateContributor(body.contributor);
}
