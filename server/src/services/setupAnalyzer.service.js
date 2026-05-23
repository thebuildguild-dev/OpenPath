/**
 * Analyzes repository setup difficulty from available files.
 */

const SETUP_KEYWORDS = /install|setup|getting started|quick start|prerequisite|requirement|how to run|local development/i;
const ENV_KEYWORDS = /env|environment|variable|\.env/i;

function detectPackageManager(packageJson, topLevelFiles) {
  if (!topLevelFiles) return 'npm';
  const names = topLevelFiles.map((f) => f.name.toLowerCase());
  if (names.includes('bun.lockb') || names.includes('bun.lock')) return 'bun';
  if (names.includes('pnpm-lock.yaml')) return 'pnpm';
  if (names.includes('yarn.lock')) return 'yarn';
  return 'npm';
}

function extractScripts(packageJson) {
  if (!packageJson || typeof packageJson !== 'object') return {};
  return packageJson.scripts || {};
}

function inferCommands(scripts, pm) {
  const runner = pm === 'npm' ? 'npm run' : pm === 'yarn' ? 'yarn' : pm;

  const devCandidates = ['dev', 'start', 'serve', 'develop'];
  const buildCandidates = ['build', 'compile', 'dist'];
  const testCandidates = ['test', 'test:unit', 'test:run', 'spec'];

  const find = (candidates) => {
    for (const c of candidates) {
      if (scripts[c]) return `${runner} ${c}`;
    }
    return null;
  };

  return {
    install: pm === 'npm' ? 'npm install' : pm === 'yarn' ? 'yarn' : `${pm} install`,
    dev: find(devCandidates),
    build: find(buildCandidates),
    test: find(testCandidates),
  };
}

function analyzeBlockers(opts) {
  const { scripts, envExampleExists, contributingExists, readme, topLevelFiles } = opts;
  const blockers = [];
  const missingDocs = [];

  // No test script
  const hasTest =
    scripts &&
    Object.keys(scripts).some((k) => k.toLowerCase().startsWith('test'));
  if (!hasTest) {
    blockers.push({
      type: 'warning',
      message: 'No test script found in package.json. Testing approach is unclear.',
    });
  }

  // No .env.example
  if (!envExampleExists) {
    blockers.push({
      type: 'blocker',
      message:
        'No .env.example found. Environment variables required for local setup are undocumented.',
    });
  }

  // No CONTRIBUTING.md
  if (!contributingExists) {
    missingDocs.push('CONTRIBUTING.md — contribution guidelines are missing');
  }

  // Weak README
  if (!readme) {
    missingDocs.push('README.md — not found or empty');
  } else if (!SETUP_KEYWORDS.test(readme)) {
    missingDocs.push(
      'README.md — missing setup/installation instructions (no "install", "setup", or "getting started" section found)'
    );
  }

  if (readme && !ENV_KEYWORDS.test(readme) && !envExampleExists) {
    missingDocs.push('README.md — no environment variable documentation found');
  }

  return { blockers, missingDocs };
}

