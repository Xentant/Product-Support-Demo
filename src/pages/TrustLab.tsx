import { ArrowLeft, ArrowRight, Bot, CheckCircle2, ChevronDown, Lock, Play, RotateCcw, ShieldCheck, TriangleAlert, User, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AIGenerated, Badge, Button, Card, CardHeader, EvalStatusBadge, PageHeader, RiskBadge, Section, Tip } from '../components/ui';
import { AGGREGATES } from '../data/drivers';
import { AGENT_QUALITY, SCENARIOS, SCENARIO_BY_ID, TOOLS, type AgentAction, type Scenario, type ScenarioRun } from '../data/trustLab';
import { cx } from '../lib/format';
import { go } from '../lib/router';
import { useStore } from '../store';

const ACTIONS: { id: AgentAction; when: string }[] = [
  { id: 'ANSWER', when: 'Stable, non-account facts with high intent confidence.' },
  { id: 'CLARIFY', when: 'Intent confidence too low to act safely.' },
  { id: 'RETRIEVE', when: 'An approved, versioned source answers it.' },
  { id: 'USE TOOL', when: 'Account-specific state is needed and the customer is authenticated.' },
  { id: 'ESCALATE', when: 'Security, repeated failure, conflicting state or consequential action.' },
  { id: 'REFUSE', when: 'Disclosure or action is unsafe or unauthorized.' },
];

const ACTION_TONE: Record<AgentAction, 'blue' | 'green' | 'amber' | 'violet' | 'neutral' | 'red'> = {
  ANSWER: 'green', CLARIFY: 'neutral', RETRIEVE: 'blue', 'USE TOOL': 'blue', ESCALATE: 'violet', REFUSE: 'amber',
};

export function TrustLab({ scenarioId }: { scenarioId?: string }) {
  const tab = scenarioId === 'quality' ? 'quality' : 'scenarios';
  const scenario = SCENARIO_BY_ID[scenarioId ?? ''] ?? SCENARIO_BY_ID.propagation;
  return (
    <>
      <PageHeader
        eyebrow="Workspace 3 · Agent Trust Lab"
        title="When should the agent answer, retrieve, use a tool, clarify, escalate or refuse?"
        description="Deterministic test harness for the support agent. Every response is graded for grounding, safety and escalation correctness, and every interaction becomes structured product evidence."
      />
      <div role="tablist" className="mb-5 flex gap-1 border-b border-line">
        {[['scenarios', 'Test scenarios', `#/trust-lab/${scenario.id}`], ['quality', 'Agent quality dashboard', '#/trust-lab/quality']].map(([id, label, route]) => (
          <a key={id} role="tab" aria-selected={tab === id} href={route} className={cx('-mb-px border-b-2 px-3 py-2 text-sm font-medium', tab === id ? 'border-brand-500 text-brand-700' : 'border-transparent text-ink-3 hover:text-ink')}>
            {label}
          </a>
        ))}
      </div>
      {tab === 'quality' ? <QualityDashboard /> : <ScenarioWorkbench scenario={scenario} />}
    </>
  );
}

function ScenarioWorkbench({ scenario }: { scenario: Scenario }) {
  const runs = useStore((s) => s.trustRuns);
  return (
    <div className="space-y-4">
      <nav aria-label="Scenarios" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {SCENARIOS.map((s) => (
          <a
            key={s.id}
            href={`#/trust-lab/${s.id}`}
            aria-current={s.id === scenario.id ? 'true' : undefined}
            className={cx(
              'flex min-w-[150px] shrink-0 flex-col gap-1 rounded-lg border bg-white px-3 py-2 shadow-card transition-colors',
              s.id === scenario.id ? 'border-brand-500 ring-1 ring-brand-100' : 'border-line hover:border-slate-300',
            )}
          >
            <span className="flex items-center gap-1.5 text-[11px] text-ink-3">
              Scenario {s.number}
              {runs[s.id] && <CheckCircle2 size={12} className="text-good-600" aria-label="Run" />}
            </span>
            <span className={cx('text-[13px] font-medium leading-tight', s.id === scenario.id ? 'text-brand-700' : 'text-ink')}>{s.title}</span>
            <span className="flex flex-wrap gap-1">
              <Badge tone={ACTION_TONE[s.run.action]}>{s.run.action}</Badge>
              {s.id === 'propagation' && <Badge tone="amber">Primary</Badge>}
            </span>
          </a>
        ))}
      </nav>
      <details className="rounded-lg border border-line bg-white px-4 py-2.5 text-xs shadow-card">
        <summary className="cursor-pointer text-[13px] font-semibold text-ink">Decision policy: six possible actions</summary>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((a) => (
            <li key={a.id}>
              <Badge tone={ACTION_TONE[a.id]}>{a.id}</Badge>
              <p className="mt-0.5 text-ink-2">{a.when}</p>
            </li>
          ))}
        </ul>
      </details>
      <ScenarioView key={scenario.id} scenario={scenario} />
    </div>
  );
}

