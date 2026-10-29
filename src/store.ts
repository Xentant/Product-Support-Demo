import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_HYPOTHESIS, OPPORTUNITY } from './data/apiKey';
import { DRIVER_BY_ID, DRIVERS } from './data/drivers';
import type { InterventionStatus, OwnershipStatus, SupportDriver } from './data/types';

export type OpportunityStatus = 'unreviewed' | 'draft' | 'more_evidence' | 'linked' | 'approved' | 'rejected';

export type DriverFlag =
  | 'investigation_open'
  | 'engineering_requested'
  | 'agent_guidance'
  | 'help_content'
  | 'monitoring'
  | 'dismissed'
  | 'linked_work';

export interface DriverOverride {
  productOwner?: string | null;
  engineeringOwner?: string | null;
  ownershipStatus?: OwnershipStatus;
  interventionStatus?: InterventionStatus;
  roadmapCoverage?: string | null;
  flags?: DriverFlag[];
}

export interface DecisionEntry {
  id: number;
  at: string;
  actor: 'You' | 'AI (recommendation)' | 'System';
  action: string;
  detail: string;
}

interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: 'success' | 'info' | 'warn';
}

interface State {
  opportunityStatus: OpportunityStatus;
  hypothesis: string;
  hypothesisHistory: string[];
  overrides: Record<string, DriverOverride>;
  decisions: DecisionEntry[];
  trustRuns: Record<string, boolean>;
  tourStep: number | null;
  // transient
  toasts: Toast[];
  askOpen: boolean;
  askQuestion: string | null;
}

interface Actions {
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  log: (action: string, detail: string, actor?: DecisionEntry['actor']) => void;
  setHypothesis: (text: string) => void;
  approveOpportunity: () => void;
  setOpportunityStatus: (s: OpportunityStatus, note: string) => void;
  assignOwners: (driverId: string, product: string | null, engineering: string | null) => void;
  flagDriver: (driverId: string, flag: DriverFlag, patch?: DriverOverride) => void;
  markTrustRun: (id: string) => void;
  setTourStep: (n: number | null) => void;
  openAsk: (q?: string | null) => void;
  closeAsk: () => void;
  reset: () => void;
}

const now = () => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const initial = (): Omit<State, 'toasts' | 'askOpen' | 'askQuestion'> => ({
  opportunityStatus: 'unreviewed',
  hypothesis: DEFAULT_HYPOTHESIS,
  hypothesisHistory: [],
  overrides: {},
  decisions: [
    { id: 1, at: 'Oct 22, 9:14 AM', actor: 'System', action: 'Emerging-driver alert EA-301', detail: 'API Key Management › rotation met all five thresholds.' },
    { id: 2, at: 'Oct 22, 9:15 AM', actor: 'AI (recommendation)', action: 'Drafted opportunity OPP-0192', detail: 'Suggested Developer Platform / Identity Platform. Requires human approval.' },
  ],
  trustRuns: {},
  tourStep: null,
});

