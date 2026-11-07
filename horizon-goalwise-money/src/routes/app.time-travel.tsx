/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Engine } from "@/lib/engine";
import { gbp, pct, useCoach, type Shock } from "@/lib/coach";
import { FanChart } from "@/components/app/charts";
import { Card, ReadAloud, WhyButton } from "@/components/app/widgets";

export const Route = createFileRoute("/app/time-travel")({ component: TimeTravel });

function presetShocks(p: any): Shock[] {
  const s: Shock[] = [
    { id: "shifts", label: "Lose shifts: −25% for 8 weeks", kind: "income", pct: 0.25, from: 0, to: 56 },
    { id: "boiler", label: "Boiler breaks: £400 in 21 days", kind: "oneoff", amount: 400, day: 21 },
    { id: "rent", label: "Rent +8%", kind: "bill", tag: "rent", mult: 1.08, from: 0 },
    { id: "energy", label: "Energy +20%", kind: "bill", tag: "energy", mult: 1.2, from: 0 },
  ];
  if (p.hasMortgage) s.push({ id: "mortgage", label: "Mortgage fix ends: +£330/month", kind: "monthly", amount: 330, day: 1, from: 30 });
  if (p.fx) s.push({ id: "fx", label: "Currency −10%", kind: "fx", pct: -0.1 });
  return s;
}

function TimeTravel() {
  const c = useCoach();
  const [amt, setAmt] = useState("250");
  const [days, setDays] = useState("30");
  const presets = presetShocks(c.p);
  const on = (id: string) => c.shocks.some((s) => s.id === id);
  const toggle = (s: Shock) => c.setShocks(on(s.id) ? c.shocks.filter((x) => x.id !== s.id) : [...c.shocks, s]);
  const fc = c.fcView;
  const risk = fc.worstPNeg;
  const before = c.fcRaw.worstPNeg;
  const applied = (k: string) => k === "both" ? !!(c.fixes.spread && c.fixes.trimWeekly) : k === "spread" ? !!c.fixes.spread && !c.fixes.trimWeekly : !!c.fixes.trimWeekly && !c.fixes.spread;
  const applyFix = (f: any) => {
    if (applied(f.key)) { c.setFixes({}); return; }
    c.setFixes(f.key === "spread" ? { spread: true } : f.key === "trim" ? { trimWeekly: f.amount } : { spread: true, trimWeekly: f.amount });
  };
  const headline = risk < 0.05
    ? "Your next 90 days look steady."
    : `${Engine.fmtDate(fc.worstDate)} is your riskiest day: ${pct(risk)} chance you dip below £0.`;
  const summary = `Across 1,000 simulated futures, your balance most likely ends around ${gbp(fc.p50[fc.p50.length - 1])} in 90 days. In a bad case (1 in 10) it falls as low as ${gbp(fc.lowestP10)} around ${Engine.fmtDate(fc.lowestP10Date)}.`;

  return (
    <div className="grid gap-6">
      <header><p className="h-eyebrow">Financial time travel</p><h1 className="h-h2 mt-1">Your next 90 days</h1></header>
      <Card id="fc" title={headline} tone={risk >= 0.3 ? "risk" : undefined} actions={<>
        <ReadAloud text={`${headline} ${summary}`} />
        <WhyButton info={{ title: "90-day forecast", inputs: [`Starting balance ${gbp(c.p.balance)}`, `${c.p.income.length} income sources, ${c.p.bills.length} bills, ${c.p.debts.length} debts`, `Flexible spend ${gbp(c.p.varWeekly)} a week`, `${c.shocks.length} what-if shocks on`], rule: "1,000 Monte Carlo paths, day by day: income varies by its usual swing, bills land on their due dates, winter energy rises, annual costs hit in their month.", confidence: "Medium-high for the next few weeks, lower further out. Shaded band = middle 80% of futures.", changeIf: ["Pay dates or amounts change", "A new bill appears", "You apply a fix below"] }} />
      </>}>
        <FanChart fc={fc} label={`Fan chart of your balance for the next 90 days. ${headline}`} />
        <p className="mt-4">{summary}</p>
        {(c.fixes.spread || c.fixes.trimWeekly) && <p className="mt-2 font-semibold h-pos">With your fix: risk {pct(before)} → {pct(risk)}</p>}
      </Card>

      <Card id="shocks" title="What if…?">
        <div className="flex flex-wrap gap-2">
          {presets.map((s) => <button key={s.id} type="button" className="h-chip" aria-pressed={on(s.id)} onClick={() => toggle(s)}>{s.label}</button>)}
          {c.shocks.filter((s) => s.id.startsWith("custom")).map((s) => <button key={s.id} type="button" className="h-chip" aria-pressed="true" onClick={() => toggle(s)}>{s.label} ✕</button>)}
        </div>
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={(e) => {
          e.preventDefault();
          const a = Math.max(1, Number(amt) || 0), d = Math.min(89, Math.max(0, Number(days) || 0));
          c.setShocks([...c.shocks, { id: `custom-${Date.now()}`, label: `${gbp(a)} in ${d} days`, kind: "oneoff", amount: a, day: d }]);
        }}>
          <div><label htmlFor="sh-amt" className="h-label">Custom cost (£)</label><input id="sh-amt" type="number" min={1} className="h-input" value={amt} onChange={(e) => setAmt(e.target.value)} /></div>
          <div><label htmlFor="sh-days" className="h-label">In how many days</label><input id="sh-days" type="number" min={0} max={89} className="h-input" value={days} onChange={(e) => setDays(e.target.value)} /></div>
          <button type="submit" className="h-btn">Add shock</button>
        </form>
      </Card>

      <Card id="fixes" title="Fixes that protect you">
        {c.fixList.length === 0 ? <p>No fixes needed: your risk of dipping below £0 is under 15%.</p> : (
          <div className="grid gap-3 md:grid-cols-3">
            {c.fixList.map((f: any) => (
              <div key={f.key} className={`h-card h-card-primary ${applied(f.key) ? "h-card-ok" : ""}`}>
                <h3 className="h-h3">{f.title}</h3>
                <p className="mt-2">{f.body}</p>
                <p className="mt-3 font-semibold h-num">Risk {pct(before)} → {pct(f.after)}</p>
                <button type="button" className={`h-btn mt-3 ${applied(f.key) ? "" : "h-btn-primary"}`} aria-pressed={applied(f.key)} onClick={() => applyFix(f)}>{applied(f.key) ? "Applied ✓" : "Apply"}</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {risk >= 0.5 && (
        <Card id="signposts" title="Free, confidential help" tone="warn">
          <ul className="grid gap-2">
            <li><a className="h-link" href="https://www.stepchange.org" target="_blank" rel="noopener noreferrer">StepChange debt charity</a>: free debt advice, 0800 138 1111</li>
            <li><a className="h-link" href="https://www.citizensadvice.org.uk" target="_blank" rel="noopener noreferrer">Citizens Advice</a>: help with bills, benefits and rent</li>
            <li>Your bank's hardship team: ask about payment holidays or breathing space</li>
            <li>Struggling to cope? Samaritans, 24/7: 116 123</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