function ScenarioView({ scenario }: { scenario: Scenario }) {
  const runs = useStore((s) => s.trustRuns);
  const markRun = useStore((s) => s.markTrustRun);
  const [variant, setVariant] = useState(false);
  const run: ScenarioRun = variant && scenario.variant ? scenario.variant.run : scenario.run;
  const message = variant && scenario.variant ? scenario.variant.message : scenario.message;
  const totalSteps = 3 + run.toolCalls.length;
  const [step, setStep] = useState(runs[scenario.id] ? totalSteps : 0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (step >= totalSteps) {
      setRunning(false);
      markRun(scenario.id);
      return;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setStep((s) => s + 1), reduce ? 0 : 520);
    return () => clearTimeout(t);
  }, [running, step, totalSteps, markRun, scenario.id]);

  const start = () => {
    setStep(0);
    setRunning(true);
  };
  const toggleVariant = (v: boolean) => {
    setVariant(v);
    setStep(0);
    setRunning(false);
  };
  const shown = (n: number) => step >= n;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <div className="text-[11px] text-ink-3">Scenario {scenario.number} · {scenario.driver} › {scenario.subdriver}</div>
              <h2 className="text-base font-semibold text-ink">{scenario.title}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <RiskBadge level={scenario.risk} />
              <Button variant="primary" size="sm" icon={step >= totalSteps ? <RotateCcw size={14} /> : <Play size={14} />} onClick={start} disabled={running}>
                {step >= totalSteps ? 'Run again' : running ? 'Running…' : 'Run scenario'}
              </Button>
            </div>
          </div>
          {scenario.variant && (
            <div className="flex flex-wrap items-center gap-2 border-b border-line bg-slate-50 px-4 py-2 text-xs">
              <span className="font-medium text-ink">Conditions:</span>
              <div role="group" className="inline-flex rounded-md border border-line bg-white p-0.5">
                <button onClick={() => toggleVariant(false)} aria-pressed={!variant} className={cx('rounded px-2 py-0.5', !variant ? 'bg-brand-500 text-white' : 'text-ink-2')}>20 minutes elapsed</button>
                <button onClick={() => toggleVariant(true)} aria-pressed={variant} className={cx('rounded px-2 py-0.5', variant ? 'bg-brand-500 text-white' : 'text-ink-2')}>48 minutes elapsed</button>
              </div>
              <span className="text-ink-3">{variant ? scenario.variant.description : 'Within the documented 30-minute propagation window.'}</span>
            </div>
          )}
          <div className="grid gap-4 p-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-ink-2"><User size={14} /></span>
                <div className="rounded-lg rounded-tl-none bg-slate-100 px-3.5 py-2.5 text-sm text-ink">{message}</div>
              </div>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-ink-3">Authentication</dt>
              <dd className="flex items-center gap-1 font-medium text-ink">
                {scenario.authState === 'unauthenticated' ? <TriangleAlert size={12} className="text-warn-600" /> : <Lock size={12} className="text-good-600" />}
                {scenario.authState}
              </dd>
              <dt className="text-ink-3">Segment</dt><dd className="text-ink">{scenario.segment}</dd>
              <dt className="text-ink-3">Account context</dt><dd className="text-ink">{scenario.accountContext.join(' · ')}</dd>
              <dt className="text-ink-3">Previous</dt><dd className="text-ink">{scenario.previousInteractions.join(' · ')}</dd>
              <dt className="text-ink-3">Tools available</dt>
              <dd className="flex flex-wrap gap-1">{scenario.availableTools.map((t) => <code key={t} className="rounded bg-slate-100 px-1 text-[10.5px] text-ink-2">{t}</code>)}</dd>
            </dl>
            <div>
              <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                Decision factors <Tip text="What the agent weighs before choosing an action: authentication, security and financial impact, tools, prior failures, frustration, consequence of a wrong answer." />
              </div>
              <ul className="space-y-1 text-xs">
                {scenario.considerations.map((c) => (
                  <li key={c.factor} className="flex items-start justify-between gap-2">
                    <span className="text-ink-2">{c.factor}: <span className="text-ink">{c.value}</span></span>
                    <span className={cx('shrink-0 rounded px-1.5 text-[10px] font-medium uppercase', c.weight === 'high' ? 'bg-warn-50 text-warn-700' : c.weight === 'medium' ? 'bg-slate-100 text-ink-2' : 'bg-slate-50 text-ink-3')}>{c.weight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {step === 0 && !running ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm text-ink-2">
            Press <strong className="text-ink">Run scenario</strong> to watch the agent decide, call tools, respond and get evaluated.
          </div>
        ) : (
          <Card>
            <CardHeader title="Agent trace" subtitle="Simulated tool calls and results. Secret key material is never returned by any tool." right={<AIGenerated label="Simulated agent" />} />
            <ol className="space-y-3 p-4">
              {shown(1) && (
                <TraceItem icon={<ShieldCheck size={14} />} title="Decision">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge tone={ACTION_TONE[run.action]} className="text-xs">{run.action}</Badge>
                    {run.secondaryAction && <><span className="text-ink-3">with</span><Badge tone={ACTION_TONE[run.secondaryAction]}>{run.secondaryAction}</Badge></>}
                  </div>
                </TraceItem>
              )}
              {run.toolCalls.map((tc, i) =>
                shown(2 + i) ? (
                  <TraceItem key={tc.tool + i} icon={<Wrench size={14} />} title={<><code className="text-[12.5px]">{tc.tool}</code> <span className="font-normal text-ink-3">· {tc.latencyMs} ms</span></>} right={<Badge tone="green">{tc.status === 'verified_success' ? 'Verified success' : 'Success'}</Badge>}>
                    <ToolPayload args={tc.args} result={tc.result} />
                  </TraceItem>
                ) : null,
              )}
              {shown(2 + run.toolCalls.length) && (
                <TraceItem icon={<Bot size={14} />} title="Agent response">
                  <p className="text-sm text-ink">{run.response.summary}</p>
                  {(run.response.evidence || run.response.inference || run.response.recommended) && (
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      {run.response.evidence && <ResponseBlock tone="blue" title="Evidence" items={run.response.evidence} />}
                      {run.response.inference && <ResponseBlock tone="violet" title="Inference" items={run.response.inference} />}
                      {run.response.recommended && <ResponseBlock tone="green" title="Recommended action" items={run.response.recommended} />}
                    </div>
                  )}
                  {run.response.note && <p className="mt-2 text-xs text-ink-3">{run.response.note}</p>}
                </TraceItem>
              )}
              {shown(3 + run.toolCalls.length) && (
                <TraceItem icon={<CheckCircle2 size={14} />} title="Outcome">
                  <dl className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
                    <div><dt className="text-ink-3">Escalation decision</dt><dd className="text-ink">{run.escalationDecision}</dd></div>
                    <div><dt className="text-ink-3">Final disposition</dt><dd className="font-medium text-ink">{run.disposition}</dd></div>
                    <div><dt className="text-ink-3">Product-friction classification</dt><dd className="text-ink">{run.frictionClass} {run.productFrictionSuspected && <Badge tone="amber" className="ml-1">productFrictionSuspected</Badge>}</dd></div>
                    <div><dt className="text-ink-3">Driver › subdriver</dt><dd className="text-ink">{scenario.driver} › {scenario.subdriver}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-ink-3">Evidence contribution</dt><dd className="text-ink">{run.evidenceContribution}</dd></div>
                  </dl>
                  {run.escalation && <EscalationPackageView pkg={run.escalation} />}
                  {scenario.id === 'propagation' && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-brand-50 px-3 py-2 text-xs text-brand-700">
                      This interaction is one of {AGGREGATES.api_key_management.cases28d.toLocaleString()} API Key Management cases in the last 28 days.
                      <Button size="sm" variant="primary" icon={<ArrowLeft size={13} />} onClick={() => go('#/support/driver/api_key_management')}>Return to aggregated driver</Button>
                    </div>
                  )}
                </TraceItem>
              )}
            </ol>
          </Card>
        )}
      </div>

      <EvaluationPanel run={run} complete={step >= totalSteps} />
    </div>
  );
}

