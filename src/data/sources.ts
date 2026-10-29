// Mock source adapters. Each adapter returns raw-ish records in the source's own shape and a
// `normalize` function that maps them to the shared model. Swapping a mock for a real API client
// only requires implementing `fetch()` against the vendor endpoint.
import { APP_HEALTH, INFRA, OPPORTUNITY, TELEMETRY } from './apiKey';
import { SAMPLE_CASES, CONVERSATIONS } from './cases';
import type { SourceSystem } from './types';

export interface SourceAdapter<Raw, Normalized> {
  system: SourceSystem;
  provides: string[];
  entity: string;
  lastSync: string;
  fetch: () => Raw[];
  normalize: (raw: Raw) => Normalized;
}

interface ServiceNowCase {
  number: string;
  opened_at: string;
  u_segment: string;
  u_driver: string;
  u_subdriver: string;
  contact_type: string;
  close_code: string;
  u_verified: boolean;
}

export const serviceNowAdapter: SourceAdapter<ServiceNowCase, { caseId: string; createdAt: string; driver: string; verifiedResolution: boolean }> = {
  system: 'ServiceNow',
  provides: ['Support cases', 'Problem records', 'Incident records', 'Change records', 'Case dispositions'],
  entity: 'SupportCase',
  lastSync: 'Oct 25, 23:50 UTC',
  fetch: () =>
    SAMPLE_CASES.slice(0, 50).map((c) => ({
      number: c.caseId,
      opened_at: c.createdAt,
      u_segment: c.customerSegment,
      u_driver: c.driver,
      u_subdriver: c.subdriver,
      contact_type: c.channel,
      close_code: c.resolutionPath,
      u_verified: c.verifiedResolution,
    })),
  normalize: (r) => ({ caseId: r.number, createdAt: r.opened_at, driver: r.u_driver, verifiedResolution: r.u_verified }),
};

export const SOURCE_SYSTEMS: { system: SourceSystem; provides: string[]; entities: string[]; records: string; lastSync: string }[] = [
  { system: 'ServiceNow', provides: serviceNowAdapter.provides, entities: ['SupportCase', 'Evidence (problem record)'], records: `${SAMPLE_CASES.length.toLocaleString()} sampled cases · 1 problem record`, lastSync: serviceNowAdapter.lastSync },
  { system: 'Dynatrace', provides: ['Application errors', 'Authentication failures', 'Latency', 'Service health', 'Regional performance'], entities: ['ApplicationHealthSignal'], records: `${APP_HEALTH.length} active signals`, lastSync: 'Oct 25, 23:55 UTC' },
  { system: 'SolarWinds', provides: ['Infrastructure health', 'Network health', 'Regional availability', 'Service alerts'], entities: ['InfrastructureSignal'], records: `${INFRA.length} signals`, lastSync: 'Oct 25, 23:55 UTC' },
  { system: 'Azure DevOps', provides: ['Features', 'User stories', 'Technical enablers', 'Releases', 'Delivery status', 'Dependencies'], entities: ['DeliveryFeature', 'DeliveryStory', 'Dependency', 'Release'], records: `Feature ${OPPORTUNITY.featureId} + investigation #48213`, lastSync: 'Oct 25, 22:00 UTC' },
  { system: 'Jira Align', provides: ['Strategic objectives', 'Portfolio epics', 'Roadmap items', 'Ownership', 'Portfolio dependencies'], entities: ['PortfolioEpic', 'ProductOwner'], records: `Epic ${OPPORTUNITY.epicId} (created on approval)`, lastSync: 'Oct 25, 22:00 UTC' },
  { system: 'Agent logs', provides: ['Conversations', 'Agent actions', 'Tool calls', 'Escalations', 'Resolution outcomes', 'Quality evaluations'], entities: ['AgentConversation'], records: `${CONVERSATIONS.length} linked conversations`, lastSync: 'Streaming' },
  { system: 'Product telemetry', provides: ['Console events', 'Auth attempts', 'Funnels'], entities: ['ProductTelemetrySignal'], records: `${TELEMETRY.length} signals`, lastSync: 'Oct 25, 23:00 UTC' },
  { system: 'Help center', provides: ['Article views', 'Search', 'Abandonment'], entities: ['HelpContentInteraction'], records: '1 driver profile', lastSync: 'Oct 25, 23:00 UTC' },
];

export const RELATIONSHIPS = [
  ['SupportCase', 'SupportDriver'],
  ['SupportCase', 'SupportSubdriver'],
  ['AgentConversation', 'SupportCase'],
  ['SupportDriver', 'Trend'],
  ['Trend', 'Evidence'],
  ['Evidence', 'ProductOpportunity'],
  ['ProductOpportunity', 'Hypothesis'],
  ['ProductOpportunity', 'PortfolioEpic'],
  ['PortfolioEpic', 'DeliveryFeature'],
  ['DeliveryFeature', 'DeliveryStory'],
  ['DeliveryFeature', 'Dependency'],
  ['DeliveryFeature', 'Release'],
  ['Release', 'Measurement'],
  ['Measurement', 'Outcome'],
];

export const SAMPLE_NORMALIZED = {
  caseId: 'CASE-10482',
  createdAt: '2026-10-21T14:32:00Z',
  customerSegment: 'paid_developer',
  customerTenureDays: 47,
  productArea: 'developer_console',
  driver: 'api_key_management',
  subdriver: 'propagation_status_unknown',
  channel: 'ai_agent',
  resolutionPath: 'tool_assisted',
  resolved: true,
  verifiedResolution: true,
  escalated: false,
  recontactWithin7Days: false,
  agentConfidence: 0.89,
  productFrictionSuspected: true,
  releaseVersion: '2026.10.2',
  productOwner: null,
  engineeringOwner: null,
  interventionType: 'product_candidate',
};

