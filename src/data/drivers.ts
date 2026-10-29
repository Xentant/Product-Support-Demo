import { ACTIVE_DEVELOPERS, PAID_ACCOUNTS, WEEK_LABELS, WEEK_STARTS, WEEKS } from './calendar';
import type { SupportDriver, Trend, TrendDirection, WeeklyPoint } from './types';

// Contact-rate convention used throughout the app:
//  - Driver rates are contacts per 10,000 of the driver's relevant active population over a
//    trailing 28-day window (weekly cases × 4 ÷ population × 10,000).
//  - The platform-wide headline rate is weekly: all contacts per 10,000 active developers per week.

interface DriverSeed {
  def: Omit<SupportDriver, 'affectedAccounts' | 'subdrivers'> & {
    subdrivers: [string, string, number][];
    accountDuplication: number;
    avoidableShare: number;
  };
  rate: number[];
  ai: number[];
  esc: number[];
  recon: number[];
  population: 'developers' | 'paid_accounts';
}

const flat = (v: number, early: number = v) =>
  Array.from({ length: WEEKS }, (_, i) => (i < 8 ? +(early + ((v - early) * i) / 8).toFixed(1) : v));

const SEEDS: DriverSeed[] = [
  {
    def: {
      id: 'api_rate_limits', label: 'API Rate Limits', productArea: 'API Gateway',
      populationLabel: 'active developers', populationShare: 1,
      productOwner: 'Developer Experience', engineeringOwner: 'API Gateway', ownershipStatus: 'proposed',
      interventionType: 'product_response', interventionStatus: 'awaiting_review', roadmapCoverage: null,
      riskLevel: 'high', costPerContact: 0, topDriver: true, accountDuplication: 0.71, avoidableShare: 0.55,
      subdrivers: [
        ['quota_remaining_unknown', 'Remaining quota not visible', 0.41],
        ['reset_timing', 'Reset timing unclear', 0.24],
        ['tier_upgrade', 'Tier upgrade questions', 0.19],
        ['burst_429', 'Unexpected 429 bursts', 0.16],
      ],
    },
    rate: [50, 51, 52, 52.5, 53, 54, 54.5, 55, 63, 66, 67.5, 68],
    ai: flat(72, 69), esc: flat(17, 19), recon: flat(13, 8), population: 'developers',
  },
  {
    def: {
      id: 'authentication_failures', label: 'Authentication Failures', productArea: 'Identity & Auth',
      populationLabel: 'active developers', populationShare: 1,
      productOwner: 'Identity & Access', engineeringOwner: 'Identity Platform', ownershipStatus: 'owned',
      interventionType: 'engineering_response', interventionStatus: 'measuring', roadmapCoverage: 'Auth error clarity (measuring)',
      riskLevel: 'moderate', costPerContact: 0, topDriver: true, accountDuplication: 0.78, avoidableShare: 0.35,
      subdrivers: [
        ['invalid_key_format', 'Invalid key format', 0.34],
        ['expired_credentials', 'Expired credentials', 0.27],
        ['org_mismatch', 'Organization mismatch', 0.22],
        ['auth_other', 'Other', 0.17],
      ],
    },
    rate: [44, 44, 43.5, 43, 42, 40, 38, 37, 36, 35, 34.5, 34],
    ai: flat(54, 51), esc: flat(36, 38), recon: flat(5, 6), population: 'developers',
  },
  {
    def: {
      id: 'usage_billing', label: 'Usage Billing Questions', productArea: 'Billing',
      populationLabel: 'paid accounts', populationShare: 1,
      productOwner: 'Billing & Monetization', engineeringOwner: 'Billing Engineering', ownershipStatus: 'owned',
      interventionType: 'product_response', interventionStatus: 'validated', roadmapCoverage: 'Usage Billing Transparency (shipped)',
      riskLevel: 'low', costPerContact: 0, topDriver: true, accountDuplication: 0.84, avoidableShare: 0.4,
      subdrivers: [
        ['unexpected_charge', 'Unexpected usage charge', 0.38],
        ['invoice_breakdown', 'Invoice breakdown', 0.29],
        ['payment_failed', 'Payment failed', 0.2],
        ['billing_other', 'Other', 0.13],
      ],
    },
    rate: [74, 74.5, 73.5, 74, 74.5, 73.5, 74, 66, 55, 46, 41, 39],
    ai: [60, 60, 61, 60, 61, 60, 61, 60, 59, 58, 58, 58],
    esc: [29, 29, 28, 29, 28, 29, 28, 29, 30, 30, 30, 30],
    recon: [16, 16, 16, 16, 16, 16, 16, 13, 9, 8, 8, 7],
    population: 'paid_accounts',
  },
  {
    def: {
      id: 'api_key_management', label: 'API Key Management', productArea: 'Developer Console',
      populationLabel: 'active developers', populationShare: 1,
      productOwner: null, engineeringOwner: null, ownershipStatus: 'unowned',
      interventionType: 'product_candidate', interventionStatus: 'emerging_opportunity', roadmapCoverage: null,
      riskLevel: 'high', costPerContact: 0, topDriver: true, accountDuplication: 0.81, avoidableShare: 0.6,
      subdrivers: [
        ['rotating_keys', 'Rotating API keys', 0.46],
        ['finding_keys', 'Finding existing keys', 0.18],
        ['revoking_compromised', 'Revoking compromised keys', 0.14],
        ['creating_first_key', 'Creating first API key', 0.12],
        ['key_other', 'Other', 0.1],
      ],
    },
    rate: [27.2, 26.8, 27.1, 26.9, 26.5, 26.2, 26.4, 26.6, 30.4, 34.6, 36.4, 37],
    ai: [74, 74, 75, 75, 76, 77, 78, 79, 80, 81, 81, 82],
    esc: [18, 18, 17, 17, 16, 15, 14, 14, 13, 12, 12, 12],
    recon: [9, 9, 9, 10, 9, 10, 10, 10, 12, 13, 15, 15],
    population: 'developers',
  },
  {
    def: {
      id: 'model_availability', label: 'Model Availability', productArea: 'Model Serving',
      populationLabel: 'active developers', populationShare: 1,
      productOwner: 'Model Serving', engineeringOwner: 'Inference Infrastructure', ownershipStatus: 'owned',
      interventionType: 'operations_response', interventionStatus: 'measuring', roadmapCoverage: 'Status banner in Console (measuring)',
      riskLevel: 'moderate', costPerContact: 0, topDriver: true, accountDuplication: 0.62, avoidableShare: 0.2,
      subdrivers: [
        ['capacity_errors', 'Capacity / overloaded errors', 0.48],
        ['regional_outage', 'Regional degradation', 0.31],
        ['deprecation', 'Model deprecation timing', 0.21],
      ],
    },
    rate: [12, 12.5, 13, 12, 12, 25, 14, 13, 12.5, 13, 13, 13],
    ai: flat(47, 45), esc: flat(22, 25), recon: flat(4), population: 'developers',
  },
  {
    def: {
      id: 'sdk_configuration', label: 'SDK Configuration', productArea: 'SDKs',
      populationLabel: 'active developers', populationShare: 1,
      productOwner: 'SDK & Tooling', engineeringOwner: 'SDK Engineering', ownershipStatus: 'owned',
      interventionType: 'help_center_response', interventionStatus: 'in_development', roadmapCoverage: 'SDK Configuration Diagnostics',
      riskLevel: 'moderate', costPerContact: 0, topDriver: true, accountDuplication: 0.86, avoidableShare: 0.45,
      subdrivers: [
        ['env_variables', 'Environment variables', 0.37],
        ['proxy_tls', 'Proxy / TLS setup', 0.28],
        ['version_mismatch', 'Version mismatch', 0.21],
        ['sdk_other', 'Other', 0.14],
      ],
    },
    rate: [11.5, 11.4, 11.2, 11.3, 11, 11.2, 11, 11.1, 11, 11, 11.2, 11],
    ai: flat(49, 47), esc: flat(40, 41), recon: flat(7, 8), population: 'developers',
  },
  {
    def: {
      id: 'account_access', label: 'Account Access', productArea: 'Identity & Auth',
      populationLabel: 'active developers', populationShare: 1,
      productOwner: 'Identity & Access', engineeringOwner: 'Identity Platform', ownershipStatus: 'owned',
      interventionType: 'support_response', interventionStatus: 'measuring', roadmapCoverage: 'Self-serve account recovery (measuring)',
      riskLevel: 'low', costPerContact: 0, topDriver: true, accountDuplication: 0.93, avoidableShare: 0.25,
      subdrivers: [
        ['mfa_reset', 'MFA reset', 0.44],
        ['sso_issues', 'SSO login issues', 0.33],
        ['email_change', 'Email change', 0.23],
      ],
    },
    rate: [12, 12, 11.8, 11.5, 11, 10.5, 10, 9.6, 9.3, 9.1, 9, 9],
    ai: flat(31, 28), esc: flat(62, 64), recon: flat(4, 5), population: 'developers',
  },
  {
    def: {
      id: 'webhook_delivery', label: 'Webhook Delivery', productArea: 'Integrations',
      populationLabel: 'active developers', populationShare: 1,
      productOwner: null, engineeringOwner: null, ownershipStatus: 'unowned',
      interventionType: 'engineering_response', interventionStatus: 'none', roadmapCoverage: null,
      riskLevel: 'moderate', costPerContact: 0, topDriver: false, accountDuplication: 0.74, avoidableShare: 0.3,
      subdrivers: [
        ['retry_visibility', 'Retry visibility', 0.55],
        ['signature_validation', 'Signature validation', 0.45],
      ],
    },
    rate: [1.4, 1.4, 1.5, 1.5, 1.5, 1.6, 1.6, 1.6, 1.7, 1.7, 1.8, 1.8],
    ai: flat(60, 58), esc: flat(27, 28), recon: flat(3, 4), population: 'developers',
  },
  {
    def: {
      id: 'data_export', label: 'Usage Data Export', productArea: 'Usage Reporting',
      populationLabel: 'active developers', populationShare: 1,
      productOwner: null, engineeringOwner: null, ownershipStatus: 'unowned',
      interventionType: 'help_center_response', interventionStatus: 'none', roadmapCoverage: null,
      riskLevel: 'low', costPerContact: 0, topDriver: false, accountDuplication: 0.88, avoidableShare: 0.3,
      subdrivers: [
        ['csv_format', 'CSV format questions', 0.6],
        ['export_delay', 'Export delay', 0.4],
      ],
    },
    rate: flat(0.9, 0.9), ai: flat(60), esc: flat(27), recon: flat(3), population: 'developers',
  },
  {
    def: {
      id: 'org_team_management', label: 'Org & Team Management', productArea: 'Developer Console',
      populationLabel: 'active developers', populationShare: 1,
      productOwner: null, engineeringOwner: null, ownershipStatus: 'unowned',
      interventionType: 'product_candidate', interventionStatus: 'none', roadmapCoverage: null,
      riskLevel: 'low', costPerContact: 0, topDriver: false, accountDuplication: 0.9, avoidableShare: 0.3,
      subdrivers: [
        ['invite_members', 'Inviting members', 0.5],
        ['role_permissions', 'Role permissions', 0.5],
      ],
    },
    rate: flat(1.4, 1.2), ai: flat(60), esc: flat(27), recon: flat(3), population: 'developers',
  },
  {
    def: {
      id: 'onboarding_docs', label: 'Onboarding & Quickstart', productArea: 'Documentation',
      populationLabel: 'active developers', populationShare: 1,
      productOwner: 'Developer Experience', engineeringOwner: 'Developer Console', ownershipStatus: 'owned',
      interventionType: 'help_center_response', interventionStatus: 'monitoring', roadmapCoverage: 'Quickstart refresh (shipped)',
      riskLevel: 'low', costPerContact: 0, topDriver: false, accountDuplication: 0.95, avoidableShare: 0.3,
      subdrivers: [
        ['first_request', 'First request fails', 0.6],
        ['sample_code', 'Sample code questions', 0.4],
      ],
    },
    rate: [14, 13.5, 13, 12.5, 9, 5, 2.5, 1.6, 1.4, 1.3, 1.2, 1.2], ai: flat(60), esc: flat(27), recon: flat(3), population: 'developers',
  },
  {
    def: {
      id: 'model_output_quality', label: 'Model Output Questions', productArea: 'Model Serving',
      populationLabel: 'active developers', populationShare: 1,
      productOwner: 'Model Serving', engineeringOwner: 'Inference Infrastructure', ownershipStatus: 'owned',
      interventionType: 'support_response', interventionStatus: 'agent_guidance', roadmapCoverage: null,
      riskLevel: 'low', costPerContact: 0, topDriver: false, accountDuplication: 0.9, avoidableShare: 0.3,
      subdrivers: [
        ['parameter_tuning', 'Parameter tuning', 0.7],
        ['output_other', 'Other', 0.3],
      ],
    },
    rate: flat(0.5), ai: flat(60), esc: flat(27), recon: flat(3), population: 'developers',
  },
];

