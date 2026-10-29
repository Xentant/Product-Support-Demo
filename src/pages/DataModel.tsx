import { ArrowRight, Plug } from 'lucide-react';
import { Badge, Card, CardHeader, PageHeader } from '../components/ui';
import { RELATIONSHIPS, SAMPLE_NORMALIZED, SOURCE_SYSTEMS } from '../data/sources';

const ENTITIES = [
  'SupportCase', 'AgentConversation', 'SupportDriver', 'SupportSubdriver', 'Trend', 'Evidence', 'ProductOpportunity', 'Hypothesis', 'PortfolioEpic',
  'DeliveryFeature', 'DeliveryStory', 'Dependency', 'Release', 'Metric', 'Measurement', 'Outcome', 'ProductOwner', 'EngineeringTeam',
  'ProductTelemetrySignal', 'ApplicationHealthSignal', 'InfrastructureSignal', 'HelpContentInteraction', 'CustomerSegment',
];

export function DataModel() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture"
        title="Data model & sources"
        description="Synthetic source labels feed mock adapters that normalize records into one shared model. Replacing a mock with a real API client changes only the adapter."
      />
      <Card className="mb-5">
        <CardHeader title="Conceptual source systems" subtitle="Mock adapters, no live integrations" right={<Badge tone="amber">Synthetic</Badge>} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="border-b border-line bg-slate-50/70 text-[11px] uppercase tracking-wide text-ink-3">
              <tr><th className="px-4 py-2">System</th><th className="px-4 py-2">Provides</th><th className="px-4 py-2">Normalized to</th><th className="px-4 py-2">Records</th><th className="px-4 py-2">Last sync</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {SOURCE_SYSTEMS.map((s) => (
                <tr key={s.system}>
                  <td className="px-4 py-2.5 font-semibold text-ink"><span className="inline-flex items-center gap-1.5"><Plug size={13} className="text-ink-3" />{s.system}</span></td>
                  <td className="px-4 py-2.5 text-ink-2">{s.provides.join(', ')}</td>
                  <td className="px-4 py-2.5">{s.entities.map((e) => <code key={e} className="mr-1 rounded bg-slate-100 px-1 text-[11px]">{e}</code>)}</td>
                  <td className="px-4 py-2.5 text-ink-2">{s.records}</td>
                  <td className="px-4 py-2.5 text-ink-3">{s.lastSync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Relationships" subtitle={`${ENTITIES.length} normalized entities`} />
          <ul className="grid gap-1.5 p-4 text-xs sm:grid-cols-2">
            {RELATIONSHIPS.map(([a, b]) => (
              <li key={a + b} className="flex items-center gap-1.5">
                <code className="rounded bg-slate-100 px-1.5 py-0.5">{a}</code>
                <ArrowRight size={12} className="text-ink-3" aria-hidden />
                <code className="rounded bg-slate-100 px-1.5 py-0.5">{b}</code>
              </li>
            ))}
          </ul>
          <div className="border-t border-line px-4 py-3">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">All entities</div>
            <div className="flex flex-wrap gap-1">{ENTITIES.map((e) => <Badge key={e}>{e}</Badge>)}</div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Normalized support event" subtitle="Connects agent performance, analytics, ownership, delivery and outcomes" />
          <pre className="m-4 overflow-auto rounded-md bg-ink p-4 font-mono text-[11.5px] leading-relaxed text-slate-100">{JSON.stringify(SAMPLE_NORMALIZED, null, 2)}</pre>
        </Card>
      </div>
    </>
  );
}
