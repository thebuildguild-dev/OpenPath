/**
 * Keyword-based likely file / folder predictor.
 * Given an issue, returns ordered predictions with confidence scores.
 */

const PREDICTION_RULES = [
  {
    keywords: ['docs', 'documentation', 'typo', 'readme', 'spelling', 'grammar', 'wiki', 'changelog', 'comment'],
    paths: [
      { path: 'README.md', reason: 'Docs/typo issue — primary documentation file' },
      { path: 'docs/', reason: 'Documentation directory' },
      { path: 'CONTRIBUTING.md', reason: 'Contribution guidelines may need updating' },
    ],
    baseConfidence: 82,
  },
  {
    keywords: [
      'ui', 'css', 'style', 'responsive', 'layout', 'button', 'modal', 'form',
      'design', 'icon', 'component', 'react', 'vue', 'angular', 'frontend',
      'page', 'view', 'screen', 'theme', 'tailwind', 'scss', 'sass', 'navbar',
      'header', 'footer', 'sidebar', 'card', 'table', 'list', 'grid',
    ],
    paths: [
      { path: 'src/components/', reason: 'Issue is related to UI components' },
      { path: 'components/', reason: 'Component directory for UI changes' },
      { path: 'src/pages/', reason: 'Page-level UI files may be involved' },
      { path: 'pages/', reason: 'Page components' },
      { path: 'styles/', reason: 'Global styles or CSS modules' },
      { path: 'src/styles/', reason: 'Scoped styles' },
      { path: 'app/', reason: 'App-level routing/layout files' },
    ],
    baseConfidence: 75,
  },
  {
    keywords: [
      'api', 'endpoint', 'server', 'request', 'response', 'http', 'rest',
      'graphql', 'webhook', 'fetch', 'axios', 'route', 'client',
    ],
    paths: [
      { path: 'src/api/', reason: 'Issue is related to API layer' },
      { path: 'api/', reason: 'API definition files' },
      { path: 'routes/', reason: 'Route definitions' },
      { path: 'controllers/', reason: 'Controller handlers' },
      { path: 'src/services/', reason: 'Service layer communicating with APIs' },
    ],
    baseConfidence: 68,
  },
  {
    keywords: [
      'auth', 'login', 'logout', 'oauth', 'token', 'password', 'session',
      'signup', 'register', 'credential', 'jwt', 'sso',
    ],
    paths: [
      { path: 'auth/', reason: 'Authentication-related logic' },
      { path: 'src/auth/', reason: 'Auth module' },
      { path: 'middleware/', reason: 'Auth middleware' },
      { path: 'api/auth/', reason: 'Auth API endpoints' },
    ],
    baseConfidence: 72,
  },
  {
    keywords: [
      'database', 'db', 'schema', 'model', 'migration', 'prisma', 'sql',
      'mongo', 'query', 'seed', 'orm',
    ],
    paths: [
      { path: 'prisma/', reason: 'Prisma schema and migrations' },
      { path: 'db/', reason: 'Database files and migrations' },
      { path: 'models/', reason: 'Data model definitions' },
      { path: 'migrations/', reason: 'Database migration files' },
    ],
    baseConfidence: 70,
  },
  {
    keywords: [
      'test', 'spec', 'jest', 'vitest', 'cypress', 'playwright', 'e2e',
      'unit', 'integration', 'coverage', 'assertion',
    ],
    paths: [
      { path: 'tests/', reason: 'Test files' },
      { path: '__tests__/', reason: 'Jest test directory' },
      { path: 'spec/', reason: 'Spec files' },
      { path: 'e2e/', reason: 'End-to-end test directory' },
      { path: 'cypress/', reason: 'Cypress tests' },
    ],
    baseConfidence: 78,
  },
  {
    keywords: [
      'config', 'configuration', 'env', 'environment', 'setting', 'option',
      'eslint', 'prettier', 'tsconfig', 'vite.config', 'babel',
    ],
    paths: [
      { path: '.env.example', reason: 'Environment variable template' },
      { path: 'vite.config.js', reason: 'Build configuration' },
      { path: 'tsconfig.json', reason: 'TypeScript configuration' },
      { path: '.eslintrc', reason: 'ESLint configuration' },
    ],
    baseConfidence: 60,
  },
];

/**
 * Predict likely files/folders for a single issue.
 * @param {object} issue
 * @returns {Array<{ path, confidence, reason }>}
 */
export function predictLikelyFiles(issue) {
  const text = `${issue.title || ''} ${issue.body || ''} ${(issue.labels || []).join(' ')}`.toLowerCase();

  const scored = [];

  for (const rule of PREDICTION_RULES) {
    const matchCount = rule.keywords.filter((kw) => text.includes(kw)).length;
    if (matchCount === 0) continue;

    const boost = Math.min(matchCount * 4, 18); // up to +18 confidence from multiple matches

    for (let i = 0; i < rule.paths.length; i++) {
      const { path, reason } = rule.paths[i];
      const confidence = Math.round(rule.baseConfidence + boost - i * 5); // top path gets highest confidence
      if (confidence > 30) {
        scored.push({ path, confidence: Math.min(confidence, 95), reason });
      }
    }
  }

  // Deduplicate by path (keep highest confidence)
  const byPath = new Map();
  for (const item of scored) {
    if (!byPath.has(item.path) || byPath.get(item.path).confidence < item.confidence) {
      byPath.set(item.path, item);
    }
  }

  return [...byPath.values()]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
}

/**
 * Predict likely files for multiple issues at once.
 * @param {Array} issues
 * @returns {Record<number, Array>}  keyed by issue.number
 */
export function predictForIssues(issues) {
  const result = {};
  for (const issue of issues) {
    result[issue.number] = predictLikelyFiles(issue);
  }
  return result;
}
