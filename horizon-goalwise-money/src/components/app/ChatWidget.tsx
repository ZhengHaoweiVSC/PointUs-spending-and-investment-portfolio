import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { askCoach } from "@/lib/chat.functions";
import { coachContext, useCoach } from "@/lib/coach";
import { t } from "@/lib/i18n";
import { PROXIES, useQuotes } from "@/lib/market-hooks";

const QUICK = ["Can I afford a £60 school trip next month?", "Why is February risky?", "How is my portfolio doing today?", "Should I invest more?"];

export function useDayMove() {
  const c = useCoach();
  const q = useQuotes([PROXIES.equity, PROXIES.bonds, PROXIES.cash]);
  const mix = c.rp.mix as Record<"cash" | "bonds" | "equity", number>;
  const by = Object.fromEntries((q.data?.data ?? []).map((x) => [x.symbol, x]));
  const parts = (["equity", "bonds", "cash"] as const).map((k) => ({ k, w: mix[k], dp: by[PROXIES[k]]?.changePct ?? null }));
  const known = parts.every((p) => p.w === 0 || p.dp != null);
  const dayMovePct = known && q.data ? parts.reduce((a, p) => a + p.w * (p.dp ?? 0), 0) : null;
  return { q, by, dayMovePct };
}

export function ChatWidget() {
  const c = useCoach();
  const { dayMovePct } = useDayMove();
  const ask = useServerFn(askCoach);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ block: "end" }), [msgs, busy]);

  async function send(q: string) {
    if (!q.trim() || busy) return;
    const next = [...msgs, { role: "user" as const, content: q.trim() }];
    setMsgs(next); setText(""); setBusy(true);
    try {
      const r = await ask({ data: { messages: next.slice(-10), context: coachContext(c, { dayMovePct }), lang: c.lang } });
      setMsgs([...next, { role: "assistant", content: r.text }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Sorry, I couldn't answer just now. Please try again in a moment." }]);
    } finally { setBusy(false); }
  }

  return (
    <>
      {!open && (
        <button type="button" className="h-btn h-btn-dark h-chat-fab" onClick={() => setOpen(true)}>
          <MessageCircle aria-hidden="true" size={18} /> {t("talk", c.lang)}
        </button>
      )}
      {open && (
        <section className="h-chat" role="dialog" aria-label={t("talk", c.lang)}>
          <div className="flex items-center justify-between border-b-[1.5px] p-3">
            <h2 className="h-h3">{t("talk", c.lang)}</h2>
            <button type="button" className="h-icon-btn" onClick={() => setOpen(false)} aria-label="Close chat"><X aria-hidden="true" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite">
            {msgs.length === 0 && (
              <>
                <p className="text-sm h-muted">Ask anything about your numbers. Guidance, not regulated advice.</p>
                <div className="flex flex-col gap-2">
                  {QUICK.map((q) => <button key={q} type="button" className="h-chip text-left text-sm" onClick={() => send(q)}>{q}</button>)}
                </div>
              </>
            )}
            {msgs.map((m, i) => <p key={i} className={`h-bubble whitespace-pre-line text-sm ${m.role === "user" ? "h-bubble-me" : "h-bubble-ai"}`}>{m.content}</p>)}
            {busy && <p className="h-bubble h-bubble-ai text-sm">Thinking…</p>}
            <div ref={endRef} />
          </div>
          <form className="flex gap-2 border-t-[1.5px] p-3" onSubmit={(e) => { e.preventDefault(); send(text); }}>
            <label htmlFor="chat-input" className="sr-only">Your question</label>
            <input id="chat-input" className="h-input" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} />
            <button type="submit" className="h-icon-btn" aria-label="Send" disabled={busy}><Send aria-hidden="true" /></button>
          </form>
        </section>
      )}
    </>
  );
}
