import { TICKER, useAgo, useQuotes } from "@/lib/market-hooks";

export function MarketTicker() {
  const q = useQuotes(TICKER);
  const ago = useAgo(q.data?.fetchedAt);
  const delayed = q.isError || q.data?.delayed;
  return (
    <div className="h-ticker" aria-label="Live market prices">
      <div className="h-container h-scroll-x">
        <ul className="flex min-h-11 items-center gap-6 whitespace-nowrap py-2 text-sm">
          <li className="h-head font-semibold">Markets</li>
          {(q.data?.data ?? TICKER.map((symbol) => ({ symbol, price: null, changePct: null }))).map((x) => (
            <li key={x.symbol} className="h-num">
              <span className="font-semibold">{x.symbol}</span>{" "}
              {x.price != null ? `$${x.price.toFixed(2)}` : "—"}{" "}
              {x.changePct != null && <span>{x.changePct >= 0 ? "▲" : "▼"} {Math.abs(x.changePct).toFixed(2)}%</span>}
            </li>
          ))}
          <li>{delayed ? <span className="h-badge h-badge-warn">Data delayed</span> : q.data ? `Updated ${ago} · USD market proxies` : "Loading…"}</li>
        </ul>
      </div>
    </div>
  );
}
