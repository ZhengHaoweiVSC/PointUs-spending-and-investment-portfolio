/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Engine } from "@/lib/engine";
import { gbp, pct, useCoach } from "@/lib/coach";
import { contributionSplit } from "@/lib/build-profile";
import { PROXIES, useNews } from "@/lib/market-hooks";
import { Card, ReadAloud, WhyButton } from "@/components/app/widgets";
import { Bar, GoalFan, ScoreRing } from "@/components/app/charts";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { useDayMove } from "@/components/app/ChatWidget";
import { meaningFor, tagNews } from "@/lib/news";
import { t } from "@/lib/i18n";

export const Route = createFileRoute("/app/")({ component: Dashboard });

const KEYS = ["equity", "bonds", "cash"] as const;

export function useGoal() {
  const c = useCoach();
  const goal = c.p.goals?.[0];
  const surplus = Math.max(0, c.sc.summary.surplus);
  const share = (c.store.surplusPct ?? 50) / 100;
  const split = contributionSplit(c.sc.rung);
  const monthly = Math.round(surplus * share * split.invest);
  return useMemo(() => {
    if (!goal) return null;
    const years = Math.max(0.5, goal.year - Engine.todayUTC().getUTCFullYear());
    const args = { current: c.store.invested, target: goal.target, years, band: c.rp.band };
    const sim = Engine.goalSim({ ...args, monthly });
    const long = Engine.goalSim({ ...args, monthly, years: 40, paths: 600 });
    const hit = long.fan.find((f: any) => f.p50 >= goal.target);
    const need = { p50: Engine.contributionFor(0.5, args), p75: Engine.contributionFor(0.75, args), p90: Engine.contributionFor(0.9, args) };
    return { goal, years, sim, monthly, arrival: hit ? Engine.todayUTC().getUTCFullYear() + hit.year : null, need };
  }, [goal, c.store.invested, c.rp.band, monthly]);
}

