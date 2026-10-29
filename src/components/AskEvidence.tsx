import { ArrowUpRight, FileSearch, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { QUESTIONS } from '../data/evidenceQA';
import { cx } from '../lib/format';
import { useDrivers, useStore } from '../store';
import { AIGenerated, Badge, ConfidenceIndicator } from './ui';

export function AskEvidencePanel() {
  const open = useStore((s) => s.askOpen);
  const initial = useStore((s) => s.askQuestion);
  const close = useStore((s) => s.closeAsk);
  const approved = useStore((s) => s.opportunityStatus === 'approved');
  const drivers = useDrivers();
  const [qid, setQid] = useState<string | null>(null);

  useEffect(() => {
    if (open) setQid(initial ?? null);
  }, [open, initial]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [close]);

  if (!open) return null;
  const q = QUESTIONS.find((x) => x.id === qid);
  const ans = q?.answer({ approved, unownedDrivers: drivers.filter((d) => d.ownershipStatus === 'unowned').map((d) => d.label) });

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Ask the Evidence">
      <div className="absolute inset-0 bg-ink/25" onClick={close} aria-hidden />
      <div className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-pop">
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-base font-semibold text-ink"><FileSearch size={17} /> Ask the Evidence</div>
            <p className="mt-0.5 text-xs text-ink-3">Queries the same synthetic dataset shown in the dashboard. Answers cite where the evidence lives.</p>
          </div>
          <button onClick={close} className="rounded p-1 text-ink-3 hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="border-b border-line px-5 py-3">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-3">Evidence queries</div>
          <div className="flex flex-wrap gap-1.5">
            {QUESTIONS.map((x) => (
              <button
                key={x.id}
                onClick={() => setQid(x.id)}
                aria-pressed={qid === x.id}
                className={cx('rounded-full border px-2.5 py-1 text-left text-xs', qid === x.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-ink-2 hover:border-slate-300 hover:bg-slate-50')}
              >
                {x.text}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!q || !ans ? (
            <p className="py-10 text-center text-sm text-ink-3">Select a query above.</p>
          ) : (
            <div className="fade-in space-y-4" key={q.id}>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Query</div>
                <div className="text-sm font-semibold text-ink">{q.text}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <AIGenerated />
                <ConfidenceIndicator level={ans.confidence} label="Confidence" />
              </div>
              <Block title="Direct response" tone="ink"><p className="text-sm text-ink">{ans.direct}</p></Block>
              <Block title="Evidence (from the dashboard)" tone="blue">
                <ul className="list-disc space-y-1 pl-4 text-xs text-ink">{ans.evidence.map((e) => <li key={e}>{e}</li>)}</ul>
              </Block>
              <Block title="Inference" tone="violet">
                <ul className="list-disc space-y-1 pl-4 text-xs text-ink">{ans.inference.map((e) => <li key={e}>{e}</li>)}</ul>
              </Block>
              <Block title="Uncertainty" tone="amber"><p className="text-xs text-ink">{ans.uncertainty}</p></Block>
              {ans.nextAction && <Block title="Recommended next action" tone="green"><p className="text-xs text-ink">{ans.nextAction}</p></Block>}
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-3">Sources in this app</div>
                <div className="flex flex-wrap gap-1.5">
                  {ans.citations.map((c) => (
                    <a key={c.route} href={c.route} onClick={close} className="inline-flex items-center gap-1 rounded border border-line px-2 py-1 text-xs text-brand-700 hover:bg-brand-50">
                      {c.label} <ArrowUpRight size={12} />
                    </a>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-ink-3">Recommendations are advisory. Consequential decisions require human approval.</p>
            </div>
          )}
        </div>
        <div className="border-t border-line px-5 py-2.5 text-[11px] text-ink-3">
          <Badge>Pre-authored</Badge> <span className="ml-1">Answers are deterministic for this prototype. No live model is called.</span>
        </div>
      </div>
    </div>
  );
}

function Block({ title, tone, children }: { title: string; tone: 'ink' | 'blue' | 'violet' | 'amber' | 'green'; children: React.ReactNode }) {
  const border = { ink: 'border-l-ink', blue: 'border-l-brand-500', violet: 'border-l-violet-500', amber: 'border-l-amber-500', green: 'border-l-green-600' }[tone];
  return (
    <div className={cx('rounded-r-md border-l-[3px] bg-slate-50 px-3 py-2', border)}>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-2">{title}</div>
      {children}
    </div>
  );
}