function detectStack(packageJson, topLevelFiles) {
  if (!packageJson) return [];
  const deps = {
    ...((packageJson.dependencies || {})),
    ...((packageJson.devDependencies || {})),
  };
  const depNames = Object.keys(deps).map((d) => d.toLowerCase());
  const stack = [];

  const checks = [
    { key: 'react', label: 'React' },
    { key: 'vue', label: 'Vue' },
    { key: 'angular', label: 'Angular' },
    { key: 'svelte', label: 'Svelte' },
    { key: 'next', label: 'Next.js' },
    { key: 'nuxt', label: 'Nuxt' },
    { key: 'express', label: 'Express' },
    { key: 'fastify', label: 'Fastify' },
    { key: 'nestjs', label: 'NestJS' },
    { key: 'prisma', label: 'Prisma' },
    { key: 'mongoose', label: 'MongoDB/Mongoose' },
    { key: 'typeorm', label: 'TypeORM' },
    { key: 'sequelize', label: 'Sequelize' },
    { key: 'tailwindcss', label: 'Tailwind CSS' },
    { key: 'typescript', label: 'TypeScript' },
    { key: 'vite', label: 'Vite' },
    { key: 'webpack', label: 'Webpack' },
    { key: 'jest', label: 'Jest' },
    { key: 'vitest', label: 'Vitest' },
    { key: 'graphql', label: 'GraphQL' },
    { key: 'trpc', label: 'tRPC' },
    { key: 'drizzle-orm', label: 'Drizzle ORM' },
  ];

  for (const { key, label } of checks) {
    if (depNames.some((d) => d.includes(key))) stack.push(label);
  }

  // Check for Docker / configs from top-level files
  if (topLevelFiles) {
    const fileNames = topLevelFiles.map((f) => f.name.toLowerCase());
    if (fileNames.includes('dockerfile') || fileNames.includes('docker-compose.yml')) {
      stack.push('Docker');
    }
    if (fileNames.includes('go.mod')) stack.push('Go');
    if (fileNames.includes('cargo.toml')) stack.push('Rust');
    if (fileNames.includes('requirements.txt') || fileNames.includes('pyproject.toml')) {
      stack.push('Python');
    }
  }

  return [...new Set(stack)];
}

function calculateDifficultyScore(opts) {
  const { blockers, missingDocs, scripts, packageJson, topLevelFiles } = opts;
  let score = 0;

  // Blockers add difficulty
  score += blockers.filter((b) => b.type === 'blocker').length * 20;
  score += blockers.filter((b) => b.type === 'warning').length * 10;

  // Missing docs
  score += missingDocs.length * 10;

  // Complex stack
  const stack = detectStack(packageJson, topLevelFiles);
  if (stack.length > 5) score += 10;

  // No scripts = harder
  if (!scripts || Object.keys(scripts).length === 0) score += 20;

  return Math.min(score, 100);
}

function scoreToLevel(score) {
  if (score <= 30) return 'low';
  if (score <= 60) return 'medium';
  return 'high';
}

/**
 * Analyze repository setup.
 * @param {object} opts
 * @param {string}  opts.readme          - Raw README text (or null)
 * @param {object}  opts.packageJson     - Parsed package.json (or null)
 * @param {boolean} opts.envExampleExists
 * @param {boolean} opts.contributingExists
 * @param {Array}   opts.topLevelFiles   - Array of { name, type, path }
 * @returns {object} setup analysis result
 */
export function analyzeSetup(opts = {}) {
  const {
    readme = null,
    packageJson = null,
    envExampleExists = false,
    contributingExists = false,
    topLevelFiles = [],
  } = opts;

  const pm = detectPackageManager(packageJson, topLevelFiles);
  const scripts = extractScripts(packageJson);
  const commands = inferCommands(scripts, pm);
  const detectedStack = detectStack(packageJson, topLevelFiles);
  const { blockers, missingDocs } = analyzeBlockers({
    scripts,
    envExampleExists,
    contributingExists,
    readme,
    topLevelFiles,
  });

  const score = calculateDifficultyScore({ blockers, missingDocs, scripts, packageJson, topLevelFiles });
  const difficulty = scoreToLevel(score);

  const recommendations = [];
  if (!envExampleExists) recommendations.push('Add a .env.example file to document required environment variables');
  if (!contributingExists) recommendations.push('Add a CONTRIBUTING.md to guide new contributors');
  if (commands.test === null) recommendations.push('Add a test script to package.json for contributors to verify changes');
  if (difficulty === 'high') {
    recommendations.push('Consider simplifying the local dev setup with a one-command start (e.g. docker-compose)');
  }

  return {
    difficulty,
    score,
    packageManager: pm,
    detectedStack,
    commands,
    blockers,
    missingDocs,
    recommendations,
  };
}
