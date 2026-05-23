/**
 * Repo Scout Agent
 * Understands what the repository is, what kind of project it is,
 * and where a beginner can safely explore.
 *
 * Layer 1: Rule-based detection (always runs)
 * Layer 2: Groq enrichment (if available)
 */

import { generateJsonSafe } from '../ai.service.js';
import { detectStack } from '../predictors/stackDetector.service.js';
import { buildRepoScoutPrompt } from '../../prompts/repoScout.prompt.js';

//  Rule-based project type detection 

const PROJECT_TYPE_RULES = [
  { check: (pkg) => !!pkg?.dependencies?.next || !!pkg?.devDependencies?.next, type: 'Next.js web app' },
  { check: (pkg) => !!pkg?.dependencies?.['@remix-run/react'], type: 'Remix web app' },
  { check: (pkg) => !!pkg?.dependencies?.astro || !!pkg?.devDependencies?.astro, type: 'Astro site' },
  { check: (pkg) => !!pkg?.dependencies?.react || !!pkg?.devDependencies?.react, type: 'React web app' },
  { check: (pkg) => !!pkg?.dependencies?.vue || !!pkg?.devDependencies?.vue, type: 'Vue.js web app' },
  { check: (pkg) => !!pkg?.dependencies?.svelte || !!pkg?.devDependencies?.svelte, type: 'Svelte web app' },
  { check: (pkg) => !!pkg?.dependencies?.['@angular/core'], type: 'Angular web app' },
  { check: (pkg) => !!pkg?.dependencies?.express, type: 'Express.js API server' },
  { check: (pkg) => !!pkg?.dependencies?.fastify, type: 'Fastify API server' },
  { check: (pkg) => !!pkg?.dependencies?.['@nestjs/core'], type: 'NestJS API server' },
  { check: (_pkg, files) => files.includes('Cargo.toml'), type: 'Rust project' },
  { check: (_pkg, files) => files.includes('go.mod'), type: 'Go project' },
  { check: (_pkg, files) => files.includes('requirements.txt') || files.includes('pyproject.toml'), type: 'Python project' },
  { check: (_pkg, files) => files.includes('pom.xml') || files.includes('build.gradle'), type: 'Java project' },
  { check: (_pkg, files) => files.includes('Gemfile'), type: 'Ruby project' },
  { check: (_pkg, files) => files.includes('composer.json'), type: 'PHP project' },
];

const SAFE_FOLDER_KEYWORDS = ['docs', 'examples', 'styles', 'components', 'tests', '__tests__', 'spec', 'stories', 'storybook', 'fixtures', 'static', 'public', 'assets'];
const RISKY_FOLDER_KEYWORDS = ['auth', 'security', 'payment', 'billing', 'stripe', 'database', 'db', 'migrations', 'prisma', 'core', 'middleware', 'infra', 'infrastructure', 'deploy', 'ci'];

function detectProjectType(packageJson, fileNames) {
  for (const rule of PROJECT_TYPE_RULES) {
    if (rule.check(packageJson, fileNames)) return rule.type;
  }
  if (packageJson) return 'Node.js project';
  return 'Unknown project';
}

function detectBeginnerFriendlyAreas(topLevelContents) {
  return topLevelContents
    .filter((f) => SAFE_FOLDER_KEYWORDS.some((kw) => f.name.toLowerCase().includes(kw)))
    .map((f) => f.name);
}

function detectComplexAreas(topLevelContents) {
  return topLevelContents
    .filter((f) => RISKY_FOLDER_KEYWORDS.some((kw) => f.name.toLowerCase().includes(kw)))
    .map((f) => f.name);
}

function detectImportantFiles(topLevelContents) {
  const important = ['README.md', 'package.json', 'CONTRIBUTING.md', '.env.example', 'docker-compose.yml', 'Makefile', 'Dockerfile'];
  return topLevelContents
    .filter((f) => f.type === 'file' && important.includes(f.name))
    .map((f) => f.name);
}

function detectImportantFolders(topLevelContents, projectType) {
  const isReactLike = /react|next|vue|svelte|angular|astro/i.test(projectType);
  const isBackend = /express|fastify|nest|api/i.test(projectType);

  const candidates = isReactLike
    ? ['src', 'components', 'pages', 'app', 'styles', 'hooks', 'utils', 'lib']
    : isBackend
    ? ['src', 'routes', 'controllers', 'services', 'middleware', 'models', 'utils']
    : ['src', 'lib', 'pkg', 'cmd', 'internal'];

  return topLevelContents
    .filter((f) => f.type === 'dir' && candidates.includes(f.name.toLowerCase()))
    .map((f) => f.name);
}

//  Agent 

/**
 * Run the Repo Scout Agent.
 */
export async function run({ repoMetadata, readme, languages, topLevelContents, packageJson }) {
  const fileNames = topLevelContents.map((f) => f.name);
  const detectedStack = detectStack(packageJson, topLevelContents);
  const projectType = detectProjectType(packageJson, fileNames);
  const beginnerFriendlyAreas = detectBeginnerFriendlyAreas(topLevelContents);
  const complexAreas = detectComplexAreas(topLevelContents);
  const importantFiles = detectImportantFiles(topLevelContents);
  const importantFolders = detectImportantFolders(topLevelContents, projectType);

  const ruleBasedResult = {
    projectType,
    detectedStack,
    summary: `${projectType} — ${repoMetadata?.description || 'No description provided.'}`,
    mainPurpose: repoMetadata?.description || 'Purpose not described in repository metadata.',
    importantFiles,
    importantFolders,
    beginnerFriendlyAreas,
    complexAreas,
    confidence: 70,
  };

  // Try AI enrichment
  const prompt = buildRepoScoutPrompt({ repoMetadata, readme, languages, topLevelContents, ruleBasedResult });
  const { data, fromFallback } = await generateJsonSafe(prompt, ruleBasedResult, 20000, {
    systemPrompt: 'You are OpenPath, an AI open-source mentor. Return ONLY valid JSON, no markdown.',
  });

  if (fromFallback) {
    return { ...ruleBasedResult, _source: 'rule-based' };
  }

  return {
    projectType: data.projectType || ruleBasedResult.projectType,
    detectedStack,
    summary: data.summary || ruleBasedResult.summary,
    mainPurpose: data.mainPurpose || ruleBasedResult.mainPurpose,
    importantFiles: data.importantFiles?.length ? data.importantFiles : importantFiles,
    importantFolders: data.importantFolders?.length ? data.importantFolders : importantFolders,
    beginnerFriendlyAreas: data.beginnerFriendlyAreas?.length ? data.beginnerFriendlyAreas : beginnerFriendlyAreas,
    complexAreas: data.complexAreas?.length ? data.complexAreas : complexAreas,
    confidence: data.confidence ?? 80,
    _source: 'ai',
  };
}
