import { useMemo, type ReactNode } from "react";
import { Donut, SEG_FILL } from "@/components/app/charts";
import { useAgo, useQuotes } from "@/lib/market-hooks";
import { PORTFOLIO_ASSETS, portfolioStatistics, type AssetKey, type PortfolioMix } from "@/lib/portfolio";

const number = (value: number, digits = 1) => value.toLocaleString("en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function PortfolioView({ mix, label, band, demo = false, headingLevel = "h1", eyebrow, actions }: {
  mix: PortfolioMix;
  label: string;
  band?: number;
  demo?: boolean;
  headingLevel?: "h1" | "h2";
  eyebrow?: string;
  actions?: ReactNode;
}) {
  const keys = (Object.keys(PORTFOLIO_ASSETS) as AssetKey[]).filter((key) => (mix[key] ?? 0) > 0);
  const symbols = keys.map((key) => PORTFOLIO_ASSETS[key].ticker);
  const quotes = useQuotes(symbols);
  const ago = useAgo(quotes.data?.fetchedAt);
  const bySymbol = Object.fromEntries((quotes.data?.data ?? []).map((quote) => [quote.symbol, quote]));
  const stats = useMemo(() => portfolioStatistics(mix, band), [mix, band]);
  const Heading = headingLevel;
  const delayed = quotes.isError || quotes.data?.delayed;
  const statCards = [
    { label: "Expected Return", value: `${number(stats.expectedReturn * 100)}% a year`, theory: "The model’s average annual gain before inflation; actual returns will vary." },
    { label: "Volatility (Std Dev)", value: `${number(stats.volatility * 100)}% a year`, theory: "How widely returns may swing around the average. Lower means a smoother ride." },
    { label: "Sharpe Ratio", value: number(stats.sharpe, 2), theory: "Return earned per unit of risk taken. Higher is better." },
    { label: "Beta", value: number(stats.beta, 2), theory: "Sensitivity to global share markets. A beta of 1 moves in line with them." },
    { label: "Max Drawdown", value: `${number(stats.maxDrawdown * 100)}%`, theory: "The largest peak-to-trough fall in a modelled path. Less negative is better." },
    { label: "Diversification score", value: `${Math.round(stats.diversification)}/100`, theory: "How evenly money is spread across asset types. Higher means less concentration." },
  ];

  return (
    <div className="grid gap-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <p className="h-eyebrow">{eyebrow ?? (demo ? "Portfolio preview" : "Your portfolio")}</p>
          <Heading className="h-h2 mt-1">{demo ? "Demo Portfolio" : "Your personalised portfolio"}</Heading>
          <p className="mt-2 h-muted">{label}{band ? ` · risk band ${band} of 5` : ""}</p>
          <span className={`h-badge mt-3 ${demo ? "h-badge-warn" : "h-badge-ok"}`}>{demo ? "Demo data, for illustration only" : "Personalised from your answers"}</span>
        </div>
        {actions && <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div>}
      </header>

      <section className="h-card" aria-labelledby="allocation-title">
        <h2 id="allocation-title" className="h-h3 mb-5">Asset allocation and holdings</h2>
        <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center">
          <div className="flex min-w-0 flex-col items-center gap-3">
            <Donut label={`Asset allocation: ${keys.map((key) => `${PORTFOLIO_ASSETS[key].label} ${Math.round((mix[key] ?? 0) * 100)}%`).join(", ")}`} parts={keys.map((key) => ({ label: PORTFOLIO_ASSETS[key].label, value: mix[key] ?? 0 }))} />
            <ul className="w-full text-sm">
              {keys.map((key, index) => <li key={key} className="flex items-center justify-between gap-3"><span className="flex min-w-0 items-center gap-2"><span aria-hidden="true" className={`inline-block h-3 w-3 shrink-0 ${SEG_FILL[index]}`} />{PORTFOLIO_ASSETS[key].label}</span><strong className="h-num">{Math.round((mix[key] ?? 0) * 100)}%</strong></li>)}
            </ul>
          </div>
          <div className="min-w-0">
            <p className="mb-3 text-sm" aria-live="polite">{delayed ? <span className="h-badge h-badge-warn">Data delayed</span> : quotes.data ? `Live prices updated ${ago}` : "Loading live prices…"}</p>
            <div className="h-scroll-x">
              <table className="h-table">
                <thead><tr><th>Asset</th><th>Ticker</th><th className="h-r">Weight</th><th className="h-r">Current price (USD)</th><th className="h-r">Daily change</th></tr></thead>
                <tbody>{keys.map((key) => {
                  const asset = PORTFOLIO_ASSETS[key];
                  const quote = bySymbol[asset.ticker];
                  return <tr key={key}><td>{asset.label}</td><td><strong>{asset.ticker}</strong></td><td className="h-r">{Math.round((mix[key] ?? 0) * 100)}%</td><td className="h-r">{quote?.price != null ? `$${number(quote.price, 2)}` : "—"}</td><td className={`h-r ${quote?.changePct == null ? "" : quote.changePct >= 0 ? "h-pos" : "h-neg"}`}>{quote?.changePct != null ? `${quote.changePct >= 0 ? "+" : ""}${number(quote.changePct, 2)}%` : "—"}</td></tr>;
                })}</tbody>
              </table>
            </div>
            <p className="mt-3 text-sm h-muted">Tickers are live market proxies, not instructions to buy. Prices are quoted in US dollars.</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="statistics-title">
        <h2 id="statistics-title" className="h-h2 mb-4">Key statistics</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => <li key={stat.label} className="h-card"><h3 className="h-h3">{stat.label}</h3><p className="h-head mt-3 text-3xl font-bold h-num">{stat.value}</p><p className="mt-3 text-sm h-muted">{stat.theory}</p></li>)}
        </ul>
        <p className="mt-4 text-sm h-muted">Model estimates, not guarantees. Sharpe uses the cash return as the risk-free proxy; max drawdown uses 300 deterministic 15-year simulations.</p>
      </section>
    </div>
  );
}
