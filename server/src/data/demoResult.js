/**
 * Static demo result — returned by GET /api/demo-result.
 * Represents a fully analysed repository for frontend development & demo purposes.
 */
const demoResult = {
  repo: {
    owner: 'facebook',
    name: 'react',
    fullName: 'facebook/react',
    url: 'https://github.com/facebook/react',
    description: 'The library for web and native user interfaces.',
    stars: 220000,
    forks: 45000,
    watchers: 6700,
    openIssues: 850,
    defaultBranch: 'main',
    primaryLanguage: 'JavaScript',
    topics: ['javascript', 'frontend', 'ui', 'library', 'react'],
    license: 'MIT License',
    createdAt: '2013-05-24T16:15:54Z',
    updatedAt: '2024-01-15T10:20:00Z',
  },

  repoSummary: {
    totalFilesScanned: 5,
    issuesFetched: 20,
    issuesFiltered: 18,
    topLanguages: { JavaScript: 280000, TypeScript: 12000, HTML: 4000 },
    hasContributing: true,
    hasEnvExample: false,
    readmeFound: true,
  },

  setupAnalysis: {
    difficulty: 'medium',
    score: 35,
    packageManager: 'yarn',
    detectedStack: ['React', 'Jest', 'Webpack', 'Babel'],
    commands: {
      install: 'yarn install',
      dev: 'yarn dev',
      build: 'yarn build',
      test: 'yarn test',
    },
    blockers: [
      {
        type: 'warning',
        message: 'No .env.example found. Some environment variables may be undocumented.',
      },
    ],
    missingDocs: [],
    recommendations: [
      'Add a .env.example file to document required environment variables',
      'The CONTRIBUTING.md provides good setup guidance — read it first',
    ],
  },

  recommendedIssues: [
    {
      id: 1001,
      number: 27461,
      title: 'Fix typo in error message for invalid hook usage',
      body: 'The error message "Hooks can only be called inside of the body of a function component." has a minor grammatical issue. It should say "inside the body" not "inside of the body".\n\nSteps to reproduce:\n1. Call a hook outside a component\n2. Observe the error message\n\nExpected: grammatically correct message\nActual: "inside of the body"',
      url: 'https://github.com/facebook/react/issues/27461',
      state: 'open',
      labels: ['good first issue', 'Status: Unreviewed'],
      assignees: [],
      comments: 2,
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-12T14:30:00Z',
      scores: {
        finalScore: 82,
        skillMatch: 75,
        beginnerFriendliness: 90,
        clarity: 85,
        risk: 10,
        staleness: 5,
        confidence: 80,
      },
      difficulty: 'beginner',
      riskLevel: 'low',
      likelyFiles: [
        { path: 'packages/react/src/ReactHooks.js', reason: 'Hook implementation and error messages' },
        { path: 'packages/react/src/__tests__/', reason: 'Existing tests to verify the change' },
      ],
    },
    {
      id: 1002,
      number: 27445,
      title: 'Add missing aria-label to DevTools toolbar buttons',
      body: 'The React DevTools profiler toolbar buttons are missing aria-label attributes, making them inaccessible to screen reader users.\n\nAffected buttons:\n- Record button\n- Clear button\n- Load profile button\n\nThis is a straightforward accessibility fix in the DevTools package.',
      url: 'https://github.com/facebook/react/issues/27445',
      state: 'open',
      labels: ['good first issue', 'Component: Developer Tools', 'Type: Bug'],
      assignees: [],
      comments: 4,
      createdAt: '2024-01-05T11:00:00Z',
      updatedAt: '2024-01-14T08:20:00Z',
      scores: {
        finalScore: 78,
        skillMatch: 80,
        beginnerFriendliness: 85,
        clarity: 90,
        risk: 12,
        staleness: 3,
        confidence: 75,
      },
      difficulty: 'beginner',
      riskLevel: 'low',
      likelyFiles: [
        { path: 'packages/react-devtools-shared/src/', reason: 'DevTools UI components' },
        { path: 'packages/react-devtools-shared/src/devtools/views/Profiler/', reason: 'Profiler toolbar components' },
      ],
    },
    {
      id: 1003,
      number: 27389,
      title: 'Update outdated link in CONTRIBUTING.md',
      body: 'The link to the "How to Contribute" document in CONTRIBUTING.md points to an old URL that now returns a 404. It should link to the new location in the React documentation website.',
      url: 'https://github.com/facebook/react/issues/27389',
      state: 'open',
      labels: ['good first issue', 'Type: Documentation'],
      assignees: [],
      comments: 1,
      createdAt: '2023-12-20T09:00:00Z',
      updatedAt: '2024-01-08T16:00:00Z',
      scores: {
        finalScore: 72,
        skillMatch: 65,
        beginnerFriendliness: 95,
        clarity: 95,
        risk: 5,
        staleness: 15,
        confidence: 70,
      },
      difficulty: 'beginner',
      riskLevel: 'low',
      likelyFiles: [
        { path: 'CONTRIBUTING.md', reason: 'The file that needs the link update' },
        { path: 'README.md', reason: 'Check for similar outdated links' },
      ],
    },
  ],

  bestIssue: {
    number: 27461,
    title: 'Fix typo in error message for invalid hook usage',
    url: 'https://github.com/facebook/react/issues/27461',
    scores: {
      finalScore: 82,
      skillMatch: 75,
      beginnerFriendliness: 90,
      clarity: 85,
      risk: 10,
      staleness: 5,
      confidence: 80,
    },
    riskLevel: 'low',
    difficulty: 'beginner',
  },

  overallGuidance: {
    whyThisIssue:
      'Issue #27461 is an ideal first contribution — it is a low-risk text fix, clearly scoped, has a good first issue label, and requires no deep architecture knowledge. You will touch real production code and gain confidence in the contribution workflow.',
    likelyFiles: [
      { path: 'packages/react/src/ReactHooks.js', reason: 'Source of the error message' },
      { path: 'packages/react/src/__tests__/', reason: 'Tests to run and possibly update' },
    ],
    riskAssessment: {
      level: 'low',
      reason: 'This is a documentation/text change in an error message. It carries no risk of breaking functionality.',
      filesToAvoid: ['packages/react-reconciler/', 'packages/react-dom/'],
    },
    patchStrategy: [
      'Fork facebook/react on GitHub',
      'Clone your fork: git clone https://github.com/YOUR_USERNAME/react.git',
      'Install dependencies: yarn install',
      'Create a branch: git checkout -b fix/typo-hook-error-message',
      'Open packages/react/src/ReactHooks.js and find the error message string',
      'Change "inside of the body" to "inside the body"',
      'Run tests: yarn test packages/react/src/__tests__/ReactHooks-test.js',
      'Commit: git commit -m "fix: remove unnecessary preposition in hook error message"',
      'Push and open a PR referencing issue #27461',
    ],
    testingChecklist: [
      '[ ] Run: yarn test',
      '[ ] Verify the updated error message appears when hook rule is violated',
      '[ ] All existing hook tests pass',
      '[ ] No typos introduced in your change',
      '[ ] PR description references #27461',
    ],
    filesToAvoid: [
      'packages/react-reconciler/',
      'packages/react-dom/src/server/',
      'packages/scheduler/',
    ],
    prDraft: {
      prTitle: 'fix: remove unnecessary preposition in invalid hook usage error message',
      prDescription:
        '## Summary\n\nFixes #27461\n\nRemoves the unnecessary "of" from the error message shown when a Hook is called outside a function component body.\n\n**Before:** "Hooks can only be called inside of the body of a function component."\n**After:** "Hooks can only be called inside the body of a function component."\n\n## Changes Made\n\n- Updated error message string in `packages/react/src/ReactHooks.js`\n\n## Testing\n\n- [ ] `yarn test` passes\n- [ ] Error message verified manually\n- [ ] No regressions in hook-related tests',
      maintainerComment:
        'Thanks for the fix! This is exactly the kind of polish that keeps the codebase clean. Please make sure to add a test that checks the exact error message string so it does not regress.',
    },
    maintainerComment:
      'Hi! I am excited to contribute to React. I have opened this PR to fix the minor grammatical issue in the hook error message as described in #27461. All tests pass. Please let me know if any changes are needed — happy to iterate!',
    fromFallback: false,
  },
};

export default demoResult;
