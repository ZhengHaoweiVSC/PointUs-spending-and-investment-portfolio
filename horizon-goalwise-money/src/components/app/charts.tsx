/* eslint-disable @typescript-eslint/no-explicit-any */
import { Engine } from "@/lib/engine";

const W = 720, H = 300, PL = 56, PR = 16, PT = 20, PB = 32;

function scale(min: number, max: number, a: number, b: number) {
  const span = max - min || 1;
  return (v: number) => a + ((v - min) / span) * (b - a);
}

export function FanChart({ fc, compact = false, label }: { fc: any; compact?: boolean; label: string }) {
  const n = fc.p50.length;
  const lo = Math.min(0, ...fc.p10), hi = Math.max(0, ...fc.p90);
  const x = scale(0, n - 1, PL, W - PR);
  const y = scale(lo, hi, H - PB, PT);
  const band = fc.p90.map((v: number, i: number) => `${x(i)},${y(v)}`).join(" ") + " " +
    fc.p10.map((v: number, i: number) => `${x(i)},${y(v)}`).reverse().join(" ");
  const line = fc.p50.map((v: number, i: number) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const ticks = [lo, (lo + hi) / 2, hi];
  const wx = x(fc.worstDay);
  return (
    <div className="h-scroll-x">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className={compact ? "w-full min-w-[320px]" : "w-full min-w-[520px]"}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PL} x2={W - PR} y1={y(t)} y2={y(t)} className="h-svg-grid" />
            <text x={PL - 6} y={y(t) + 4} textAnchor="end" className="h-svg-text">£{Math.round(t).toLocaleString("en-GB")}</text>
          </g>
        ))}
        {[0, 30, 60, n - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 10} textAnchor="middle" className="h-svg-text">{Engine.fmtDate(fc.dates[i])}</text>
        ))}
        <polygon points={band} className="h-svg-band" />
        <path d={line} className="h-svg-line" />
        <line x1={PL} x2={W - PR} y1={y(0)} y2={y(0)} className="h-svg-zero" />
        {fc.worstPNeg > 0.01 && (
          <g>
            <line x1={wx} x2={wx} y1={PT} y2={H - PB} className="h-svg-marker" />
            <text x={Math.min(wx + 6, W - 140)} y={PT + 12} className="h-svg-risk-text">
              {Engine.fmtDate(fc.worstDate)}: {Math.round(fc.worstPNeg * 100)}% risk
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function GoalFan({ fan, target, label }: { fan: { year: number; p10: number; p50: number; p90: number }[]; target: number; label: string }) {
  const n = fan.length;
  const hi = Math.max(target * 1.1, ...fan.map((f) => f.p90));
  const x = scale(0, Math.max(1, n - 1), PL, W - PR);
  const y = scale(0, hi, H - PB, PT);
  const band = fan.map((f, i) => `${x(i)},${y(f.p90)}`).join(" ") + " " + fan.map((f, i) => `${x(i)},${y(f.p10)}`).reverse().join(" ");
  const line = fan.map((f, i) => `${i ? "L" : "M"}${x(i)},${y(f.p50)}`).join(" ");
  const yr = new Date().getFullYear();
  return (
    <div className="h-scroll-x">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="w-full min-w-[320px]">
        {[0, hi / 2, hi].map((t) => (
          <g key={t}><line x1={PL} x2={W - PR} y1={y(t)} y2={y(t)} className="h-svg-grid" />
            <text x={PL - 6} y={y(t) + 4} textAnchor="end" className="h-svg-text">£{Math.round(t / 1000)}k</text></g>
        ))}
        {fan.filter((_, i) => i % Math.max(1, Math.ceil(n / 6)) === 0 || i === n - 1).map((f) => (
          <text key={f.year} x={x(f.year)} y={H - 10} textAnchor="middle" className="h-svg-text">{yr + f.year}</text>
        ))}
        <polygon points={band} className="h-svg-band" />
        <path d={line} className="h-svg-line" />
        <line x1={PL} x2={W - PR} y1={y(target)} y2={y(target)} className="h-svg-target" />
        <text x={W - PR} y={y(target) - 6} textAnchor="end" className="h-svg-text">Goal £{target.toLocaleString("en-GB")}</text>
      </svg>
    </div>
  );
}

const SEG = ["h-svg-ok", "h-svg-ink", "h-svg-warn", "h-svg-muted"];
export function Donut({ parts, label }: { parts: { label: string; value: number }[]; label: string }) {
  const r = 70, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={label} className="h-48 w-48 max-w-full">
      <circle cx="100" cy="100" r={r} strokeWidth="32" className="h-svg-track" />
      {parts.map((p, i) => {
        const len = p.value * c;
        const el = <circle key={p.label} cx="100" cy="100" r={r} strokeWidth="32" className={SEG[i % SEG.length]}
          strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} transform="rotate(-90 100 100)" />;
        off += len;
        return el;
      })}
    </svg>
  );
}
export const SEG_FILL = ["h-fill-ok", "h-fill-ink", "h-fill-warn", "h-fill-muted"];

export function ScoreRing({ value, label }: { value: number; label: string }) {
  const r = 52, c = 2 * Math.PI * r, len = (value / 100) * c;
  const cls = value >= 70 ? "h-svg-ok" : value >= 40 ? "h-svg-warn" : "h-svg-risk";
  return (
    <svg viewBox="0 0 130 130" role="img" aria-label={`${label}: ${value} out of 100`} className="h-32 w-32">
      <circle cx="65" cy="65" r={r} strokeWidth="12" className="h-svg-track" />
      <circle cx="65" cy="65" r={r} strokeWidth="12" className={cls} strokeDasharray={`${len} ${c - len}`} transform="rotate(-90 65 65)" />
      <text x="65" y="74" textAnchor="middle" className="h-svg-text" fontSize="30" fontWeight="700">{value}</text>
    </svg>
  );
}

export function Bar({ value, tone = "ok", label }: { value: number; tone?: "ok" | "warn" | "risk" | "ink"; label: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="h-meter block w-full" role="img" aria-label={label}>
      <rect x="0" y="0" width={v * 100} height="8" className={`h-fill-${tone}`} />
    </svg>
  );
}
