import { useEffect, useRef, useState, type ReactNode } from "react";
import { HelpCircle, Volume2, X } from "lucide-react";
import { useCoach } from "@/lib/coach";
import { t, VOICE } from "@/lib/i18n";

export type WhyInfo = { title: string; inputs: string[]; rule: string; confidence: string; changeIf: string[] };

export function WhyButton({ info }: { info: WhyInfo }) {
  const [open, setOpen] = useState(false);
  const { lang } = useCoach();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <>
      <button type="button" className="h-btn h-btn-sm" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <HelpCircle aria-hidden="true" size={16} /> {t("why", lang)}
      </button>
      {open && (
        <>
          <div className="h-overlay" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="h-panel" role="dialog" aria-modal="true" aria-labelledby="why-title">
            <div className="flex items-start justify-between gap-3">
              <h2 id="why-title" className="h-h3">Why: {info.title}</h2>
              <button ref={closeRef} type="button" className="h-icon-btn" onClick={() => setOpen(false)} aria-label="Close explanation"><X aria-hidden="true" /></button>
            </div>
            <h3 className="mt-5 font-semibold">Inputs used</h3>
            <ul className="mt-2 list-[square] pl-5">{info.inputs.map((i) => <li key={i}>{i}</li>)}</ul>
            <h3 className="mt-5 font-semibold">The rule or model</h3>
            <p className="mt-2">{info.rule}</p>
            <h3 className="mt-5 font-semibold">Confidence</h3>
            <p className="mt-2">{info.confidence}</p>
            <h3 className="mt-5 font-semibold">This would change if…</h3>
            <ul className="mt-2 list-[square] pl-5">{info.changeIf.map((i) => <li key={i}>{i}</li>)}</ul>
            <p className="mt-6 text-sm h-muted">The engine does the maths; AI only explains. Guidance, not regulated financial advice.</p>
          </aside>
        </>
      )}
    </>
  );
}

export function ReadAloud({ text }: { text: string }) {
  const { lang } = useCoach();
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(typeof window !== "undefined" && "speechSynthesis" in window), []);
  if (!supported) return null;
  return (
    <button type="button" className="h-btn h-btn-sm" onClick={() => {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = VOICE[lang];
      speechSynthesis.speak(u);
    }}>
      <Volume2 aria-hidden="true" size={16} /> {t("listen", lang)}
    </button>
  );
}

export function Card({ title, children, actions, tone, id }: { title: string; children: ReactNode; actions?: ReactNode; tone?: "warn" | "risk" | "ok" | "dark"; id?: string }) {
  return (
    <section className={`h-card ${tone ? `h-card-${tone}` : ""}`} aria-labelledby={id}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h2 id={id} className="h-h3">{title}</h2>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
