import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Engine } from "@/lib/engine";
import { Personas } from "@/lib/personas";
import { spendingBreakdown } from "@/lib/spending";
import type { Stored } from "@/lib/coach";
import type { RiskAppetite } from "@/lib/investment";
import { SpendingPortfolio } from "./SpendingPortfolio";
import { InvestmentPortfolio } from "./InvestmentPortfolio";

const TABS = ["Spending", "Investments"] as const;
type Tab = (typeof TABS)[number];

export function PortfolioSection({ stored }: { stored: Stored | null }) {
  const [scenario, setScenario] = useState("amara");
  const [activeTab, setActiveTab] = useState<Tab>("Spending");
  const [budget, setBudget] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const demo = !stored;
  const profile = stored?.engine ?? Personas[scenario as "amara" | "ravi" | "family"] ?? Personas.amara;
  const spending = useMemo(() => spendingBreakdown(profile), [profile]);
  const defaultRisk = useMemo<RiskAppetite>(() => {
    const forecast = Engine.forecast(profile, {});
    const score = Engine.score(profile, forecast);
    const risk = Engine.riskProfile(profile, score);
    return (risk.band ?? 3) <= 2 ? "Low" : (risk.band ?? 3) === 3 ? "Medium" : "High";
  }, [profile]);

  useEffect(() => setBudget(Math.round(spending.disposableIncome * 100) / 100), [spending.disposableIncome, scenario, stored]);

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (index + TABS.length - 1) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(TABS[next]);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="h-eyebrow">Portfolio</p>
          <h1 className="h-h2 mt-1">{demo ? "Demo Portfolio" : "Your portfolio"}</h1>
          <span className={`h-badge mt-3 ${demo ? "h-badge-warn" : "h-badge-ok"}`}>{demo ? "Demo data, for illustration only" : "Personalised from your answers"}</span>
        </div>
        {demo && <fieldset className="min-w-0"><legend className="h-label">Demo scenario</legend><div className="flex flex-wrap gap-2">{Personas.list.map((persona) => <button key={persona.id} type="button" className="h-chip" aria-pressed={scenario === persona.id} onClick={() => setScenario(persona.id)}>{persona.name}</button>)}</div></fieldset>}
      </header>

      <div className="h-portfolio-tabs" role="tablist" aria-label="Portfolio views">
        {TABS.map((tab, index) => <button key={tab} ref={(element) => { tabRefs.current[index] = element; }} id={`portfolio-tab-${tab.toLowerCase()}`} type="button" role="tab" aria-selected={activeTab === tab} aria-controls={`portfolio-panel-${tab.toLowerCase()}`} tabIndex={activeTab === tab ? 0 : -1} className="h-portfolio-tab" onClick={() => setActiveTab(tab)} onKeyDown={(event) => onTabKeyDown(event, index)}>{tab}</button>)}
      </div>

      <div id={`portfolio-panel-${activeTab.toLowerCase()}`} role="tabpanel" aria-labelledby={`portfolio-tab-${activeTab.toLowerCase()}`} tabIndex={0}>
        {activeTab === "Spending" ? <SpendingPortfolio model={spending} /> : <InvestmentPortfolio defaultRisk={defaultRisk} monthlyBudget={budget} onBudgetChange={setBudget} />}
      </div>
      <p className="text-sm h-muted">Educational tool, not financial advice.</p>
    </div>
  );
}