// Blended cost assumptions (illustrative): AI-verified contact $1.80, human-handled $22, other $7.
export const COST_AI = 1.8;
export const COST_HUMAN = 22;
export const COST_OTHER = 7;

function populationFor(kind: DriverSeed['population'], week: number) {
  return kind === 'paid_accounts' ? PAID_ACCOUNTS[week] : ACTIVE_DEVELOPERS[week];
}

function pct(a: number, b: number) {
  return b === 0 ? 0 : ((a - b) / b) * 100;
}

function buildTrend(seed: DriverSeed): Trend {
  const points: WeeklyPoint[] = seed.rate.map((rate, week) => {
    const population = populationFor(seed.population, week);
    const cases = Math.round((rate * population) / 10_000 / 4);
    return {
      week,
      weekStart: WEEK_STARTS[week],
      label: WEEK_LABELS[week],
      cases,
      population,
      contactRate: rate,
      verifiedAiResolution: seed.ai[week],
      humanEscalation: seed.esc[week],
      recontact7d: seed.recon[week],
    };
  });
  const last = points[WEEKS - 1].contactRate;
  const prev = points[WEEKS - 2].contactRate;
  const monthAgo = points[WEEKS - 5].contactRate;
  const avg = (a: WeeklyPoint[]) => a.reduce((s, p) => s + p.contactRate, 0) / a.length;
  const fourWeekChange = pct(avg(points.slice(8, 12)), avg(points.slice(4, 8)));
  const direction: TrendDirection = fourWeekChange > 5 ? 'rising' : fourWeekChange < -5 ? 'falling' : 'stable';
  return { driverId: seed.def.id, points, wowChange: pct(last, prev), momChange: pct(last, monthAgo), fourWeekChange, direction };
}

