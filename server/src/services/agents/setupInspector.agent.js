/**
 * Setup Inspector Agent
 * Detects setup commands, difficulty, and blockers from package.json, README, and file presence.
 * Purely rule-based.
 */

import { detectPackageManager, inferCommands } from '../predictors/setupCommandDetector.service.js';
import { detectStack } from '../predictors/stackDetector.service.js';

const SETUP_SECTION_RE = /install|setup|getting.started|quick.start|prerequisite|requirement|how.to.run|local.dev/i;
const ENV_RE = /\.env|environment.variable/i;

function checkReadmeSetup(readme) {
  if (!readme) return false;
  return SETUP_SECTION_RE.test(readme);
}

function buildBlockers({ scripts, envExampleExists, contributingExists, readme, topLevelFiles, packageJson }) {
  const blockers = [];
  const warnings = [];
  const recommendations = [];

  // No .env.example
  if (!envExampleExists) {
    blockers.push('No .env.example file found — environment variables may be undocumented');
  }

  // No setup section in README
  if (!checkReadmeSetup(readme)) {
    warnings.push('README does not contain a clear "Getting Started" or setup section');
    recommendations.push('Ask maintainers for required environment variables and setup steps');
  }

  // No contributing file
  if (!contributingExists) {
    warnings.push('No CONTRIBUTING.md found — contribution guidelines may be missing');
  }

  // No test script
  const hasTest = scripts && Object.keys(scripts).some((k) => k.toLowerCase().startsWith('test'));
  if (!hasTest) {
    warnings.push('No test script found in package.json — testing approach unclear');
  }

  // Docker without Dockerfile context
  const hasPrismaDep = packageJson?.dependencies?.['@prisma/client'] || packageJson?.dependencies?.prisma;
  const hasDockerFile = topLevelFiles.some((f) => f.name === 'Dockerfile' || f.name === 'docker-compose.yml');
  if (hasPrismaDep && !topLevelFiles.some((f) => f.name === '.env.example')) {
    blockers.push('Prisma detected but no .env.example — database connection string may be needed');
  }

  if (blockers.length === 0 && warnings.length === 0) {
    recommendations.push('Setup looks clean — follow the README instructions to get started');
  } else {
    recommendations.push('Check for a .env.example or .env.sample before running the project');
    if (!checkReadmeSetup(readme)) {
      recommendations.push('Look for setup docs in the CONTRIBUTING.md or GitHub wiki if README is sparse');
    }
  }

  return { blockers, warnings, recommendations };
}

function scoreSetupDifficulty({ blockers, warnings, envExampleExists, hasDockerfile, packageJson }) {
  let score = 50;

  if (envExampleExists) score += 15;
  else score -= 10;

  const scripts = packageJson?.scripts || {};
  if (scripts.dev || scripts.start) score += 10;
  if (scripts.test) score += 5;
  if (scripts.build) score += 5;

  score -= blockers.length * 10;
  score -= warnings.length * 5;

  if (hasDockerfile) score -= 5; // Docker adds complexity for newcomers

  return Math.max(0, Math.min(100, score));
}

function classifyDifficulty(score) {
  if (score >= 70) return 'easy';
  if (score >= 45) return 'medium';
  return 'hard';
}

/**
 * Run the Setup Inspector Agent.
 */
export function run({ readme, packageJson, envExampleExists, contributingExists, topLevelFiles }) {
  const pm = detectPackageManager(packageJson, topLevelFiles);
  const commands = inferCommands(packageJson, pm);
  const detectedStack = detectStack(packageJson, topLevelFiles);
  const scripts = packageJson?.scripts || {};
  const hasDockerfile = topLevelFiles.some((f) => f.name === 'Dockerfile' || f.name === 'docker-compose.yml');

  const { blockers, warnings, recommendations } = buildBlockers({
    scripts,
    envExampleExists,
    contributingExists,
    readme,
    topLevelFiles,
    packageJson,
  });

  const score = scoreSetupDifficulty({ blockers, warnings, envExampleExists, hasDockerfile, packageJson });
  const difficulty = classifyDifficulty(score);

  return {
    difficulty,
    score,
    detectedStack,
    packageManager: pm,
    commands,
    blockers,
    warnings,
    recommendations,
    hasDockerfile,
    hasContributing: contributingExists,
    hasEnvExample: envExampleExists,
    _source: 'rule-based',
  };
}
