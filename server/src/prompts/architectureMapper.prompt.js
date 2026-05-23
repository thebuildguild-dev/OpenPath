/**
 * Prompt builder for the Architecture Mapper Agent.
 */

export function buildArchitectureMapperPrompt({ topLevelContents, packageJson, readme, detectedStack }) {
  const items = topLevelContents.map((f) => `${f.type === 'dir' ? '[dir]' : '[file]'} ${f.name}`).join('\n');
  const scripts = packageJson?.scripts ? JSON.stringify(packageJson.scripts, null, 2) : 'none';
  const readmeSnippet = (readme || '').slice(0, 400);

  return `You are OpenPath's Architecture Mapper agent. Map this repository's structure into frontend, backend, test, config, and risky areas.

Repository top-level structure:
${items || 'No contents found'}

package.json scripts:
${scripts}

Detected stack: ${(detectedStack || []).join(', ') || 'unknown'}

README excerpt:
"""
${readmeSnippet || 'No README.'}
"""

Return ONLY valid JSON (no markdown, no extra text) matching this exact shape:

{
  "frontendFolders": ["<folder>"],
  "backendFolders": ["<folder>"],
  "testFolders": ["<folder>"],
  "docsFolders": ["<folder>"],
  "configFiles": ["<file>"],
  "architectureSummary": "<2-3 sentence summary of the project structure>",
  "riskMap": [
    { "area": "<folder/area name>", "risk": "<low|medium|high>", "reason": "<short reason>" }
  ]
}

Risk classification rules:
- high: auth, security, payment, billing, database, db, migrations, prisma, schema, core, middleware
- medium: api, server, routes, controllers, services, state, store
- low: docs, README, examples, styles, components, tests`;
}
