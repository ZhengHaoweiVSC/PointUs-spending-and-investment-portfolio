/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Engine } from "@/lib/engine";
import { gbp, pct, useCoach } from "@/lib/coach";
import { GoalFan } from "@/components/app/charts";
import { Card, WhyButton } from "@/components/app/widgets";

export const Route = createFileRoute("/app/goals")({ component: Goals });

function Goals() {
  const c = useCoach();
  const goal = c.p.goals?.[0] ?? { name: "Emergency fund", target: 3000, year: new Date().getFullYear() + 3 };
  const [monthly, setMonthly] = useState(Math.max(25, Math.round(Math.max(0, c.sc.summary.surplus) * 0.5 / 5) * 5));
  const [target, setTarget] = useState(goal.target);
  const [year, setYear] = useState(goal.year);
  const years = Math.max(0.5, year - Engine.todayUTC().getUTCFullYear());
  const sim = useMemo(() => Engine.goalSim({ current: c.store.invested, monthly, target, years, band: c.rp.band }), [c.store.invested, monthly, target, years, c.rp.band]);
  const arrival = useMemo(() => {
    const long = Engine.goalSim({ current: c.store.invested, monthly, target, years: 40, band: c.rp.band, paths: 600 });
    const hit = long.fan.find((f: any) => f.p50 >= target);
    return hit ? Engine.todayUTC().getUTCFullYear() + hit.year : null;
  }, [c.store.invested, monthly, target, c.rp.band]);
  const saveGoal = () => c.update({ engine: { ...c.p, goals: [{ ...goal, target, year }] } });

  return (
    <div className="grid gap-6">
      <header><p className="h-eyebrow">Goal simulator</p><h1 className="h-h2 mt-1">{goal.name}</h1></header>
      <Card id="sim" title={`${pct(sim.prob)} chance of reaching ${gbp(target)} by ${year}`} actions={
        <WhyButton info={{ title: "Goal simulator", inputs: [`${gbp(monthly)} a month`, `Start ${gbp(c.store.invested)}`, `${c.rp.label} mix`, `${years} years`], rule: "2,000 simulated paths of monthly real (after-inflation) returns for your band's mix.", confidence: "Illustrative, not a forecast.", changeIf: ["You change the monthly amount", "Your risk band changes", "You move the date"] }} />}>
        <label htmlFor="g-monthly" className="h-label">Monthly contribution: {gbp(monthly)}</label>
        <input id="g-monthly" type="range" min={0} max={2000} step={5} value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="h-range" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="g-target" className="h-label">Target (£)</label><input id="g-target" type="number" min={100} className="h-input" value={target} onChange={(e) => setTarget(Math.max(100, Number(e.target.value) || 0))} onBlur={saveGoal} /></div>
          <div><label htmlFor="g-year" className="h-label">Target year</label><input id="g-year" type="number" min={new Date().getFullYear()} max={2080} className="h-input" value={year} onChange={(e) => setYear(Number(e.target.value) || year)} onBlur={saveGoal} /></div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div><p className="text-sm">Probability</p><p className="h-head text-3xl font-bold h-num">{pct(sim.prob)}</p></div>
          <div><p className="text-sm">Likely arrival (median)</p><p className="h-head text-3xl font-bold h-num">{arrival ?? "Not within 40 years"}</p></div>
          <div><p className="text-sm">Mix</p><p className="h-head text-3xl font-bold">{c.rp.label}</p></div>
        </div>
        <div className="mt-6"><GoalFan fan={sim.fan} target={target} label={`Fan chart: likely value of your goal pot each year until ${year}`} /></div>
        <p className="mt-4 text-sm h-muted">Assumptions: cash 3.5%, bonds 4%, shares 6.5% a year on average; inflation 2.5%. Figures are shown in today's money. Illustrative, not a forecast.</p>
      </Card>
    </div>
  );
}