export interface DriverAggregate {
  cases12w: number;
  cases28d: number;
  contactRate: number;
  previousRate: number;
  fourWeekChange: number;
  wowChange: number;
  momChange: number;
  direction: TrendDirection;
  verifiedAiResolution: number;
  humanEscalation: number;
  recontact7d: number;
  affectedAccounts: number;
  cost28d: number;
  annualCost: number;
  annualAvoidableCost: number;
}

function weighted(points: WeeklyPoint[], key: 'verifiedAiResolution' | 'humanEscalation' | 'recontact7d') {
  const total = points.reduce((s, p) => s + p.cases, 0);
  return points.reduce((s, p) => s + p[key] * p.cases, 0) / total;
}

function aggregate(seed: DriverSeed, trend: Trend): DriverAggregate {
  const last4 = trend.points.slice(8);
  const cases28d = last4.reduce((s, p) => s + p.cases, 0);
  const ai = weighted(last4, 'verifiedAiResolution');
  const esc = weighted(last4, 'humanEscalation');
  const costPer = (ai / 100) * COST_AI + (esc / 100) * COST_HUMAN + ((100 - ai - esc) / 100) * COST_OTHER;
  const cost28d = cases28d * costPer;
  return {
    cases12w: trend.points.reduce((s, p) => s + p.cases, 0),
    cases28d,
    contactRate: trend.points[WEEKS - 1].contactRate,
    previousRate: seed.def.id === 'api_key_management' ? 27 : trend.points[WEEKS - 5].contactRate,
    fourWeekChange: trend.fourWeekChange,
    wowChange: trend.wowChange,
    momChange: trend.momChange,
    direction: trend.direction,
    verifiedAiResolution: ai,
    humanEscalation: esc,
    recontact7d: weighted(last4, 'recontact7d'),
    affectedAccounts: Math.round(cases28d * seed.def.accountDuplication),
    cost28d,
    annualCost: cost28d * 13,
    annualAvoidableCost: cost28d * 13 * seed.def.avoidableShare,
  };
}

