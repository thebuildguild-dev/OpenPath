/**
 * Skill Match Agent
 * Matches contributor skills to issues and likely code areas.
 * Purely rule-based.
 */

const SKILL_KEYWORD_MAP = {
  react: ['react', 'jsx', 'component', 'hook', 'context', 'recoil', 'zustand', 'ui', 'frontend'],
  vue: ['vue', 'nuxt', 'vuex', 'pinia', 'composition api', 'sfc'],
  angular: ['angular', 'ng', 'directive', 'service', 'module', 'template'],
  javascript: ['javascript', 'js', 'es6', 'promise', 'async', 'await', 'function', 'logic'],
  typescript: ['typescript', 'ts', 'types', 'interface', 'generics', 'enum'],
  css: ['css', 'scss', 'sass', 'style', 'tailwind', 'responsive', 'layout', 'ui', 'design', 'mobile', 'navbar', 'button', 'modal', 'form'],
  html: ['html', 'markup', 'template', 'dom', 'semantic'],
  python: ['python', 'django', 'flask', 'fastapi', 'pytest', 'pip', 'pyproject'],
  nodejs: ['node', 'nodejs', 'express', 'npm', 'backend', 'server', 'api'],
  backend: ['api', 'endpoint', 'server', 'database', 'query', 'backend', 'route'],
  testing: ['test', 'spec', 'jest', 'vitest', 'cypress', 'playwright', 'e2e', 'unit'],
  docs: ['docs', 'documentation', 'readme', 'wiki', 'comment', 'typo', 'spelling', 'grammar'],
  devops: ['docker', 'kubernetes', 'k8s', 'ci', 'cd', 'github actions', 'deploy', 'pipeline'],
  go: ['go', 'golang', 'goroutine', 'gopher'],
  rust: ['rust', 'cargo', 'crate', 'ownership'],
  java: ['java', 'spring', 'maven', 'gradle', 'jvm'],
  php: ['php', 'laravel', 'symfony', 'composer'],
  ruby: ['ruby', 'rails', 'rake', 'gem'],
  graphql: ['graphql', 'apollo', 'resolver', 'schema', 'mutation', 'query'],
  ui: ['ui', 'ux', 'design', 'interface', 'visual', 'component', 'layout', 'style'],
  accessibility: ['a11y', 'accessibility', 'aria', 'wcag', 'screen reader', 'keyboard'],
};

// Goal-to-preferred-skills mapping
const GOAL_SKILL_MAP = {
  'first-pr': ['docs', 'css', 'testing', 'ui'],
  'learn-codebase': ['javascript', 'typescript', 'react', 'nodejs'],
  'improve-skills': ['testing', 'backend', 'graphql'],
  'fix-bug': ['javascript', 'typescript', 'python', 'nodejs'],
  'add-feature': ['react', 'vue', 'backend', 'nodejs'],
};

function textOf(issue) {
  return `${issue.title || ''} ${issue.body || ''} ${(issue.labels || []).join(' ')}`.toLowerCase();
}

function countMatches(text, keywords) {
  return keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
}

function computeSkillMatch(issue, contributor) {
  const skills = (contributor.skills || []).map((s) => s.toLowerCase().trim());
  const pct = (contributor.preferredContributionType || '').toLowerCase();
  const goalSkills = GOAL_SKILL_MAP[contributor.goal] || [];
  const text = textOf(issue);

  let matches = 0;
  let total = 0;
  const matchedSkills = [];
  const missingSkills = [];

  // Check contributor's explicit skills
  for (const skill of skills) {
    const keywords = SKILL_KEYWORD_MAP[skill] || [skill];
    total += keywords.length;
    const cnt = countMatches(text, keywords);
    matches += cnt;
    if (cnt > 0) matchedSkills.push(skill);
    else missingSkills.push(skill);
  }

  // Bonus from preferred contribution type
  if (pct && SKILL_KEYWORD_MAP[pct]) {
    const pctKeywords = SKILL_KEYWORD_MAP[pct];
    total += pctKeywords.length;
    matches += countMatches(text, pctKeywords);
  }

  // Bonus from goal alignment
  for (const goalSkill of goalSkills) {
    const keywords = SKILL_KEYWORD_MAP[goalSkill] || [goalSkill];
    total += keywords.length * 0.3; // lower weight
    matches += countMatches(text, keywords) * 0.3;
  }

  const rawScore = total > 0 ? (matches / total) * 200 : 50;
  const skillMatch = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Build match reason
  let matchReason = '';
  if (matchedSkills.length > 0) {
    matchReason = `Issue content aligns with your ${matchedSkills.join(', ')} skills.`;
  } else if (pct) {
    matchReason = `Issue relates to ${pct} work which matches your preferred contribution type.`;
  } else {
    matchReason = 'No strong skill match found, but issue may still be workable.';
  }

  return { skillMatch, matchedSkills, missingSkills: missingSkills.slice(0, 3), matchReason };
}

/**
 * Run the Skill Match Agent.
 */
export function run({ contributor, issues, difficultyResults = [] }) {
  if (!Array.isArray(issues) || issues.length === 0) return [];

  const difficultyMap = {};
  for (const d of difficultyResults) {
    difficultyMap[d.number] = d;
  }

  return issues.map((issue) => {
    const { skillMatch, matchedSkills, missingSkills, matchReason } = computeSkillMatch(issue, contributor);

    return {
      number: issue.number,
      skillMatch,
      matchedSkills,
      missingSkills,
      matchReason,
      difficulty: difficultyMap[issue.number]?.difficulty || 'unknown',
      riskLevel: difficultyMap[issue.number]?.riskLevel || 'unknown',
    };
  });
}
