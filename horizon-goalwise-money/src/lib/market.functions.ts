import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchMarket, news, quotes } from "./market.server";
export type Quote = { symbol: string; price: number | null; change: number | null; changePct: number | null; prevClose: number | null; time: number | null };
export type NewsItem = { headline: string; source: string; url: string; datetime: number; summary: string; image: string };
export type MarketResult<T> = { data: T; delayed: boolean; fetchedAt: number; reason?: string };
const symbols = z.array(z.string().regex(/^[A-Z.]{1,8}$/)).min(1).max(10);
const input = z.discriminatedUnion("type", [z.object({ type: z.literal("quotes"), symbols }), z.object({ type: z.literal("news") })]);
export type MarketInput = z.infer<typeof input>;
/** Unified market RPC; legacy quote/news exports use the same server cache. */
export const market = createServerFn({ method: "GET" }).inputValidator((data: unknown) => input.parse(data)).handler(({ data }) => fetchMarket(data, process.env['FINNHUB_API_KEY']));
export const getQuotes = createServerFn({ method: "GET" }).inputValidator((data: unknown) => z.object({ symbols }).parse(data)).handler(({ data }) => quotes(data.symbols, process.env['FINNHUB_API_KEY']));
export const getNews = createServerFn({ method: "GET" }).handler(() => news(process.env['FINNHUB_API_KEY']));
