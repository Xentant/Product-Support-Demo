export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US');
export const fmtPct = (n: number, digits = 0) => `${n.toFixed(digits)}%`;
export const fmtSigned = (n: number, digits = 0) => {
  const r = Number(n.toFixed(digits));
  return `${r > 0 ? '+' : r < 0 ? '−' : ''}${Math.abs(r).toFixed(digits)}%`;
};
export const fmtRate = (n: number) => (n >= 10 ? n.toFixed(0) : n.toFixed(1));
export const fmtMoney = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n.toFixed(0)}`;

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
