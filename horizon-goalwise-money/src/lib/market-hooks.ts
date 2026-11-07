import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getNews, getQuotes } from "./market.functions";

export const PROXIES = { equity: "VT", bonds: "BNDW", cash: "SHV" } as const;
export const TICKER = ["VT", "BNDW", "SHV", "SPY", "VEA"];

export function useQuotes(symbols: string[]) {
  const loadQuotes = useServerFn(getQuotes);
  return useQuery({
    queryKey: ["quotes", symbols.join(",")],
    queryFn: () => loadQuotes({ data: { symbols } }),
    refetchInterval: 60_000,
    staleTime: 55_000,
    retry: 1,
  });
}

export function useNews() {
  const loadNews = useServerFn(getNews);
  return useQuery({ queryKey: ["news"], queryFn: () => loadNews(), refetchInterval: 300_000, staleTime: 290_000, retry: 1 });
}

export function useAgo(ts?: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  if (!ts) return "";
  const s = Math.max(0, Math.round((now - ts) / 1000));
  return s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`;
}
