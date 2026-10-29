import { AlertTriangle, Ban, CheckCircle2, Circle, Loader2, Users } from 'lucide-react';
import type { Dependency, DependencyStatus } from '../data/types';
import { Badge } from './ui';

const STATUS: Record<DependencyStatus, { label: string; tone: 'green' | 'blue' | 'red' | 'amber' | 'neutral'; icon: JSX.Element }> = {
  completed: { label: 'Completed', tone: 'green', icon: <CheckCircle2 size={12} aria-hidden /> },
  active: { label: 'Active', tone: 'blue', icon: <Loader2 size={12} aria-hidden /> },
  blocked: { label: 'Blocked', tone: 'red', icon: <Ban size={12} aria-hidden /> },
  at_risk: { label: 'At risk', tone: 'amber', icon: <AlertTriangle size={12} aria-hidden /> },
  not_started: { label: 'Not started', tone: 'neutral', icon: <Circle size={12} aria-hidden /> },
};

export function DependencyStatusBadge({ status, coordination }: { status: DependencyStatus; coordination?: boolean }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1">
      <Badge tone={s.tone} icon={s.icon}>{s.label}</Badge>
      {coordination && <Badge tone="violet" icon={<Users size={12} aria-hidden />}>Coordination required</Badge>}
    </span>
  );
}

export function DependencyView({ deps }: { deps: Dependency[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead className="border-b border-line bg-slate-50/70 text-[11px] uppercase tracking-wide text-ink-3">
          <tr>
            <th className="px-3 py-2">Dependency</th>
            <th className="px-3 py-2">Owner</th>
            <th className="px-3 py-2">Due</th>
            <th className="px-3 py-2">Note</th>
            <th className="px-3 py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {deps.map((d) => (
            <tr key={d.id} className={d.status === 'blocked' || d.status === 'at_risk' ? 'bg-amber-50/40' : ''}>
              <td className="px-3 py-2.5 font-medium text-ink">{d.name}</td>
              <td className="px-3 py-2.5 text-ink-2">{d.owner}</td>
              <td className="px-3 py-2.5 tabular-nums text-ink-2">{d.due}</td>
              <td className="px-3 py-2.5 text-ink-2">{d.note}</td>
              <td className="px-3 py-2.5 text-right"><DependencyStatusBadge status={d.status} coordination={d.coordinationRequired} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
