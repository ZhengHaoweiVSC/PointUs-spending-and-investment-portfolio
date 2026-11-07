import type { Quote, NewsItem, MarketResult, MarketInput } from "./market.functions";
const QUOTE_TTL = 60_000;
const NEWS_TTL = 300_000;
const quoteCache = new Map<string, { at: number; quote: Quote }>();
let newsCache: { at: number; items: NewsItem[] } | null = null;
const pending = new Map<string, Promise<unknown>>();
async function provider(path: string, key: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch(`https://finnhub.io/api/v1/${path}&token=${encodeURIComponent(key)}`, { signal: controller.signal });
    if (!response.ok) throw new Error("Market provider unavailable");
    return await response.json();
  } finally { clearTimeout(timer); }
}
async function dedupe<T>(id: string, fn: () => Promise<T>): Promise<T> {
  const active = pending.get(id);
  if (active) return active as Promise<T>;
  const request = fn();
  pending.set(id, request);
  try { return await request; } finally { pending.delete(id); }
}
const nullable = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
export async function quotes(symbols: string[], key?: string): Promise<MarketResult<Quote[]>> {
  let delayed = false;
  const now = Date.now();
  const data = await Promise.all([...new Set(symbols)].map(async symbol => {
    const hit = quoteCache.get(symbol);
    if (hit && now - hit.at < QUOTE_TTL) return hit.quote;
    const fallback = () => { delayed = true; return hit?.quote ?? { symbol, price: null, change: null, changePct: null, prevClose: null, time: null }; };
    if (!key) return fallback();
    try {
      return await dedupe(`quote:${symbol}`, async () => {
        const json = await provider(`quote?symbol=${encodeURIComponent(symbol)}`, key);
        if (!json || typeof json !== "object" || !("c" in json) || nullable(json.c) === null || Number(json.c) <= 0) throw new Error("Invalid quote");
        const row = json as Record<string, unknown>;
        const quote: Quote = { symbol, price: nullable(row.c), change: nullable(row.d), changePct: nullable(row.dp), prevClose: nullable(row.pc), time: nullable(row.t) };
        quoteCache.set(symbol, { at: Date.now(), quote });
        // Bound memory usage even if callers request many different valid symbols.
        if (quoteCache.size > 100) { const oldest = quoteCache.keys().next().value; if (oldest) quoteCache.delete(oldest); }
        return quote;
      });
    } catch { return fallback(); }
  }));
  const timestamps = data.map(quote => quoteCache.get(quote.symbol)?.at ?? now);
  return { data, delayed, fetchedAt: Math.min(...timestamps), ...(delayed ? { reason: key ? "Data delayed" : "Market data is not connected yet" } : {}) };
}
export async function news(key?: string): Promise<MarketResult<NewsItem[]>> {
  const now = Date.now();
  if (newsCache && now - newsCache.at < NEWS_TTL) return { data: newsCache.items, delayed: false, fetchedAt: newsCache.at };
  const fallback = (): MarketResult<NewsItem[]> => ({ data: newsCache?.items ?? [], delayed: true, fetchedAt: newsCache?.at ?? now, reason: key ? "Data delayed" : "Market data is not connected yet" });
  if (!key) return fallback();
  try {
    return await dedupe("news", async () => {
      const json = await provider("news?category=general", key);
      if (!Array.isArray(json)) throw new Error("Invalid news");
      const items: NewsItem[] = json.filter(row => row && typeof row === "object" && typeof row.headline === "string" && /^https:\/\//.test(String(row.url))).slice(0, 20).map(row => ({ headline: String(row.headline), source: String(row.source ?? ""), url: String(row.url), datetime: nullable(row.datetime) ?? 0, summary: String(row.summary ?? ""), image: /^https:\/\//.test(String(row.image)) ? String(row.image) : "" }));
      newsCache = { at: Date.now(), items };
      return { data: items, delayed: false, fetchedAt: newsCache.at };
    });
  } catch { return fallback(); }
}
export function fetchMarket(input: MarketInput, key?: string) {
  return input.type === "quotes" ? quotes(input.symbols, key) : news(key);
}
