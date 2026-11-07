import { Donut, SEG_FILL } from "@/components/app/charts";
import { gbp } from "@/lib/coach";
import type { SpendingBreakdown } from "@/lib/spending";

const percent = (value: number) => `${(value * 100).toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

export function SpendingPortfolio({ model }: { model: SpendingBreakdown }) {
  const chartTotal = model.totalSpending + model.disposableIncome;
  const visibleRows = model.rows.filter((row) => row.amount > 0.004);
  const cards = [
    { label: "Monthly Income", value: gbp(model.income), note: "Take-home income per month." },
    { label: "Total Spending", value: gbp(model.totalSpending), note: "Bills, day-to-day spending and debt payments." },
    { label: "Savings Rate", value: percent(model.savingsRate), note: "Share of income not spent. 20%+ is a common benchmark." },
    { label: "Disposable Income", value: gbp(model.disposableIncome), note: "What’s left to invest each month." },
  ];

  return (
    <div className="grid gap-6">
      <header>
        <h2 className="h-h2">Spending portfolio</h2>
        <p className="mt-2 h-muted">Monthly budget breakdown</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => <li key={card.label} className="h-card">
          <h3 className="font-semibold">{card.label}</h3>
          <p className="h-head mt-3 text-3xl font-bold h-num">{card.value}</p>
          <p className="mt-3 text-sm h-muted">{card.note}</p>
        </li>)}
      </ul>

      <section className="h-card" aria-labelledby="spending-breakdown-title">
        <h3 id="spending-breakdown-title" className="h-h3 mb-5">Where your money goes</h3>
        <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center">
          <div className="flex justify-center">
            <Donut
              label={`Monthly spending: ${visibleRows.map((row) => `${row.category} ${gbp(row.amount)}, ${percent(row.incomeShare)} of income`).join("; ")}`}
              parts={visibleRows.map((row) => ({ label: row.category, value: chartTotal > 0 ? row.amount / chartTotal : 0 }))}
            />
          </div>
          <div className="h-scroll-x min-w-0">
            <table className="h-table">
              <thead><tr><th>Category</th><th className="h-r">Monthly</th><th className="h-r">% of income</th><th className="h-r">Daily average</th></tr></thead>
              <tbody>{model.rows.map((row) => {
                const colourIndex = Math.max(0, visibleRows.findIndex((visible) => visible.category === row.category));
                return <tr key={row.category}>
                  <td><span className="flex items-center gap-2"><span aria-hidden="true" className={`inline-block h-3 w-3 shrink-0 ${SEG_FILL[colourIndex % SEG_FILL.length]}`} />{row.category}</span></td>
                  <td className="h-r">{gbp(row.amount)}</td>
                  <td className="h-r">{percent(row.incomeShare)}</td>
                  <td className="h-r">{gbp(row.dailyAverage, 2)}</td>
                </tr>;
              })}</tbody>
            </table>
          </div>
        </div>
        {model.hasEstimatedFlexibleSplit && <p className="mt-4 text-sm h-muted">Flexible spending uses an estimated category split; all other amounts come from the selected profile.</p>}
      </section>
    </div>
  );
}
