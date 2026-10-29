// Twelve reporting weeks (Monday starts). Week 11 is the most recent full week.
export const WEEK_STARTS = [
  '2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31', '2026-09-07',
  '2026-09-14', '2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19',
];

export const WEEK_LABELS = WEEK_STARTS.map((d) => {
  const dt = new Date(d + 'T00:00:00Z');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
});

export const WEEKS = WEEK_STARTS.length;
export const AS_OF = 'Oct 25, 2026';

/** Active developers per week. Hypergrowth: roughly 2.3% week over week. */
export const ACTIVE_DEVELOPERS = [
  2_018_000, 2_066_000, 2_113_000, 2_161_000, 2_212_000, 2_262_000,
  2_315_000, 2_368_000, 2_423_000, 2_478_000, 2_535_000, 2_594_000,
];

/** Paid accounts (billing contact rates use this population). */
export const PAID_ACCOUNTS = ACTIVE_DEVELOPERS.map((d) => Math.round(d * 0.158));

export function weekOfDate(iso: string): number {
  const t = Date.parse(iso);
  for (let i = WEEKS - 1; i >= 0; i--) if (t >= Date.parse(WEEK_STARTS[i] + 'T00:00:00Z')) return i;
  return 0;
}
