import type { AnalysisResponse } from '../types';

export const MOCK_ANALYSIS_RESULT: AnalysisResponse = {
  success: true,
  message: 'Repository analyzed successfully',
  data: {
    repo: {
      owner: 'vercel',
      name: 'next.js',
      fullName: 'vercel/next.js',
      url: 'https://github.com/vercel/next.js',
      description: 'The React Framework – created and maintained by @vercel.',
      stars: 127400,
      forks: 26900,
      openIssues: 3241,
      defaultBranch: 'canary',
      primaryLanguage: 'TypeScript',
      languages: ['TypeScript', 'JavaScript', 'CSS', 'Rust', 'MDX'],
      topics: ['react', 'nextjs', 'vercel', 'framework', 'ssr', 'static-site'],
    },
    repoSummary: {
      projectType: 'React Framework (Monorepo)',
      summary:
        'Next.js is a production-grade React framework maintained by Vercel. It supports App Router, Pages Router, SSR, SSG, and edge runtimes. The codebase is a pnpm monorepo with packages for the core framework, CLI, and bundler.',
      importantFolders: ['packages/next/src', 'test/e2e', 'examples', 'docs'],
      setupFiles: ['package.json', 'contributing.md', 'README.md'],
    },
    setupAnalysis: {
      difficulty: 'medium',
      score: 58,
      commands: {
        install: 'pnpm install',
        dev: 'pnpm dev',
        test: 'pnpm test',
        build: 'pnpm build',
      },
      blockers: [
        'Monorepo setup requires pnpm workspace familiarity',
        'Some packages require a Rust toolchain to compile',
        'No .env.example file found at root level',
      ],
      recommendations: [
        'Read CONTRIBUTING.md thoroughly before setting up',
        'Use pnpm (not npm or yarn) — the lockfile is pnpm-specific',
        'Install the Rust toolchain via rustup for native packages',
        'Run tests with pnpm test -p packages/next for the core package',
      ],
    },
    recommendedIssues: [
      {
        rank: 1,
        id: 7001,
        number: 72345,
        title: 'Fix missing aria-label on navigation links in App Router',
        url: 'https://github.com/vercel/next.js/issues/72345',
        state: 'open',
        labels: ['good first issue', 'accessibility', 'bug'],
        createdAt: '2026-01-10T10:00:00Z',
        updatedAt: '2026-01-18T08:30:00Z',
        comments: 4,
        scores: {
          finalScore: 92,
          skillMatch: 88,
          beginnerFriendliness: 95,
          clarity: 91,
          risk: 12,
          confidence: 87,
        },
        difficulty: 'beginner',
        riskLevel: 'low',
        whyRecommended:
          'Well-scoped accessibility bug in the client-facing navigation layer. Requires only JSX attribute additions — no core logic changes. The test infrastructure is already in place.',
        likelyFiles: [
          {
            path: 'packages/next/src/client/components/nav-links.tsx',
            reason: 'Navigation component that renders the anchor elements missing aria-labels',
          },
          {
            path: 'test/e2e/app-dir/navigation/navigation.test.ts',
            reason: 'Existing test file to extend with an accessibility assertion',
          },
        ],
        safeAreas: ['packages/next/src/client/components', 'test/e2e'],
        riskyAreas: ['packages/next/src/server', 'packages/next/src/build', 'packages/next/src/lib'],
        patchStrategy: [
          'Clone repo and run pnpm install to set up the workspace',
          'Find the navigation component at packages/next/src/client/components/nav-links.tsx',
          'Locate the <a> elements rendered by the component',
          'Add an aria-label prop derived from the link text or an explicit prop',
          'Extend the existing e2e test to assert the aria-label is present in the DOM',
          'Run pnpm test -p packages/next to confirm no regressions',
        ],
        testingChecklist: [
          'Run pnpm test -p packages/next locally',
          'Open a browser, inspect the nav links for aria-label attributes',
          'Run the specific e2e suite: pnpm test test/e2e/app-dir/navigation',
          'Test with a screen reader or browser accessibility tree',
          'Verify CI passes on the PR',
        ],
        prDraft: {
          title: 'fix(a11y): add missing aria-label on App Router navigation links',
          description:
            '## Summary\n\nAdds missing `aria-label` attributes to navigation links in the App Router to improve screen reader support.\n\n## Problem\n\nNavigation links rendered by `nav-links.tsx` lacked `aria-label` attributes, making them inaccessible to screen reader users.\n\n## Changes\n\n- Added `aria-label` prop to `<a>` elements in `nav-links.tsx`\n- Extended the e2e navigation test to assert the attribute is present\n\n## Testing\n\n- All existing tests pass locally\n- Verified the `aria-label` is present in the accessibility tree via DevTools\n- Manually tested with VoiceOver on macOS',
        },
        maintainerComment:
          "Hi, I'd like to work on this issue. I've reproduced the missing aria-label locally and plan to add the attribute to the affected nav-links component along with an e2e test. The change should be minimal — only the navigation component and its test need updating.",
      },
      {
        rank: 2,
        id: 7002,
        number: 68921,
        title: 'Add JSDoc comments to useRouter hook public API',
        url: 'https://github.com/vercel/next.js/issues/68921',
        state: 'open',
        labels: ['good first issue', 'documentation', 'dx'],
        createdAt: '2025-11-05T14:20:00Z',
        updatedAt: '2026-01-15T11:00:00Z',
        comments: 6,
        scores: {
          finalScore: 84,
          skillMatch: 79,
          beginnerFriendliness: 90,
          clarity: 88,
          risk: 8,
          confidence: 81,
        },
        difficulty: 'beginner',
        riskLevel: 'low',
        whyRecommended:
          'Documentation-only change on a public API. No runtime behavior changes. Ideal for getting familiar with the codebase and JSDoc conventions used by Next.js.',
        likelyFiles: [
          {
            path: 'packages/next/src/client/components/navigation.ts',
            reason: 'Contains the useRouter hook implementation that needs JSDoc annotations',
          },
          {
            path: 'packages/next/src/shared/lib/router/router.ts',
            reason: 'Type definitions that should align with the added JSDoc comments',
          },
        ],
        safeAreas: ['packages/next/src/client/components', 'packages/next/src/shared'],
        riskyAreas: ['packages/next/src/server', 'packages/next/src/build'],
        patchStrategy: [
          'Find the useRouter hook in packages/next/src/client/components/navigation.ts',
          'Look at how existing hooks in the same file use JSDoc comments',
          'Add @param, @returns, and @example JSDoc blocks to each exported method',
          'Follow the TypeScript conventions already in the file',
          'Run TypeScript compilation to ensure no type errors introduced',
        ],
        testingChecklist: [
          'Run pnpm tsc --noEmit in the packages/next directory',
          'Check that hover-over intellisense in VS Code shows the new docs',
          'Review that JSDoc matches the actual types in the type definitions',
        ],
        prDraft: {
          title: 'docs: add JSDoc comments to useRouter hook public API',
          description:
            '## Summary\n\nAdds comprehensive JSDoc comments to the `useRouter` hook API to improve developer experience and IDE intellisense.\n\n## Changes\n\n- Added `@param`, `@returns`, and `@example` JSDoc blocks to all exported methods of `useRouter`\n- Comments follow the existing JSDoc conventions in the codebase\n\n## Testing\n\n- TypeScript compiles cleanly with no new errors\n- VS Code intellisense correctly surfaces the new documentation',
        },
        maintainerComment:
          "Hello! I'd love to work on this. I've looked at the existing JSDoc patterns in the file and feel confident I can add consistent documentation to all the exported methods. The change is purely additive — no runtime behavior changes.",
      },
      {
        rank: 3,
        id: 7003,
        number: 71234,
        title: 'Fix typo in error message for invalid dynamic route segments',
        url: 'https://github.com/vercel/next.js/issues/71234',
        state: 'open',
        labels: ['good first issue', 'bug', 'error-messages'],
        createdAt: '2025-12-20T09:15:00Z',
        updatedAt: '2026-01-12T16:45:00Z',
        comments: 2,
        scores: {
          finalScore: 77,
          skillMatch: 74,
          beginnerFriendliness: 88,
          clarity: 82,
          risk: 10,
          confidence: 75,
        },
        difficulty: 'beginner',
        riskLevel: 'low',
        whyRecommended:
          'Single-file change fixing a typo in an error string. Perfect for understanding the error-handling layer and getting your first commit merged.',
        likelyFiles: [
          {
            path: 'packages/next/src/lib/router/utils/route-regex.ts',
            reason: 'Contains the error messages for invalid dynamic route segments',
          },
        ],
        safeAreas: ['packages/next/src/lib/router/utils'],
        riskyAreas: ['packages/next/src/server', 'packages/next/src/build'],
        patchStrategy: [
          'Search for the error message string in the codebase using grep',
          'Locate the file containing the incorrect error message',
          'Correct the typo',
          'Run existing router unit tests to confirm nothing broke',
        ],
        testingChecklist: [
          'Run pnpm test -p packages/next --testPathPattern route-regex',
          'Verify the corrected message appears when triggering the error locally',
        ],
        prDraft: {
          title: 'fix: correct typo in dynamic route segment error message',
          description:
            '## Summary\n\nFixes a typo in the error message shown when an invalid dynamic route segment is encountered.\n\n## Changes\n\n- Corrected spelling of "recieved" → "received" in route-regex.ts\n\n## Testing\n\n- Existing route-regex unit tests pass',
        },
        maintainerComment:
          "Hi! I'd like to fix this typo. It's a one-line change in route-regex.ts and all existing tests continue to pass. I'll open the PR shortly.",
      },
    ],
    bestIssue: {
      number: 72345,
      title: 'Fix missing aria-label on navigation links in App Router',
      url: 'https://github.com/vercel/next.js/issues/72345',
      finalScore: 92,
    },
    overallGuidance: {
      suggestedFirstStep:
        'Set up the repository locally using pnpm install, read CONTRIBUTING.md, then reproduce issue #72345 in the browser devtools accessibility tree.',
      filesToAvoid: [
        'packages/next/src/server',
        'packages/next/src/build',
        'packages/next/src/lib/webpack',
        'packages/next/src/lib/turbopack',
        'packages/next/src/compiled',
      ],
      contributionAdvice: [
        'Keep the first PR under 50 lines changed — maintainers review small PRs faster',
        'Never touch the build infrastructure or webpack/turbopack configs',
        'Always add or update a test alongside your code change',
        'Reference the issue number in your PR description',
        'Be explicit about testing steps in the PR body',
      ],
    },
  },
};