function TraceItem({ icon, title, right, children }: { icon: JSX.Element; title: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="fade-in flex gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-ink-2">{icon}</span>
      <div className="min-w-0 flex-1 rounded-md border border-line p-3">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-ink">{title}{right}</div>
        {children}
      </div>
    </li>
  );
}

function ToolPayload({ args, result }: { args: Record<string, unknown>; result: Record<string, unknown> }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="text-[11.5px]">
      <div className="text-ink-3">args <code className="text-ink-2">{JSON.stringify(args)}</code></div>
      <button className="mt-1 inline-flex items-center gap-1 text-ink-3 hover:text-ink" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <ChevronDown size={12} className={cx('transition-transform', !open && '-rotate-90')} /> result
      </button>
      {open && <pre className="mt-1 max-h-56 overflow-auto rounded bg-ink px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-100">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

function ResponseBlock({ tone, title, items }: { tone: 'blue' | 'violet' | 'green'; title: string; items: string[] }) {
  const cls = { blue: 'border-brand-100 bg-brand-50/50', violet: 'border-violet-200 bg-violet-50/50', green: 'border-green-200 bg-good-50/50' }[tone];
  return (
    <div className={cx('rounded-md border p-2.5', cls)}>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2">{title}</div>
      <ul className="list-disc space-y-0.5 pl-4 text-xs text-ink">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </div>
  );
}

function EscalationPackageView({ pkg }: { pkg: NonNullable<ScenarioRun['escalation']> }) {
  const rows: [string, string][] = [
    ['Customer intent', pkg.customerIntent],
    ['Authentication state', pkg.authenticationState],
    ['Driver', pkg.driver],
    ['Subdriver', pkg.subdriver],
    ['Troubleshooting performed', pkg.troubleshooting.join('; ')],
    ['Tool calls', pkg.toolCalls.join('; ')],
    ['Tool results', pkg.toolResults.join('; ')],
    ['Failed steps', pkg.failedSteps.join('; ') || 'None'],
    ['Current customer impact', pkg.customerImpact],
    ['Suspected contributing condition', pkg.suspectedCondition],
    ['Urgency', pkg.urgency],
    ['Recommended queue', pkg.queue],
    ['Information still needed', pkg.infoNeeded.join('; ')],
    ['Product-friction classification', pkg.frictionClass],
  ];
  return (
    <div className="mt-3 rounded-md border border-violet-200 bg-violet-50/40 p-3">
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-ink">
        Structured escalation package <Badge tone="violet">{rows.length} fields</Badge>
      </div>
      <dl className="grid gap-x-4 gap-y-1 text-[11.5px] sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}><dt className="text-ink-3">{k}</dt><dd className="text-ink">{v}</dd></div>
        ))}
      </dl>
    </div>
  );
}

