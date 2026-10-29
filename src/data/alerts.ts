// Twelve emerging support-driver signals (subdriver level) produced by the emerging-driver rule.
export interface EmergingAlert {
  id: string;
  driverId: string;
  subdriver: string;
  wow: number;
  cases28d: number;
  accounts: number;
  confidence: number;
  days: number;
  owned: boolean;
  status: 'alert' | 'watch';
  note: string;
}

export const EMERGING_ALERTS: EmergingAlert[] = [
  { id: 'EA-301', driverId: 'api_key_management', subdriver: 'Rotating API keys › propagation status unknown', wow: 17, cases28d: 3996, accounts: 3237, confidence: 0.87, days: 24, owned: false, status: 'alert', note: 'All thresholds met. Opportunity drafted.' },
  { id: 'EA-298', driverId: 'api_rate_limits', subdriver: 'Remaining quota not visible', wow: 16, cases28d: 6803, accounts: 4830, confidence: 0.91, days: 28, owned: false, status: 'alert', note: 'Proposed to Developer Experience; awaiting review.' },
  { id: 'EA-305', driverId: 'api_rate_limits', subdriver: 'Unexpected 429 bursts', wow: 19, cases28d: 2655, accounts: 1885, confidence: 0.82, days: 15, owned: false, status: 'alert', note: 'Overlaps EA-298; may merge.' },
  { id: 'EA-307', driverId: 'webhook_delivery', subdriver: 'Retry visibility', wow: 18, cases28d: 241, accounts: 178, confidence: 0.84, days: 21, owned: false, status: 'alert', note: 'Driver unowned.' },
  { id: 'EA-309', driverId: 'org_team_management', subdriver: 'Role permissions', wow: 21, cases28d: 176, accounts: 158, confidence: 0.81, days: 14, owned: false, status: 'alert', note: 'Driver unowned. Barely meets thresholds.' },
  { id: 'EA-311', driverId: 'api_key_management', subdriver: 'Finding existing keys', wow: 16, cases28d: 1564, accounts: 1267, confidence: 0.83, days: 18, owned: false, status: 'alert', note: 'May relate to the 2026.10.2 key-list redesign.' },
  { id: 'EA-312', driverId: 'data_export', subdriver: 'Export delay', wow: 22, cases28d: 90, accounts: 79, confidence: 0.86, days: 14, owned: false, status: 'watch', note: 'Below the 100-case minimum. Watching.' },
  { id: 'EA-314', driverId: 'sdk_configuration', subdriver: 'Version mismatch', wow: 17, cases28d: 582, accounts: 500, confidence: 0.88, days: 16, owned: true, status: 'alert', note: 'Owned by SDK & Tooling.' },
  { id: 'EA-316', driverId: 'usage_billing', subdriver: 'Payment failed', wow: 16, cases28d: 357, accounts: 300, confidence: 0.9, days: 14, owned: true, status: 'alert', note: 'Owned; card-network issue suspected.' },
  { id: 'EA-318', driverId: 'model_availability', subdriver: 'Model deprecation timing', wow: 26, cases28d: 678, accounts: 420, confidence: 0.85, days: 19, owned: true, status: 'alert', note: 'Deprecation notice sent Oct 12.' },
  { id: 'EA-320', driverId: 'authentication_failures', subdriver: 'Organization mismatch', wow: 16, cases28d: 1923, accounts: 1500, confidence: 0.79, days: 20, owned: true, status: 'watch', note: 'Classification confidence just below 0.80.' },
  { id: 'EA-322', driverId: 'account_access', subdriver: 'SSO login issues', wow: 18, cases28d: 753, accounts: 700, confidence: 0.83, days: 14, owned: true, status: 'alert', note: 'Owned by Identity & Access.' },
];
