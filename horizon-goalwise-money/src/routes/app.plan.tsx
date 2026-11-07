/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { Engine } from "@/lib/engine";
import { gbp, useCoach } from "@/lib/coach";
import { Card } from "@/components/app/widgets";

export const Route = createFileRoute("/app/plan")({ component: Plan });

function Plan() {
  const c = useCoach();
  const ticks = c.store.plan ?? {};
  const steps = [
    { id: "fixes", text: "Apply the fixes for your riskiest day in Time Travel" },
    { id: "starter", text: `Build a starter buffer of ${gbp(c.sc.starter)}` },
    { id: "support", text: "Do the three support checks in Help" },
    { id: "debt", text: "Pay down anything above 15% APR" },
    { id: "full", text: `Grow your buffer to ${c.sc.fullTarget} months of essentials (${gbp(c.sc.fullTarget * c.sc.summary.essentials)})` },
    { id: "wrapper", text: "Open the right tax-free wrapper for your goal" },
    { id: "auto", text: "Set up an automatic monthly contribution" },
  ];
  const loss = Engine.badYearLossPer1000(c.rp.band);
  return (
    <div className="grid gap-6">
      <header><p className="h-eyebrow">Your plan</p><h1 className="h-h2 mt-1">Step by step</h1></header>
      <Card id="check" title="Checklist">
        <ul className="grid gap-1">
          {steps.map((s) => (
            <li key={s.id}>
              <label className="h-check">
                <input type="checkbox" checked={!!ticks[s.id]} onChange={(e) => c.update({ plan: { ...ticks, [s.id]: e.target.checked } })} />
                <span className={ticks[s.id] ? "line-through h-muted" : ""}>{s.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </Card>
      <Card id="ladder" title="Resilience Ladder">
        <ol className="grid gap-2">
          {[...Engine.RUNGS].reverse().map((r: any) => (
            <li key={r.n} className="h-ladder-rung" data-current={r.n === c.sc.rung} data-done={r.n < c.sc.rung}>
              <span className="h-head text-2xl font-bold">{r.n}</span>
              <div><p className="font-semibold">{r.name}{r.n === c.sc.rung ? " · you are here" : ""}</p><p className="text-sm">{r.goal}</p></div>
            </li>
          ))}
        </ol>
      </Card>
      <Card id="wrap" title="Tax-free wrappers for you">
        <ul className="grid gap-2 list-[square] pl-5">{Engine.wrappers(c.p, c.rp).map((w: string) => <li key={w}>{w}</li>)}</ul>
      </Card>
      <Card id="bad" title="What a bad year could look like">
        <p>In a bad year (about 1 in 20), a {c.rp.label} mix could fall by about <strong className="h-num">{gbp(loss)}</strong> for every £1,000 invested. Only invest money you won't need for at least {c.rp.horizon}.</p>
      </Card>
    </div>
  );
}
