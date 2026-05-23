/**
 * Code Risk Mapper Agent
 * Identifies global safe/risky code areas and attaches per-issue risk hints.
 * Purely rule-based.
 */

const HIGH_RISK_PATTERNS = [
  { pattern: /auth/i, reason: 'Authentication and authorization — security-sensitive' },
  { pattern: /security/i, reason: 'Security-related code — high impact if broken' },
  { pattern: /payment|billing|stripe|checkout/i, reason: 'Payment processing — financial risk' },
  { pattern: /database|db$|migrations|prisma|schema|seed/i, reason: 'Database and migrations — data integrity risk' },
  { pattern: /core/i, reason: 'Core application logic — can break many things' },
  { pattern: /middleware/i, reason: 'Middleware — affects the entire request pipeline' },
  { pattern: /infra|deploy|ci|cd/i, reason: 'Infrastructure/deployment — can affect production' },
  { pattern: /crypt/i, reason: 'Cryptography — must not be modified without deep understanding' },
];

const MEDIUM_RISK_PATTERNS = [
  { pattern: /api|routes|controllers|handlers/i, reason: 'API layer — changes can break clients' },
  { pattern: /server|backend/i, reason: 'Server code — affects all requests' },
  { pattern: /state|store|context|redux|zustand/i, reason: 'State management — can cause subtle bugs' },
  { pattern: /services/i, reason: 'Business logic services — moderate complexity' },
];

const LOW_RISK_PATTERNS = [
  { pattern: /docs|documentation|readme|wiki|guide/i, reason: 'Documentation — safe for first contributions' },
  { pattern: /test|spec|__tests__|e2e|cypress|playwright/i, reason: 'Tests — great area for beginners' },
  { pattern: /style|css|scss|sass|theme|tailwind/i, reason: 'Styles — isolated and low-risk' },
  { pattern: /components|ui|views|pages|templates/i, reason: 'UI components — beginner-friendly' },
  { pattern: /examples|fixtures|mocks/i, reason: 'Examples — no production impact' },
  { pattern: /public|assets|static|images/i, reason: 'Static assets — no code risk' },
];

const ISSUE_RISK_KEYWORDS = {
  high: ['auth', 'security', 'payment', 'billing', 'database', 'sql', 'schema', 'prisma', 'migration', 'credential', 'token', 'secret', 'encrypt', 'stripe'],
  medium: ['api', 'endpoint', 'server', 'route', 'service', 'config', 'env', 'state', 'backend'],
  low: ['docs', 'readme', 'typo', 'css', 'style', 'ui', 'test', 'lint', 'icon', 'button', 'modal', 'component'],
};

function classifyArea(name) {
  for (const { pattern, reason } of HIGH_RISK_PATTERNS) {
    if (pattern.test(name)) return { risk: 'high', reason };
  }
  for (const { pattern, reason } of MEDIUM_RISK_PATTERNS) {
    if (pattern.test(name)) return { risk: 'medium', reason };
  }
  for (const { pattern, reason } of LOW_RISK_PATTERNS) {
    if (pattern.test(name)) return { risk: 'low', reason };
  }
  return null;
}

function buildGlobalRiskMap(topLevelContents) {
  const global = [];
  const safe = [];

  for (const item of topLevelContents) {
    const classified = classifyArea(item.name);
    if (!classified) continue;

    const entry = { area: item.name, risk: classified.risk, reason: classified.reason };
    if (classified.risk === 'high' || classified.risk === 'medium') {
      global.push(entry);
    } else {
      safe.push(entry);
    }
  }

  return { globalRiskAreas: global, safeAreas: safe };
}

function buildIssueRiskHints(issues) {
  const hints = {};

  for (const issue of issues) {
    const text = `${issue.title || ''} ${issue.body || ''} ${(issue.labels || []).join(' ')}`.toLowerCase();

    const riskKeywords = [];
    let riskLevel = 'medium';
    const avoidAreas = [];

    for (const kw of ISSUE_RISK_KEYWORDS.high) {
      if (text.includes(kw)) { riskKeywords.push(kw); riskLevel = 'high'; }
    }
    for (const kw of ISSUE_RISK_KEYWORDS.medium) {
      if (text.includes(kw) && riskLevel !== 'high') { riskKeywords.push(kw); riskLevel = 'medium'; }
    }
    for (const kw of ISSUE_RISK_KEYWORDS.low) {
      if (text.includes(kw) && riskLevel !== 'high' && riskLevel !== 'medium') { riskKeywords.push(kw); riskLevel = 'low'; }
    }

    if (riskLevel === 'high') {
      avoidAreas.push('auth', 'database', 'payment', 'migrations');
    } else if (riskLevel === 'medium') {
      avoidAreas.push('database', 'auth');
    }

    hints[issue.number] = { riskKeywords, riskLevel, avoidAreas };
  }

  return hints;
}

/**
 * Run the Code Risk Mapper Agent.
 */
export function run({ architecture, issues, topLevelContents }) {
  const contents = topLevelContents || [];
  const { globalRiskAreas, safeAreas } = buildGlobalRiskMap(contents);

  // Also pull from architecture's riskMap if available
  const archRiskMap = architecture?.riskMap || [];
  const mergedRisk = [...globalRiskAreas];
  for (const r of archRiskMap) {
    if (!mergedRisk.some((m) => m.area === r.area)) mergedRisk.push(r);
  }

  const issueRiskHints = buildIssueRiskHints(issues || []);

  return {
    globalRiskAreas: mergedRisk,
    safeAreas,
    issueRiskHints,
    _source: 'rule-based',
  };
}