function Dashboard() {
  const c = useCoach();
  const { by } = useDayMove();
  const mix = c.rp.mix as Record<(typeof KEYS)[number], number>;
  const inv = c.store.invested;
  const rows = KEYS.map((k) => {
    const s = by[PROXIES[k]];
    const base = inv * mix[k];
    return { k, label: (Engine.ASSETS as any)[k].label, sym: PROXIES[k], w: mix[k], price: s?.price ?? null, dp: s?.changePct ?? null, value: base * (1 + (s?.changePct ?? 0) / 100) };
  });
  const total = rows.reduce((a, r) => a + r.value, 0);
  const drift = total > 0 ? rows.map((r) => ({ ...r, cur: r.value / total, gap: (r.value / total - r.w) * 100 })) : [];
  const off = drift.filter((d) => Math.abs(d.gap) > 5);

  const surplus = c.sc.summary.surplus;
  const [pctShare, setPctShare] = useState(c.store.surplusPct ?? 50);
  const monthlyPot = Math.max(0, surplus) * (pctShare / 100);
  const split = contributionSplit(c.sc.rung);
  const g = useGoal();
  const news = useNews();
  const top3 = (news.data?.data ?? []).slice(0, 3);
  const rung = Engine.RUNGS[c.sc.rung - 1];

  return (
    <div className="grid gap-6">
      <PortfolioView eyebrow={`Hello ${c.p.name}`} label={`${c.rp.label} mix`} band={c.rp.band} mix={mix} demo={c.mode === "demo"} actions={<>
        <ReadAloud text={`Your ${c.rp.label} mix is ${pct(mix.equity)} global shares, ${pct(mix.bonds)} bonds and ${pct(mix.cash)} cash-like.`} />
        <WhyButton info={{ title: "Your portfolio mix", inputs: [`Goal: ${c.p.goals?.[0]?.name ?? "none"} in ${c.rp.years} years`, `Risk capacity ${c.rp.capacity}/5 (${c.rp.reasons.join(", ")})`, `Risk attitude ${c.rp.attitude}/5 from your 3 answers`], rule: "We take the LOWER of your capacity for risk and your attitude to risk, then use that band's model mix of cash, bonds and global shares.", confidence: "High for the band choice (it is a rule). Market returns themselves are uncertain.", changeIf: ["Your goal date moves", "Your safety buffer reaches 3 months", "Your income becomes steadier", "You answer the risk questions differently"] }} />
      </>} />

      <Card id="split" title="Monthly contribution split" actions={<WhyButton info={{ title: "Your contribution split", inputs: [`Resilience Ladder rung ${c.sc.rung}: ${rung.name}`, `Monthly surplus ${gbp(surplus)}`, `Share you set aside: ${pctShare}%`], rule: "Rung 1–2: 100% to safety buffer. Rung 3: 70% to costly debt, 30% buffer. Rung 4: 50% buffer, 50% portfolio. Rung 5: 100% portfolio. Protect first, then grow.", confidence: "High: this is a fixed, ethical rule, not a prediction.", changeIf: ["You move up the ladder", "Your surplus changes", "You change the share you set aside"] }} />}>
        {surplus <= 0 && <p className="h-card h-card-risk mb-4">You have no monthly surplus right now ({gbp(surplus)}). Focus on the fixes in Time Travel first.</p>}
        <label htmlFor="share" className="h-label">Share of monthly surplus to put to work: {pctShare}% ({gbp(monthlyPot)} a month)</label>
        <input id="share" type="range" min={10} max={100} step={5} value={pctShare} className="h-range"
          onChange={(e) => setPctShare(Number(e.target.value))} onPointerUp={() => c.update({ surplusPct: pctShare })} onKeyUp={() => c.update({ surplusPct: pctShare })} />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {([["Safety buffer", split.buffer, "ok"], ["Costly debt", split.debt, "warn"], ["Portfolio", split.invest, "ink"]] as const).map(([l, s, tone]) => (
            <div key={l} className="h-card">
              <p className="text-sm">{l}</p>
              <p className="h-head text-2xl font-bold h-num">{gbp(monthlyPot * s)}</p>
              <Bar value={s} tone={tone} label={`${l} ${pct(s)}`} />
              <p className="mt-1 text-sm h-muted">{pct(s)}</p>
            </div>
          ))}
        </div>
        {c.sc.rung <= 2 && <p className="mt-3 font-semibold">Protect first: investing waits until your starter buffer is in place.</p>}
      </Card>

      {g && (
        <Card id="goal" title={`Goal: ${g.goal.name}`} actions={<>
          <Link to="/app/goals" className="h-btn h-btn-sm">Open goal simulator</Link>
          <WhyButton info={{ title: "Goal probability", inputs: [`Target ${gbp(g.goal.target)} by ${g.goal.year}`, `Starting from ${gbp(c.store.invested)}`, `Contributing ${gbp(g.monthly)} a month`, `${c.rp.label} mix`], rule: "2,000 simulated market paths using long-run real returns (cash 3.5%, bonds 4%, shares 6.5%, minus 2.5% inflation).", confidence: "Medium: illustrative, not a forecast. Markets can do better or worse.", changeIf: ["You contribute more or less", "Your mix changes", "The goal date moves"] }} />
        </>}>
          <div className="grid gap-4 md:grid-cols-4">
            <div><p className="text-sm">Chance of reaching it</p><p className="h-head text-3xl font-bold h-num">{pct(g.sim.prob)}</p></div>
            <div><p className="text-sm">Likely arrival</p><p className="h-head text-3xl font-bold h-num">{g.arrival ?? "Not at this pace"}</p></div>
            <div className="md:col-span-2"><p className="text-sm">Monthly needed for 50% / 75% / 90%</p><p className="h-head text-2xl font-bold h-num">{gbp(g.need.p50)} / {gbp(g.need.p75)} / {gbp(g.need.p90)}</p></div>
          </div>
          <div className="h-detail mt-4"><GoalFan fan={g.sim.fan} target={g.goal.target} label="Mini fan chart of goal growth" /></div>
        </Card>
      )}

      <Card id="res" title={t("score", c.lang)} actions={<>
        <ReadAloud text={`Your resilience score is ${c.sc.total}. You are on rung ${c.sc.rung}, ${rung.name}. Next action: ${c.sc.action}`} />
        <WhyButton info={{ title: "Resilience Score", inputs: c.sc.comps.map((x: any) => `${x.label}: ${x.measure} (full marks at ${x.full})`), rule: "Weighted: buffer 30%, surplus 25%, debt 20%, income stability 15%, support checks 10%. Uses your forecast with any fixes you've applied.", confidence: "High for today's numbers; it moves as your situation changes.", changeIf: ["You save more", "Debt goes down", "You tick the support checks in Help"] }} />
      </>}>
        <div className="grid gap-6 md:grid-cols-[auto_1fr_1fr] md:items-center">
          <ScoreRing value={c.sc.total} label={t("score", c.lang)} />
          <div><p className="text-sm">Rung {c.sc.rung} of 5</p><p className="h-head text-xl font-bold">{rung.name}</p><p className="mt-2">{c.sc.action}</p></div>
          <div className={`h-card ${c.fcRaw.worstPNeg >= 0.3 ? "h-card-risk" : c.fcRaw.worstPNeg >= 0.1 ? "h-card-warn" : "h-card-ok"}`}>
            <p className="font-semibold">90-day heads-up</p>
            <p className="mt-1">{c.fcRaw.worstPNeg < 0.05 ? "No dip below £0 expected in the next 90 days." : `${Engine.fmtDate(c.fcRaw.worstDate)}: ${pct(c.fcRaw.worstPNeg)} chance of going below £0.`}</p>
            <Link to="/app/time-travel" className="h-link mt-2 inline-block">See your next 90 days</Link>
          </div>
        </div>
      </Card>

      <Card id="reb" title="Rebalancing and insights">
        {inv <= 0 ? <p>Nothing invested yet, so there's nothing to rebalance. When you start, we'll check your mix against its target every day.</p>
          : off.length ? (
            <div className="h-card h-card-warn">
              <p className="font-semibold">Time to rebalance</p>
              <ol className="mt-2 list-decimal pl-5">
                {off.map((d) => <li key={d.k}>{d.label} is {d.gap > 0 ? "above" : "below"} target by {Math.abs(d.gap).toFixed(1)} points. {d.gap > 0 ? "Pause new money into it" : "Point new contributions here"} until it's back near {pct(d.w)}.</li>)}
                <li>Prefer using new contributions rather than selling, to keep costs low.</li>
              </ol>
            </div>
          ) : <p className="h-card h-card-ok"><strong>On target.</strong> Every part of your mix is within 5 points of its target.</p>}
      </Card>

      <Card id="pulse" title="Market pulse" actions={<Link to="/app/briefing" className="h-btn h-btn-sm">Full briefing</Link>}>
        {news.data?.delayed && <p className="mb-3"><span className="h-badge h-badge-warn">Data delayed</span></p>}
        {top3.length === 0 ? <p className="h-muted">{news.isLoading ? "Loading headlines…" : "Headlines aren't available right now."}</p> : (
          <ul className="grid gap-3">
            {top3.map((n) => (
              <li key={n.url} className="h-card">
                <a href={n.url} target="_blank" rel="noopener noreferrer" className="font-semibold">{n.headline}</a>
                <p className="text-sm h-muted">{n.source}</p>
                <p className="mt-2"><strong>What this means for you:</strong> {meaningFor(tagNews(n), c, n)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
