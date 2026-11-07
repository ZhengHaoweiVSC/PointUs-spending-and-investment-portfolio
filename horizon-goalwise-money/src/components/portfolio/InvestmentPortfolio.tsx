import { useEffect, useMemo, useState } from "react";
import { SEG_FILL } from "@/components/app/charts";
import { gbp } from "@/lib/coach";
import { buildInvestmentPortfolio, estimatedShares, type FinancialBackground, type InvestmentHolding, type RiskAppetite } from "@/lib/investment";
import { useAgo, useQuotes } from "@/lib/market-hooks";

const number = (value: number, digits = 1) => value.toLocaleString("en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const OUTER = [{ label: "Value", key: "value" as const }, { label: "Growth", key: "growth" as const }, { label: "Cash", key: "cash" as const }];

function InvestmentDonut({ holdings, allocation, budget }: { holdings: InvestmentHolding[]; allocation: ReturnType<typeof buildInvestmentPortfolio>["allocation"]; budget: number }) {
  const outerRadius = 72;
  const innerRadius = 43;
  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;
  let outerOffset = 0;
  let innerOffset = 0;
  const outerClasses = ["h-svg-ok", "h-svg-ink", "h-svg-warn"];
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={`Value ${Math.round(allocation.value * 100)}%, Growth ${Math.round(allocation.growth * 100)}%, Cash ${Math.round(allocation.cash * 100)}%. Inner ring: ${holdings.map((holding) => `${holding.ticker} ${number(holding.weight * 100)}%`).join(", ")}`} className="h-48 w-48 max-w-full">
      <circle cx="100" cy="100" r={outerRadius} strokeWidth="24" className="h-svg-track" />
      {OUTER.map((item, index) => {
        const length = allocation[item.key] * outerCircumference;
        const circle = <circle key={item.label} cx="100" cy="100" r={outerRadius} strokeWidth="24" className={outerClasses[index]} strokeDasharray={`${length} ${outerCircumference - length}`} strokeDashoffset={-outerOffset} transform="rotate(-90 100 100)" />;
        outerOffset += length;
        return circle;
      })}
      <circle cx="100" cy="100" r={innerRadius} strokeWidth="20" className="h-svg-track" />
      {holdings.map((holding) => {
        const length = holding.weight * innerCircumference;
        const visibleLength = Math.max(0, length - 1);
        const colour = holding.style === "Value" ? "h-svg-ok" : holding.style === "Growth" ? "h-svg-warn" : "h-svg-muted";
        const circle = <circle key={holding.ticker} cx="100" cy="100" r={innerRadius} strokeWidth="20" className={colour} strokeDasharray={`${visibleLength} ${innerCircumference - visibleLength}`} strokeDashoffset={-innerOffset} transform="rotate(-90 100 100)" />;
        innerOffset += length;
        return circle;
      })}
      <text x="100" y="96" textAnchor="middle" className="h-svg-text" fontSize="12">Monthly</text>
      <text x="100" y="114" textAnchor="middle" className="h-svg-text" fontSize="16" fontWeight="700">{gbp(budget)}</text>
    </svg>
  );
}