export const DRIVERS: SupportDriver[] = SEEDS.map((s) => {
  const { subdrivers, accountDuplication: _a, avoidableShare: _b, ...rest } = s.def;
  return {
    ...rest,
    affectedAccounts: 0,
    subdrivers: subdrivers.map(([id, label, share]) => ({ id, driverId: s.def.id, label, share })),
  };
});

export const TRENDS: Record<string, Trend> = Object.fromEntries(SEEDS.map((s) => [s.def.id, buildTrend(s)]));

export const AGGREGATES: Record<string, DriverAggregate> = Object.fromEntries(
  SEEDS.map((s) => [s.def.id, aggregate(s, TRENDS[s.def.id])]),
);

for (const d of DRIVERS) {
  d.affectedAccounts = AGGREGATES[d.id].affectedAccounts;
  d.costPerContact = AGGREGATES[d.id].cost28d / AGGREGATES[d.id].cases28d;
}

export const DRIVER_BY_ID: Record<string, SupportDriver> = Object.fromEntries(DRIVERS.map((d) => [d.id, d]));
export const TOP_DRIVER_IDS = DRIVERS.filter((d) => d.topDriver).map((d) => d.id);
export const AVOIDABLE_SHARE: Record<string, number> = Object.fromEntries(SEEDS.map((s) => [s.def.id, s.def.avoidableShare]));

