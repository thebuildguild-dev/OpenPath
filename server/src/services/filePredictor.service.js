/**
 * Keyword-based likely file/folder predictor.
 * Given issue text, returns an ordered array of { path, reason } predictions.
 */

const PREDICTION_RULES = [
  {
    keywords: ['docs', 'documentation', 'typo', 'readme', 'spelling', 'grammar', 'wiki', 'changelog'],
    paths: [
      { path: 'README.md', reason: 'Issue appears to be about documentation or typos' },
      { path: 'docs/', reason: 'Documentation files are typically stored here' },
      { path: 'CONTRIBUTING.md', reason: 'Contribution guidelines may need updating' },
    ],
  },
  {
    keywords: [
      'ui', 'css', 'style', 'responsive', 'layout', 'button', 'modal', 'form',
      'design', 'icon', 'component', 'react', 'vue', 'angular', 'frontend',
      'page', 'view', 'screen', 'theme', 'tailwind', 'scss', 'sass',
    ],
    paths: [
      { path: 'src/components/', reason: 'Issue appears related to UI components' },
      { path: 'components/', reason: 'Component directory for UI changes' },
      { path: 'src/pages/', reason: 'Page-level UI files may be involved' },
      { path: 'pages/', reason: 'Page components' },
      { path: 'styles/', reason: 'Global styles or CSS modules' },
      { path: 'app/', reason: 'App-level routing/layout files' },
    ],
  },
  {
    keywords: [
      'api', 'endpoint', 'server', 'request', 'response', 'http', 'rest',
      'graphql', 'webhook', 'fetch', 'axios', 'client',
    ],
    paths: [
      { path: 'src/api/', reason: 'Issue is likely related to API layer' },
      { path: 'api/', reason: 'API definition files' },
      { path: 'routes/', reason: 'Route definitions may need changes' },
      { path: 'controllers/', reason: 'Controller logic for this endpoint' },
      { path: 'services/', reason: 'Service layer handling business logic' },
    ],
  },
  {
    keywords: [
      'auth', 'authentication', 'authorization', 'login', 'logout', 'token',
      'oauth', 'jwt', 'session', 'password', 'credential', 'permission', 'role',
    ],
    paths: [
      { path: 'auth/', reason: 'Authentication module' },
      { path: 'src/auth/', reason: 'Auth service or middleware' },
      { path: 'middleware/', reason: 'Auth middleware may be involved' },
      { path: 'api/auth/', reason: 'Auth API endpoints' },
    ],
  },
  {
    keywords: [
      'database', 'db', 'schema', 'model', 'migration', 'prisma', 'sql',
      'mongo', 'redis', 'orm', 'query', 'seed', 'table', 'column',
    ],
    paths: [
      { path: 'prisma/', reason: 'Prisma schema and migrations' },
      { path: 'db/', reason: 'Database configuration and migrations' },
      { path: 'models/', reason: 'Data models' },
      { path: 'migrations/', reason: 'Database migration files' },
      { path: 'src/models/', reason: 'Model definitions' },
    ],
  },
  {
    keywords: [
      'test', 'spec', 'jest', 'vitest', 'cypress', 'playwright', 'mocha',
      'unit test', 'integration test', 'e2e', 'coverage',
    ],
    paths: [
      { path: 'tests/', reason: 'Test files directory' },
      { path: '__tests__/', reason: 'Jest test directory' },
      { path: 'spec/', reason: 'Spec files' },
      { path: 'src/__tests__/', reason: 'Co-located test files' },
      { path: 'cypress/', reason: 'E2E tests' },
    ],
  },
  {
    keywords: [
      'config', 'configuration', 'env', 'environment', 'setting', 'option',
      'dotenv', '.env', 'variable',
    ],
    paths: [
      { path: '.env.example', reason: 'Environment variable template' },
      { path: 'config/', reason: 'Configuration files' },
      { path: 'src/config/', reason: 'App configuration module' },
    ],
  },
  {
    keywords: [
      'ci', 'cd', 'github actions', 'workflow', 'pipeline', 'docker',
      'dockerfile', 'kubernetes', 'deploy', 'build',
    ],
    paths: [
      { path: '.github/workflows/', reason: 'GitHub Actions CI/CD workflows' },
      { path: 'Dockerfile', reason: 'Docker container definition' },
      { path: '.github/', reason: 'GitHub configuration files' },
    ],
  },
];

/**
 * Predict likely files/folders based on issue text.
 * @param {object} issue
 * @returns {Array<{path: string, reason: string}>}
 */
export function predictLikelyFiles(issue) {
  const text = `${issue.title || ''} ${issue.body || ''} ${(issue.labels || []).join(' ')}`.toLowerCase();
  const seen = new Set();
  const results = [];

  for (const rule of PREDICTION_RULES) {
    const matched = rule.keywords.some((kw) => text.includes(kw));
    if (!matched) continue;

    for (const prediction of rule.paths) {
      if (!seen.has(prediction.path)) {
        seen.add(prediction.path);
        results.push(prediction);
      }
    }
  }

  // If nothing matched, return generic paths
  if (results.length === 0) {
    return [
      { path: 'src/', reason: 'General source code directory' },
      { path: 'README.md', reason: 'Start by reading the README for context' },
    ];
  }

  return results.slice(0, 6); // Top 6 predictions
}

/**
 * Predict files for multiple issues; returns { issueNumber -> predictions } map.
 */
export function predictForIssues(issues) {
  return issues.reduce((acc, issue) => {
    acc[issue.number] = predictLikelyFiles(issue);
    return acc;
  }, {});
}
