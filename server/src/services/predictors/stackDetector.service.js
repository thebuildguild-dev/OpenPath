/**
 * Stack detector — infers technologies from package.json dependencies and file names.
 */

const STACK_RULES = [
  // Frontend frameworks
  { dep: 'react', label: 'React' },
  { dep: 'react-dom', label: 'React' },
  { dep: 'next', label: 'Next.js' },
  { dep: 'nuxt', label: 'Nuxt.js' },
  { dep: 'vue', label: 'Vue.js' },
  { dep: '@angular/core', label: 'Angular' },
  { dep: 'svelte', label: 'Svelte' },
  { dep: 'solid-js', label: 'SolidJS' },
  { dep: 'astro', label: 'Astro' },
  { dep: 'remix', label: 'Remix' },
  { dep: '@remix-run/react', label: 'Remix' },

  // Build tools
  { dep: 'vite', label: 'Vite' },
  { dep: 'webpack', label: 'Webpack' },
  { dep: 'esbuild', label: 'esbuild' },
  { dep: 'rollup', label: 'Rollup' },
  { dep: 'parcel', label: 'Parcel' },
  { dep: 'turbo', label: 'Turborepo' },

  // CSS / styling
  { dep: 'tailwindcss', label: 'Tailwind CSS' },
  { dep: '@mui/material', label: 'Material UI' },
  { dep: 'antd', label: 'Ant Design' },
  { dep: 'chakra-ui', label: 'Chakra UI' },
  { dep: '@radix-ui/react-dialog', label: 'Radix UI' },
  { dep: 'shadcn-ui', label: 'shadcn/ui' },

  // Backend
  { dep: 'express', label: 'Express.js' },
  { dep: 'fastify', label: 'Fastify' },
  { dep: 'hapi', label: 'Hapi' },
  { dep: 'koa', label: 'Koa' },
  { dep: 'nestjs', label: 'NestJS' },
  { dep: '@nestjs/core', label: 'NestJS' },
  { dep: 'hono', label: 'Hono' },

  // ORM / DB
  { dep: 'prisma', label: 'Prisma' },
  { dep: '@prisma/client', label: 'Prisma' },
  { dep: 'mongoose', label: 'MongoDB' },
  { dep: 'sequelize', label: 'Sequelize' },
  { dep: 'typeorm', label: 'TypeORM' },
  { dep: 'drizzle-orm', label: 'Drizzle ORM' },
  { dep: 'pg', label: 'PostgreSQL' },
  { dep: 'mysql2', label: 'MySQL' },
  { dep: 'better-sqlite3', label: 'SQLite' },
  { dep: 'redis', label: 'Redis' },
  { dep: 'ioredis', label: 'Redis' },

  // Auth
  { dep: 'next-auth', label: 'NextAuth.js' },
  { dep: 'passport', label: 'Passport.js' },
  { dep: 'jsonwebtoken', label: 'JWT' },
  { dep: 'jose', label: 'JWT' },
  { dep: 'lucia', label: 'Lucia Auth' },

  // Testing
  { dep: 'jest', label: 'Jest' },
  { dep: 'vitest', label: 'Vitest' },
  { dep: 'cypress', label: 'Cypress' },
  { dep: '@playwright/test', label: 'Playwright' },
  { dep: 'mocha', label: 'Mocha' },

  // TypeScript / language
  { dep: 'typescript', label: 'TypeScript' },
  { dep: 'tsx', label: 'TypeScript' },
];

const FILE_SIGNALS = {
  'Cargo.toml': 'Rust',
  'go.mod': 'Go',
  'requirements.txt': 'Python',
  'pyproject.toml': 'Python',
  'setup.py': 'Python',
  'pom.xml': 'Java (Maven)',
  'build.gradle': 'Java (Gradle)',
  'Gemfile': 'Ruby',
  'composer.json': 'PHP',
  'mix.exs': 'Elixir',
  'build.sbt': 'Scala',
};

/**
 * Detect technology stack from package.json and top-level files.
 * @param {object|null} packageJson  Parsed package.json object
 * @param {Array}       topLevelFiles  [{ name, type }]
 * @returns {string[]} Deduplicated list of detected technologies
 */
export function detectStack(packageJson, topLevelFiles = []) {
  const detected = new Set();

  // File-based signals (non-JS projects)
  for (const file of topLevelFiles) {
    const signal = FILE_SIGNALS[file.name];
    if (signal) detected.add(signal);
  }

  if (!packageJson) return [...detected];

  // Add Node.js baseline if package.json present
  detected.add('Node.js');

  const allDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
    ...(packageJson.peerDependencies || {}),
  };

  for (const { dep, label } of STACK_RULES) {
    if (allDeps[dep] !== undefined) {
      detected.add(label);
    }
  }

  return [...detected];
}