export function InvestmentPortfolio({ defaultRisk, monthlyBudget, onBudgetChange }: {
  defaultRisk: RiskAppetite;
  monthlyBudget: number;
  onBudgetChange: (value: number) => void;
}) {
  const [risk, setRisk] = useState<RiskAppetite>(defaultRisk);
  const [background, setBackground] = useState<FinancialBackground>("Beginner");
  useEffect(() => setRisk(defaultRisk), [defaultRisk]);
  const model = useMemo(() => buildInvestmentPortfolio(risk, background, monthlyBudget), [risk, background, monthlyBudget]);
  const symbols = useMemo(() => model.holdings.filter((holding) => holding.ticker !== "CASH").map((holding) => holding.ticker), [model]);
  const quotes = useQuotes(symbols);
  const ago = useAgo(quotes.data?.fetchedAt);
  const bySymbol = Object.fromEntries((quotes.data?.data ?? []).map((quote) => [quote.symbol, quote]));
  const delayed = quotes.isError || quotes.data?.delayed;
  const allocation = model.allocation;
  const statCards = [
    { label: "Expected Return", value: `${number(model.statistics.expectedReturn * 100)}% a year`, theory: "Modelled average annual gain; actual returns will vary." },
    { label: "Volatility", value: `${number(model.statistics.volatility * 100)}% a year`, theory: "How widely returns may swing. Lower means a smoother ride." },
    { label: "Beta", value: number(model.statistics.beta, 2), theory: "Sensitivity to the wider market. A beta of 1 moves in line with it." },
    { label: "Sharpe Ratio", value: number(model.statistics.sharpe, 2), theory: "Return earned per unit of risk taken. Higher is better." },
  ];

  return (
    <div className="grid gap-6">
      <header>
        <h2 className="h-h2">Investment portfolio</h2>
        <p className="mt-2 h-muted">Value vs Growth, shaped by your inputs</p>
      </header>

      <section className="h-card" aria-labelledby="investment-inputs-title">
        <h3 id="investment-inputs-title" className="h-h3 mb-4">Your inputs</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div><label htmlFor="investment-risk" className="h-label">Risk appetite</label><select id="investment-risk" className="h-select" value={risk} onChange={(event) => setRisk(event.target.value as RiskAppetite)}><option>Low</option><option>Medium</option><option>High</option></select></div>
          <div><label htmlFor="investment-background" className="h-label">Financial background</label><select id="investment-background" className="h-select" value={background} onChange={(event) => setBackground(event.target.value as FinancialBackground)}><option>Beginner</option><option>Intermediate</option><option>Experienced</option></select></div>
          <div><label htmlFor="investment-budget" className="h-label">Monthly investment budget (£)</label><input id="investment-budget" className="h-input" type="number" min={0} step={10} inputMode="decimal" value={monthlyBudget} onChange={(event) => onBudgetChange(Math.max(0, Number(event.target.value) || 0))} /><p className="h-hint">Starts from your disposable income.</p></div>
        </div>
      </section>

      <section className="h-card" aria-labelledby="investment-allocation-title">
        <h3 id="investment-allocation-title" className="h-h3 mb-5">Allocation and holdings</h3>
        <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
          <div className="flex min-w-0 flex-col items-center gap-3">
            <InvestmentDonut holdings={model.holdings} allocation={allocation} budget={monthlyBudget} />
            <ul className="w-full text-sm">{OUTER.map((item, index) => <li key={item.label} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><span aria-hidden="true" className={`inline-block h-3 w-3 ${SEG_FILL[index]}`} />{item.label}</span><strong className="h-num">{Math.round(allocation[item.key] * 100)}%</strong></li>)}</ul>
          </div>
          <div className="min-w-0">
            <p className="mb-3 text-sm" aria-live="polite">{delayed ? <span className="h-badge h-badge-warn">Data delayed</span> : quotes.data ? `Live prices updated ${ago}` : "Loading live prices…"}</p>
            <div className="h-scroll-x">
              <table className="h-table min-w-[52rem]">
                <thead><tr><th>Ticker</th><th>Type</th><th className="h-r">Weight</th><th className="h-r">Monthly £</th><th className="h-r">Live price (USD)</th><th className="h-r">Daily change</th><th className="h-r">Est. shares</th></tr></thead>
                <tbody>{model.holdings.map((holding) => {
                  const quote = holding.ticker === "CASH" ? undefined : bySymbol[holding.ticker];
                  const shares = quote?.price ? estimatedShares(holding.amount, quote.price) : null;
                  return <tr key={holding.ticker}><td><strong>{holding.ticker}</strong></td><td>{holding.style}</td><td className="h-r">{number(holding.weight * 100)}%</td><td className="h-r">{gbp(holding.amount, 2)}</td><td className="h-r">{quote?.price != null ? `$${number(quote.price, 2)}` : "—"}</td><td className={`h-r ${quote?.changePct == null ? "" : quote.changePct >= 0 ? "h-pos" : "h-neg"}`}>{quote?.changePct != null ? `${quote.changePct >= 0 ? "+" : ""}${number(quote.changePct, 2)}%` : "—"}</td><td className="h-r">{shares == null ? "—" : shares < 1 ? number(shares, 4) : number(shares, 2)}</td></tr>;
                })}</tbody>
              </table>
            </div>
            <p className="mt-3 text-sm h-muted">Share estimates use £1 = $1.27; live prices are in USD.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-2 text-sm"><p><strong>Value stocks:</strong> priced low relative to earnings, steadier.</p><p><strong>Growth stocks:</strong> expected to grow faster than the market, more volatile.</p></div>
      </section>

      <section aria-labelledby="investment-statistics-title">
        <h3 id="investment-statistics-title" className="h-h2 mb-4">Key statistics</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{statCards.map((stat) => <li key={stat.label} className="h-card"><h4 className="font-semibold">{stat.label}</h4><p className="h-head mt-3 text-3xl font-bold h-num">{stat.value}</p><p className="mt-3 text-sm h-muted">{stat.theory}</p></li>)}</ul>
        <p className="mt-4 text-sm h-muted">Illustrative model assumptions, not forecasts.</p>
      </section>
    </div>
  );
}