// Calibration: the dataset is anchored to exactly 127,842 cases over 12 weeks. Any rounding
// residual is absorbed by the first four Onboarding & Quickstart weeks (pre-refresh demand).
export const TARGET_TOTAL_CASES = 127_842;
{
  const total = DRIVERS.reduce((s, d) => s + TRENDS[d.id].points.reduce((t, p) => t + p.cases, 0), 0);
  const residual = TARGET_TOTAL_CASES - total;
  const early = TRENDS.onboarding_docs.points.slice(0, 4);
  early.forEach((p, i) => {
    const share = i < 3 ? Math.round(residual / 4) : residual - 3 * Math.round(residual / 4);
    p.cases += share;
    p.contactRate = +((p.cases * 4 * 10_000) / p.population).toFixed(1);
  });
  AGGREGATES.onboarding_docs.cases12w += residual;
}

/** Platform-wide weekly totals. */
export const WEEKLY_TOTALS = Array.from({ length: WEEKS }, (_, w) => {
  const cases = DRIVERS.reduce((s, d) => s + TRENDS[d.id].points[w].cases, 0);
  return { week: w, label: WEEK_LABELS[w], cases, developers: ACTIVE_DEVELOPERS[w], rate: (cases / ACTIVE_DEVELOPERS[w]) * 10_000 };
});

function platformWeighted(key: 'verifiedAiResolution' | 'humanEscalation' | 'recontact7d') {
  let num = 0;
  let den = 0;
  for (const d of DRIVERS) {
    for (const p of TRENDS[d.id].points) {
      num += p[key] * p.cases;
      den += p.cases;
    }
  }
  return num / den;
}

/** Platform headline metrics. Quality rates are case-weighted over the full 12-week period. */
export const PLATFORM = {
  totalCases: WEEKLY_TOTALS.reduce((s, w) => s + w.cases, 0),
  weeklyContactRate: WEEKLY_TOTALS[WEEKS - 1].rate,
  verifiedAiResolution: platformWeighted('verifiedAiResolution'),
  humanEscalation: platformWeighted('humanEscalation'),
  recontact7d: platformWeighted('recontact7d'),
  annualAvoidableCost: Object.values(AGGREGATES).reduce((s, a) => s + a.annualAvoidableCost, 0),
  activeDevelopers: ACTIVE_DEVELOPERS[WEEKS - 1],
};
