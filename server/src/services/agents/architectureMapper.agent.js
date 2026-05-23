/**
 * Architecture Mapper Agent
 * Maps the repository folder structure into frontend, backend, test, config, docs,
 * and risky areas. Layer 1 rule-based; Layer 2 Groq-enriched.
 */

import { generateJsonSafe } from '../ai.service.js';
import { buildArchitectureMapperPrompt } from '../../prompts/architectureMapper.prompt.js';

// ─── Rules ─────────────────────────────────────────────────────────────────

const FRONTEND_FOLDERS = ['src', 'components', 'pages', 'app', 'views', 'client', 'frontend', 'ui', 'styles', 'assets', 'static', 'public', 'stories'];
const BACKEND_FOLDERS = ['server', 'api', 'routes', 'controllers', 'services', 'handlers', 'middleware', 'backend', 'cmd', 'pkg', 'internal', 'lib'];
const TEST_FOLDERS = ['tests', 'test', '__tests__', 'spec', 'e2e', 'cypress', 'playwright'];
const DOCS_FOLDERS = ['docs', 'documentation', 'wiki', 'guides', 'examples'];
const CONFIG_FILES = ['.eslintrc', '.eslintrc.js', '.eslintrc.json', 'tsconfig.json', '.prettierrc', 'vite.config.js', 'vite.config.ts', 'webpack.config.js', 'babel.config.js', 'jest.config.js', 'vitest.config.js', '.babelrc', '.env.example', 'docker-compose.yml', 'Dockerfile', '.github'];

const HIGH_RISK_FOLDERS = ['auth', 'security', 'payment', 'billing', 'stripe', 'database', 'db', 'migrations', 'prisma', 'schema', 'core', 'middleware', 'seed'];
const MEDIUM_RISK_FOLDERS = ['api', 'server', 'routes', 'controllers', 'services', 'state', 'store', 'context', 'hooks'];
const LOW_RISK_FOLDERS = ['docs', 'readme', 'examples', 'styles', 'components', 'tests', '__tests__', 'spec', 'e2e', 'stories', 'fixtures', 'public', 'assets', 'static'];

function matchFolders(topLevelContents, candidates) {
  return topLevelContents
    .filter((f) => f.type === 'dir' && candidates.some((c) => f.name.toLowerCase().includes(c)))
    .map((f) => f.name);
}

function matchFiles(topLevelContents, candidates) {
  return topLevelContents
    .filter((f) => f.type === 'file' && candidates.some((c) => f.name.toLowerCase().includes(c)))
    .map((f) => f.name);
}

function buildRiskMap(topLevelContents) {
  const riskMap = [];

  for (const item of topLevelContents) {
    const name = item.name.toLowerCase();

    if (HIGH_RISK_FOLDERS.some((k) => name.includes(k))) {
      riskMap.push({
        area: item.name,
        risk: 'high',
        reason: `${item.name} is sensitive — authentication, database, or payment code should be changed with caution.`,
      });
    } else if (MEDIUM_RISK_FOLDERS.some((k) => name.includes(k))) {
      riskMap.push({
        area: item.name,
        risk: 'medium',
        reason: `${item.name} contains backend or state logic. Changes here can have broader impact.`,
      });
    } else if (LOW_RISK_FOLDERS.some((k) => name.includes(k))) {
      riskMap.push({
        area: item.name,
        risk: 'low',
        reason: `${item.name} is a safe area for first contributions — docs, styles, or tests.`,
      });
    }
  }

  return riskMap;
}

// ─── Agent ─────────────────────────────────────────────────────────────────

export async function run({ topLevelContents, packageJson, readme, detectedStack }) {
  const frontendFolders = matchFolders(topLevelContents, FRONTEND_FOLDERS);
  const backendFolders = matchFolders(topLevelContents, BACKEND_FOLDERS);
  const testFolders = matchFolders(topLevelContents, TEST_FOLDERS);
  const docsFolders = matchFolders(topLevelContents, DOCS_FOLDERS);
  const configFiles = matchFiles(topLevelContents, CONFIG_FILES);
  const riskMap = buildRiskMap(topLevelContents);

  const ruleBasedResult = {
    detectedStack: detectedStack || [],
    frontendFolders,
    backendFolders,
    testFolders,
    docsFolders,
    configFiles,
    architectureSummary: `The project contains ${topLevelContents.length} top-level items. ${frontendFolders.length > 0 ? `Frontend code lives in: ${frontendFolders.join(', ')}.` : ''} ${backendFolders.length > 0 ? `Backend logic is in: ${backendFolders.join(', ')}.` : ''}`,
    riskMap,
  };

  // Try AI enrichment for a better architectureSummary
  const prompt = buildArchitectureMapperPrompt({ topLevelContents, packageJson, readme, detectedStack });
  const { data, fromFallback } = await generateJsonSafe(prompt, ruleBasedResult, 20000, {
    systemPrompt: 'You are OpenPath, an AI open-source mentor. Return ONLY valid JSON, no markdown.',
  });

  if (fromFallback) return { ...ruleBasedResult, _source: 'rule-based' };

  return {
    detectedStack: detectedStack || [],
    frontendFolders: data.frontendFolders?.length ? data.frontendFolders : frontendFolders,
    backendFolders: data.backendFolders?.length ? data.backendFolders : backendFolders,
    testFolders: data.testFolders?.length ? data.testFolders : testFolders,
    docsFolders: data.docsFolders?.length ? data.docsFolders : docsFolders,
    configFiles: data.configFiles?.length ? data.configFiles : configFiles,
    architectureSummary: data.architectureSummary || ruleBasedResult.architectureSummary,
    riskMap: data.riskMap?.length ? data.riskMap : riskMap,
    _source: 'ai',
  };
}
