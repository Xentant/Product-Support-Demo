// Support-to-product loop health: metrics for whether the loop actually removes demand.
import { ACTIVE_DEVELOPERS, WEEKS } from './calendar';
import { WEEKLY_TOTALS } from './drivers';

const casesPer1k = (w: number) => (WEEKLY_TOTALS[w].cases / ACTIVE_DEVELOPERS[w]) * 1000;

export const LOOP_HEALTH = [
  {
    id: 'cases_per_user', label: 'Cases per 1,000 active developers', value: casesPer1k(WEEKS - 1).toFixed(2),
    sub: `Weekly · was ${casesPer1k(0).toFixed(2)} 12 weeks ago`, tone: 'good' as const,
    tip: 'North-star metric: falling even as active developers grew 29%.',
  },
  { id: 'root_fixed', label: 'Drivers fixed at the root', value: '2 of 12', sub: 'Billing transparency, Quickstart', tone: undefined, tip: 'Material drivers whose contact rate fell to target after a product change (validated).' },
  { id: 'first_to_fix', label: 'First case → shipped fix', value: '38 days', sub: 'Median, last 4 fixes · target 30', tone: 'warn' as const, tip: 'From the first classified case of a driver to the release that addressed it.' },
  { id: 'detection', label: 'First case → named owner', value: '21+ days', sub: 'API Key Management still unowned', tone: 'warn' as const, tip: 'Ownership latency is the slowest step in the loop today.' },
  { id: 'frt', label: 'First response time', value: '9 s / 1.8 h', sub: 'AI / human · human target 4 h', tone: undefined, tip: 'Median. Product Support Operations target retained.' },
  { id: 'csat', label: 'CSAT', value: '4.4 / 5', sub: 'AI 4.3 · human 4.6 · target 4.3', tone: undefined, tip: 'Post-interaction survey, 28 days.' },
];

/** Blast radius for the API-key driver: how big the affected group was when each mechanism would have fired. */
export const BLAST_RADIUS = [
  { label: 'First anomalous rotation cases', date: 'Oct 1', accounts: 41, note: '2 days after release 2026.10.2' },
  { label: 'Release-aware fast lane (proposed)', date: 'Oct 3', accounts: 180, note: 'Flag any subdriver > 2σ within 72 h of a release, with case examples' },
  { label: 'Current emerging-driver rule (14-day minimum)', date: 'Oct 22', accounts: 3237, note: 'All five thresholds met' },
  { label: 'Named owner assigned', date: '—', accounts: 7039, note: 'Pending human approval' },
];

/** AI-drafted bug report for the owning engineering team, built from aggregated cases. */
export const BUG_REPORT = {
  id: 'ADO-BUG-51877',
  title: 'New API key rejected in ap-southeast/eu-west for up to 40 min after rotation while old key still valid',
  team: 'Identity Platform',
  severity: 'Sev 3 (customer-facing, workaround exists)',
  affected: '3,237 accounts in 28 days; Team and Enterprise over-indexed; Asia Pacific +52%',
  repro: [
    'Rotate a production key in Developer Console 2026.10.2 (account in ap-southeast).',
    'Immediately call any API endpoint with the new key from an ap-southeast client.',
    'Observe 401 for 10–40 min; the old key continues to return 200.',
    'Console shows rotation "complete" with no regional propagation status.',
  ],
  expected: 'New key valid in all regions within the documented window, or the Console shows per-region status.',
  actual: 'Median 14 min (p90 38 min in ap-southeast) to first successful call; no status visible.',
  evidence: ['CASE-10482', 'CASE-10517', 'CASE-10544', 'Dynatrace auth-gateway p95 210 → 520 ms', 'key-cache miss rate 2% → 9%'],
  proposedFix: [
    'Expose per-region propagation state via a status API and render it in the Console (product).',
    'Investigate whether 2026.10.2 changed key-cache TTL or the validation path (engineering).',
  ],
  confidence: 'Moderate on repro; low on root cause',
};

/** Weighting inputs for the fix-first ranking. */
export const PRIORITY_DIMENSIONS = [
  { id: 'intake', label: 'Intake reduction', help: 'Avoidable contacts per 28 days' },
  { id: 'effort', label: 'Response time & effort', help: 'Escalation + recontact: how long and hard getting unblocked is' },
  { id: 'cost', label: 'Cost', help: 'Annualized avoidable support cost' },
  { id: 'quality', label: 'Quality & risk', help: 'Security, financial or trust risk if left unfixed' },
] as const;

export type PriorityDim = (typeof PRIORITY_DIMENSIONS)[number]['id'];

/** Qualitative inputs not in the case data: risk score (0–1) and fix confidence. */
export const DRIVER_RISK: Record<string, { risk: number; fixConfidence: 'low' | 'moderate' | 'high'; fixEffort: string }> = {
  api_rate_limits: { risk: 0.4, fixConfidence: 'high', fixEffort: 'M' },
  authentication_failures: { risk: 0.6, fixConfidence: 'moderate', fixEffort: 'M' },
  usage_billing: { risk: 0.7, fixConfidence: 'high', fixEffort: 'Shipped' },
  api_key_management: { risk: 0.9, fixConfidence: 'moderate', fixEffort: 'M' },
  model_availability: { risk: 0.5, fixConfidence: 'low', fixEffort: 'L' },
  sdk_configuration: { risk: 0.2, fixConfidence: 'moderate', fixEffort: 'S' },
  account_access: { risk: 0.8, fixConfidence: 'moderate', fixEffort: 'M' },
  webhook_delivery: { risk: 0.3, fixConfidence: 'moderate', fixEffort: 'S' },
  data_export: { risk: 0.1, fixConfidence: 'high', fixEffort: 'S' },
  org_team_management: { risk: 0.3, fixConfidence: 'moderate', fixEffort: 'S' },
  onboarding_docs: { risk: 0.1, fixConfidence: 'high', fixEffort: 'Shipped' },
  model_output_quality: { risk: 0.2, fixConfidence: 'low', fixEffort: 'L' },
};
