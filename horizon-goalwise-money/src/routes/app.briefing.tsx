import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNews } from "@/lib/market-hooks";
import { meaningFor, tagNews } from "@/lib/news";
import { coachContext, useCoach } from "@/lib/coach";
import { askCoach } from "@/lib/chat.functions";
import type { NewsItem } from "@/lib/market.functions";

export const Route = createFileRoute("/app/briefing")({ component: Briefing });

function Briefing() {
  const news = useNews();
  const items = (news.data?.data ?? []).slice(0, 10);
  return (
    <div className="grid gap-6">
      <header><p className="h-eyebrow">Briefing</p><h1 className="h-h2 mt-1">The news, in your numbers</h1></header>
      {news.data?.delayed && <p><span className="h-badge h-badge-warn">Data delayed</span> {news.data.reason}</p>}
      {items.length === 0 && <p className="h-card">{news.isLoading ? "Loading headlines…" : "No headlines available right now. Please check back soon."}</p>}
      <ul className="grid gap-4">{items.map((n) => <Item key={n.url} n={n} />)}</ul>
    </div>
  );
}

function Item({ n }: { n: NewsItem }) {
  const c = useCoach();
  const ask = useServerFn(askCoach);
  const [simple, setSimple] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const tags = tagNews(n);
  const meaning = meaningFor(tags, c, n);
  return (
    <li className="h-card">
      <div className="flex flex-wrap gap-2">{tags.map((t) => <span key={t} className="h-badge">{t}</span>)}</div>
      <h2 className="h-h3 mt-2"><a href={n.url} target="_blank" rel="noopener noreferrer">{n.headline}</a></h2>
      <p className="text-sm h-muted">{n.source} · {new Date(n.datetime * 1000).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
      <p className="h-detail mt-2">{n.summary.slice(0, 280)}</p>
      <p className="mt-3"><strong>What this means for you:</strong> {meaning}</p>
      <button type="button" className="h-btn h-btn-sm mt-3" disabled={busy} onClick={async () => {
        setBusy(true);
        try {
          const r = await ask({ data: { lang: c.lang, context: { ...coachContext(c), headline: n.headline, summary: n.summary.slice(0, 600), meaning }, messages: [{ role: "user", content: "Explain this headline simply and what it means for me, in 2-3 short sentences." }] } });
          setSimple(r.text);
        } catch { setSimple("Sorry, the explanation isn't available right now."); } finally { setBusy(false); }
      }}>{busy ? "Explaining…" : "Explain simply with AI"}</button>
      {simple && <p className="h-bubble h-bubble-ai mt-3 whitespace-pre-line">{simple}</p>}
    </li>
  );
}
