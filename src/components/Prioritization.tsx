import { useMemo, useState } from 'react';
import { AGGREGATES, AVOIDABLE_SHARE } from '../data/drivers';
import { DRIVER_RISK, PRIORITY_DIMENSIONS, type PriorityDim } from '../data/loop';
import { cx, fmtInt, fmtMoney } from '../lib/format';
import { go } from '../lib/router';
import { useDrivers } from '../store';
import { SERIES } from './Charts';
import { Badge, Card, CardHeader, ConfidenceIndicator, OwnershipBadge } from './ui';

const PRESETS: { label: string; weights: Record<PriorityDim, number> }[] = [
  { label: 'Balanced', weights: { intake: 40, effort: 20, cost: 20, quality: 20 } },
  { label: 'Intake first', weights: { intake: 70, effort: 10, cost: 10, quality: 10 } },
  { label: 'Customer effort', weights: { intake: 20, effort: 60, cost: 0, quality: 20 } },
  { label: 'Risk first', weights: { intake: 20, effort: 10, cost: 10, quality: 60 } },
];

const DIM_COLOR: Record<PriorityDim, string> = { intake: SERIES.blue, effort: SERIES.orange, cost: SERIES.aqua, quality: SERIES.violet };

export function Prioritization() {
  const drivers = useDrivers();
  const [w, setW] = useState<Record<PriorityDim, number>>(PRESETS[0].weights);
  const total = Object.values(w).reduce((s, v) => s + v, 0) || 1;

  const ranked = useMemo(() => {
    const raw = drivers
      .filter((d) => DRIVER_RISK[d.id].fixEffort !== 'Shipped')
      .map((d) => {
        const a = AGGREGATES[d.id];
        return {
          d,
          intake: a.cases28d * AVOIDABLE_SHARE[d.id],
          effort: a.humanEscalation + a.recontact7d * 2,
          cost: a.annualAvoidableCost,
          quality: DRIVER_RISK[d.id].risk,
        };
      });
    const max = (k: PriorityDim) => Math.max(...raw.map((r) => r[k])) || 1;
    const m = { intake: max('intake'), effort: max('effort'), cost: max('cost'), quality: max('quality') };
    return raw
      .map((r) => {
        const parts = (Object.keys(m) as PriorityDim[]).map((k) => ({ k, v: ((r[k] / m[k]) * w[k]) / total }));
        return { ...r, parts, score: parts.reduce((s, p) => s + p.v, 0) * 100 };
      })
      .sort((a, b) => b.score - a.score);
  }, [drivers, w, total]);

  return (
    <Card>
      <CardHeader
        title="Fix-first prioritization"
        subtitle="Transparent trade-off between intake reduction, response time, cost and quality. Adjust the weights; the ranking and its reasons update."
      />
      <div className="grid gap-5 p-4 lg:grid-cols-[260px_1fr]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setW(p.weights)}
                className={cx('rounded-full border px-2.5 py-0.5 text-xs', JSON.stringify(p.weights) === JSON.stringify(w) ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-ink-2 hover:bg-slate-50')}
              >
                {p.label}
              </button>
            ))}
          </div>
          {PRIORITY_DIMENSIONS.map((dim) => (
            <label key={dim.id} className="block text-xs">
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: DIM_COLOR[dim.id] }} aria-hidden />
                  {dim.label}
                </span>
                <span className="tabular-nums text-ink-2">{Math.round((w[dim.id] / total) * 100)}%</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={w[dim.id]}
                onChange={(e) => setW((s) => ({ ...s, [dim.id]: Number(e.target.value) }))}
                className="mt-1 w-full accent-brand-500"
                aria-label={`${dim.label} weight`}
              />
              <span className="text-[11px] text-ink-3">{dim.help}</span>
            </label>
          ))}
          <p className="text-[11px] text-ink-3">Shipped interventions are excluded. Risk scores and fix confidence are reviewer inputs, not model output.</p>
        </div>
        <ol className="divide-y divide-line">
          {ranked.map((r, i) => (
            <li key={r.d.id}>
              <button onClick={() => go(`#/support/driver/${r.d.id}`)} className="grid w-full grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3 py-2 text-left hover:bg-slate-50 sm:grid-cols-[24px_minmax(0,180px)_1fr_auto]">
                <span className="text-xs font-semibold tabular-nums text-ink-3">{i + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-ink">{r.d.label}</span>
                  <span className="block text-[11px] text-ink-3">{fmtInt(r.intake)} avoidable / 28d · {fmtMoney(r.cost)}/yr</span>
                </span>
                <span className="col-span-3 flex h-3 overflow-hidden rounded-sm bg-slate-100 sm:col-span-1" aria-label={`Score ${r.score.toFixed(0)}`}>
                  {r.parts.map((p) => (
                    <span key={p.k} style={{ width: `${p.v * 100}%`, background: DIM_COLOR[p.k] }} className="h-full border-r border-white last:border-0" />
                  ))}
                </span>
                <span className="col-start-3 row-start-1 flex items-center gap-2 sm:col-start-4">
                  <span className="w-7 text-right text-sm font-semibold tabular-nums text-ink">{r.score.toFixed(0)}</span>
                  <span className="hidden md:inline"><OwnershipBadge status={r.d.ownershipStatus} /></span>
                  <span className="hidden xl:inline"><ConfidenceIndicator level={DRIVER_RISK[r.d.id].fixConfidence} label="Fix confidence" /></span>
                  <Badge className="hidden xl:inline-flex">Effort {DRIVER_RISK[r.d.id].fixEffort}</Badge>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
