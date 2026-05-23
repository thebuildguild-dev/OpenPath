/**
 * Detects setup commands and package manager from package.json and lock files.
 */

/**
 * Detect which package manager is being used.
 * @param {object|null} packageJson
 * @param {Array}       topLevelFiles  [{ name }]
 * @returns {string}  'npm' | 'yarn' | 'pnpm' | 'bun'
 */
export function detectPackageManager(packageJson, topLevelFiles = []) {
  const names = topLevelFiles.map((f) => f.name.toLowerCase());

  if (names.includes('bun.lockb') || names.includes('bun.lock')) return 'bun';
  if (names.includes('pnpm-lock.yaml')) return 'pnpm';
  if (names.includes('yarn.lock')) return 'yarn';

  // Check packageManager field in package.json
  const pm = packageJson?.packageManager;
  if (typeof pm === 'string') {
    if (pm.startsWith('yarn')) return 'yarn';
    if (pm.startsWith('pnpm')) return 'pnpm';
    if (pm.startsWith('bun')) return 'bun';
  }

  return 'npm';
}

/**
 * Infer commonly used commands from package.json scripts and detected pm.
 * @param {object|null} packageJson
 * @param {string}      pm  Package manager
 * @returns {{ install, dev, build, test }}
 */
export function inferCommands(packageJson, pm = 'npm') {
  const scripts = packageJson?.scripts || {};
  const runner = pm === 'npm' ? 'npm run' : pm;

  const find = (candidates) => {
    for (const c of candidates) {
      if (scripts[c]) return `${runner} ${c}`;
    }
    return null;
  };

  return {
    install: pm === 'npm' ? 'npm install' : pm === 'yarn' ? 'yarn' : `${pm} install`,
    dev: find(['dev', 'start', 'serve', 'develop', 'preview']),
    build: find(['build', 'compile', 'dist', 'bundle']),
    test: find(['test', 'test:unit', 'test:run', 'spec', 'test:ci']),
  };
}