let toastSeq = 1;

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial(),
      toasts: [],
      askOpen: false,
      askQuestion: null,

      toast: (t) => {
        const id = toastSeq++;
        set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
        setTimeout(() => get().dismissToast(id), 5200);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      log: (action, detail, actor = 'You') =>
        set((s) => ({ decisions: [{ id: Date.now(), at: now(), actor, action, detail }, ...s.decisions] })),

      setHypothesis: (text) =>
        set((s) => (text === s.hypothesis ? s : { hypothesis: text, hypothesisHistory: [s.hypothesis, ...s.hypothesisHistory] })),

      approveOpportunity: () => {
        const s = get();
        set({
          opportunityStatus: 'approved',
          overrides: {
            ...s.overrides,
            api_key_management: {
              ...s.overrides.api_key_management,
              productOwner: OPPORTUNITY.suggestedProductOwner,
              engineeringOwner: OPPORTUNITY.suggestedEngineeringTeam,
              ownershipStatus: 'owned',
              interventionStatus: 'in_development',
              roadmapCoverage: `${OPPORTUNITY.epicTitle} (${OPPORTUNITY.epicId})`,
              flags: Array.from(new Set([...(s.overrides.api_key_management?.flags ?? []), 'investigation_open' as const])),
            },
          },
        });
        get().log('Approved opportunity OPP-0192', 'Hypothesis, baseline (37), target (<24) and guardrails locked to the roadmap item.');
        get().log('Assigned owners', 'Product: Developer Platform · Engineering: Identity Platform');
        get().log('Created Jira Align epic', `${OPPORTUNITY.epicId} "${OPPORTUNITY.epicTitle}"`, 'System');
        get().log('Created Azure DevOps feature', `${OPPORTUNITY.featureId} "${OPPORTUNITY.featureTitle}"`, 'System');
      },

      setOpportunityStatus: (st, note) => {
        set({ opportunityStatus: st });
        get().log(note, 'OPP-0192 API Key Rotation Experience');
      },

      assignOwners: (driverId, product, engineering) => {
        const s = get();
        const o = s.overrides[driverId] ?? {};
        set({
          overrides: {
            ...s.overrides,
            [driverId]: { ...o, productOwner: product, engineeringOwner: engineering, ownershipStatus: product || engineering ? 'owned' : 'unowned' },
          },
        });
        get().log(`Assigned owner: ${DRIVER_BY_ID[driverId]?.label}`, `Product: ${product ?? '—'} · Engineering: ${engineering ?? '—'}`);
      },

      flagDriver: (driverId, flag, patch) => {
        const s = get();
        const o = s.overrides[driverId] ?? {};
        set({
          overrides: {
            ...s.overrides,
            [driverId]: { ...o, ...patch, flags: Array.from(new Set([...(o.flags ?? []), flag])) },
          },
        });
      },

      markTrustRun: (id) => set((s) => ({ trustRuns: { ...s.trustRuns, [id]: true } })),
      setTourStep: (n) => set({ tourStep: n }),
      openAsk: (q = null) => set({ askOpen: true, askQuestion: q }),
      closeAsk: () => set({ askOpen: false }),

      reset: () => {
        set({ ...initial(), askOpen: false, askQuestion: null });
        get().toast({ title: 'Demo reset', body: 'All decisions and edits were cleared.', tone: 'info' });
      },
    }),
    {
      name: 'sil-demo-state-v1',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        opportunityStatus: s.opportunityStatus,
        hypothesis: s.hypothesis,
        hypothesisHistory: s.hypothesisHistory,
        overrides: s.overrides,
        decisions: s.decisions,
        trustRuns: s.trustRuns,
        tourStep: s.tourStep,
      }),
    },
  ),
);

/** Driver merged with any human decisions made in this session. */
export function resolveDriver(d: SupportDriver, overrides: Record<string, DriverOverride>): SupportDriver & { flags: DriverFlag[] } {
  const o = overrides[d.id] ?? {};
  return {
    ...d,
    productOwner: o.productOwner !== undefined ? o.productOwner : d.productOwner,
    engineeringOwner: o.engineeringOwner !== undefined ? o.engineeringOwner : d.engineeringOwner,
    ownershipStatus: o.ownershipStatus ?? d.ownershipStatus,
    interventionStatus: o.interventionStatus ?? d.interventionStatus,
    roadmapCoverage: o.roadmapCoverage !== undefined ? o.roadmapCoverage : d.roadmapCoverage,
    flags: o.flags ?? [],
  };
}

export function useDrivers() {
  const overrides = useStore((s) => s.overrides);
  return DRIVERS.map((d) => resolveDriver(d, overrides));
}

export function useUnownedCount() {
  return useDrivers().filter((d) => d.ownershipStatus === 'unowned').length;
}