function EvaluationPanel({ run, complete }: { run: ScenarioRun; complete: boolean }) {
  return (
    <Card className="h-fit xl:sticky xl:top-20">
      <CardHeader title="Agent evaluation" subtitle="Graded against the decision policy" right={<AIGenerated label="Auto-eval + human review" />} />
      {complete ? (
        <>
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <div className="text-3xl font-semibold tabular-nums text-ink">{run.qualityScore}</div>
            <div className="text-xs text-ink-2">Overall quality score<br /><span className="text-ink-3">out of 100</span></div>
          </div>
          <ul className="divide-y divide-line">
            {run.evaluation.map((e) => (
              <li key={e.id} className="px-4 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-ink">{e.label}</span>
                  <EvalStatusBadge status={e.status} />
                </div>
                <p className="mt-0.5 text-[11px] text-ink-3">{e.note}</p>
              </li>
            ))}
          </ul>
          {run.action === 'ESCALATE' && (
            <p className="m-4 rounded-md bg-violet-50 px-3 py-2 text-[11px] text-violet-700">Escalation is scored as correct here. It is the safest outcome, not a failure to deflect.</p>
          )}
        </>
      ) : (
        <p className="px-4 py-8 text-center text-xs text-ink-3">Evaluation appears when the run completes.</p>
      )}
    </Card>
  );
}

function QualityDashboard() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-warn-50 p-4">
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-warn-700" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-ink">Deflection without verified resolution can hide customer failure.</p>
          <p className="mt-1 text-sm text-ink-2">
            An agent that prevents access to a human without solving the customer’s problem may create apparent deflection while increasing customer effort,
            recontact, churn, or hidden dissatisfaction.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {AGENT_QUALITY.map((m) => (
          <div key={m.id} className="rounded-lg border border-line bg-white px-4 py-3 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-ink-3">{m.label}</span>
              {m.status === 'healthy' && <Badge tone="green">Within</Badge>}
              {m.status === 'watch' && <Badge tone="amber">Watch</Badge>}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-ink">{m.value}</div>
            {m.threshold && <div className="text-[11px] font-medium text-ink-2">Threshold {m.threshold}*</div>}
            <div className="mt-0.5 text-[11px] text-ink-3">{m.note}</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-ink-3">
        * Illustrative demonstration thresholds, not universal production standards: unsupported consequential claims &lt; 0.5%, correct security escalation &gt; 99%,
        false resolution &lt; 2%, tool execution success &gt; 98%.
      </p>
      <Card>
        <CardHeader title="Simulated tools" subtitle="Structured, permission-scoped. No consequential action is shown as complete without a verified success result." />
        <ul className="grid gap-px bg-line sm:grid-cols-2">
          {TOOLS.map((t) => (
            <li key={t.name} className="bg-white px-4 py-2.5 text-xs">
              <code className="font-semibold text-ink">{t.name}</code>
              <p className="text-ink-2">{t.description}</p>
            </li>
          ))}
        </ul>
      </Card>
      <Section title="Next">
        <Button variant="secondary" icon={<ArrowRight size={14} />} onClick={() => go('#/trust-lab/propagation')}>Run the primary API-key scenario</Button>
      </Section>
    </div>
  );
}
