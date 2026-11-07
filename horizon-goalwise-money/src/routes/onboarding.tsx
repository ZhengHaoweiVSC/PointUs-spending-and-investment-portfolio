import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/SiteChrome";
import { ConsentGate, type Consent } from "@/components/ConsentGate";
import { buildFromAnswers, defaultAnswers, type Answers } from "@/lib/build-profile";
import type { Stored } from "@/lib/coach";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): { edit?: boolean } => ({ edit: s.edit === true || s.edit === "true" ? true : undefined }),
  head: () => pageHead("onboarding"),
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/login" });
    if (!user.email_confirmed_at) throw redirect({ to: "/verify-email", search: { email: user.email } });
    const { data } = await supabase.from("profiles").select("profile").eq("user_id", user.id).maybeSingle();
    return { userId: user.id, name: (user.user_metadata?.full_name as string) ?? "", existing: (data?.profile as unknown as Stored) ?? null };
  },
  component: Onboarding,
});

type Opt = { v: string | number; l: string };
type Field = { name: keyof Answers; label: string; type: "text" | "number" | "choice"; options?: Opt[]; showIf?: (a: Answers) => boolean };
type Step = { q: string; fields: Field[] };

const Y = new Date().getFullYear();
const STEPS: Step[] = [
  { q: "Hi! What should I call you?", fields: [{ name: "firstName", label: "First name", type: "text" }] },
  { q: "Who's in your household?", fields: [
    { name: "household", label: "Household", type: "choice", options: [{ v: "solo", l: "Just me" }, { v: "solo_kids", l: "Me + children" }, { v: "couple", l: "Couple" }, { v: "couple_kids", l: "Couple + children" }] },
    { name: "dependants", label: "Number of children or dependants", type: "number", showIf: (a) => a.household === "solo_kids" || a.household === "couple_kids" }] },
  { q: "Roughly how much comes in each month after tax?", fields: [{ name: "income", label: "Monthly take-home income (£)", type: "number" }] },
  { q: "Does it change month to month?", fields: [{ name: "variation", label: "Income changes", type: "choice", options: [{ v: "same", l: "About the same" }, { v: "bit", l: "A bit" }, { v: "lot", l: "A lot" }] }] },
  { q: "How often are you paid?", fields: [{ name: "frequency", label: "Pay frequency", type: "choice", options: [{ v: "weekly", l: "Weekly" }, { v: "fortnightly", l: "Every 2 weeks" }, { v: "four_weekly", l: "Every 4 weeks" }, { v: "monthly", l: "Monthly" }] }] },
  { q: "What do you pay for your home each month?", fields: [
    { name: "housingType", label: "Rent or mortgage", type: "choice", options: [{ v: "rent", l: "Rent" }, { v: "mortgage", l: "Mortgage" }] },
    { name: "housing", label: "Monthly amount (£)", type: "number" }] },
  { q: "And all your other monthly bills (energy, phone, council tax…)?", fields: [{ name: "bills", label: "Other monthly bills (£)", type: "number" }] },
  { q: "About how much do you spend on flexible things each week (food, travel, treats)?", fields: [{ name: "weekly", label: "Weekly flexible spend (£)", type: "number" }] },
  { q: "Any debts?", fields: [
    { name: "debtType", label: "Main debt", type: "choice", options: [{ v: "none", l: "None" }, { v: "credit_card", l: "Credit card (24.9%)" }, { v: "loan", l: "Loan or car finance (9.9%)" }, { v: "bnpl", l: "Buy now pay later (0%)" }] },
    { name: "debtBalance", label: "Balance owed (£)", type: "number", showIf: (a) => a.debtType !== "none" }] },
  { q: "How much do you have in savings you could get to?", fields: [{ name: "savings", label: "Accessible savings (£)", type: "number" }] },
  { q: "What's in your current account today?", fields: [{ name: "balance", label: "Current account balance (£)", type: "number" }] },
  { q: "What are you working towards?", fields: [
    { name: "goalType", label: "Goal", type: "choice", options: [{ v: "home", l: "Home deposit" }, { v: "children", l: "Children's future" }, { v: "emergency", l: "Emergency fund" }, { v: "retirement", l: "Retirement" }, { v: "purchase", l: "Big purchase" }] },
    { name: "goalTarget", label: "Target amount (£)", type: "number" },
    { name: "goalYear", label: "Target year", type: "number" }] },
  { q: "If your investments fell 20% in a month, you would…", fields: [{ name: "att1", label: "Reaction to a fall", type: "choice", options: [{ v: 1, l: "Sell everything" }, { v: 2, l: "Sell some" }, { v: 3, l: "Do nothing" }, { v: 4, l: "Wait, then add" }, { v: 5, l: "Buy more" }] }] },
  { q: "What matters more to you?", fields: [{ name: "att2", label: "Priority", type: "choice", options: [{ v: 1, l: "Never losing money" }, { v: 2, l: "Mostly safety" }, { v: 3, l: "A balance" }, { v: 4, l: "Mostly growth" }, { v: 5, l: "Maximum growth" }] }] },
  { q: "How long could you leave money untouched?", fields: [{ name: "att3", label: "Time untouched", type: "choice", options: [{ v: 1, l: "Under 1 year" }, { v: 2, l: "1–3 years" }, { v: 3, l: "3–5 years" }, { v: 4, l: "5–10 years" }, { v: 5, l: "10 years +" }] }] },
  { q: "Do you already have money invested?", fields: [{ name: "invested", label: "Amount already invested (£)", type: "number" }] },
];

function display(f: Field, a: Answers) {
  const v = a[f.name];
  if (f.options) return f.options.find((o) => String(o.v) === String(v))?.l ?? String(v);
  return f.type === "number" && f.name !== "goalYear" && f.name !== "dependants" ? `£${Number(v).toLocaleString("en-GB")}` : String(v);
}

function Onboarding() {
  const ctx = Route.useRouteContext();
  const { edit } = Route.useSearch();
  const nav = useNavigate();
  const [consent, setConsent] = useState<Consent | null>(ctx.existing?.consent ?? null);
  const [a, setA] = useState<Answers>(() => ctx.existing?.answers ?? { ...defaultAnswers(), firstName: ctx.name });
  const [step, setStep] = useState(edit && ctx.existing?.answers ? STEPS.length : 0);
  const [draft, setDraft] = useState<Partial<Answers>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof Answers, v: string) => {
    const f = STEPS.flatMap((s) => s.fields).find((x) => x.name === k)!;
    const num = f.type === "number" || typeof defaultAnswers()[k] === "number";
    setA((s) => ({ ...s, [k]: num ? Math.max(0, Number(v) || 0) : v }));
  };

  async function save() {
    setSaving(true); setErr("");
    const fixed = { ...a, goalYear: Math.max(Y, Math.min(2080, a.goalYear || Y + 3)) };
    const store: Stored = { ...(ctx.existing ?? {}), engine: buildFromAnswers(fixed), answers: fixed, invested: fixed.invested, consent: consent!, settings: ctx.existing?.settings ?? { lang: "en", simple: false }, plan: ctx.existing?.plan ?? {}, surplusPct: ctx.existing?.surplusPct ?? 50 };
    const { error } = await supabase.from("profiles").upsert({ user_id: ctx.userId, profile: store as never, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) { setErr("We couldn't save your details. Please try again."); return; }
    nav({ to: "/app", replace: true });
  }

  const cur = STEPS[step];
  return (
    <div className="min-h-screen">
      <header className="h-header"><div className="h-container flex min-h-16 items-center"><Logo /></div></header>
      <main id="main" className="h-container max-w-2xl py-8">
        <h1 className="h-h2">{!consent ? "Before we start" : step < STEPS.length ? "Let's get to know your money" : "Here's what I heard"}</h1>
        {!consent ? (
          <div className="mt-6"><ConsentGate onAccept={setConsent} /></div>
        ) : step < STEPS.length ? (
          <div className="mt-6 grid gap-3" aria-live="polite">
            <p className="text-sm h-muted">Question {step + 1} of {STEPS.length}. Skip anything you'd rather not answer.</p>
            {STEPS.slice(0, step).map((s, i) => (
              <div key={i} className="grid gap-2">
                <p className="h-bubble h-bubble-ai">{s.q}</p>
                <p className="h-bubble h-bubble-me">{s.fields.filter((f) => !f.showIf || f.showIf(a)).map((f) => display(f, a)).join(" · ")}</p>
              </div>
            ))}
            <p className="h-bubble h-bubble-ai font-semibold">{cur.q}</p>
            <form className="h-card grid gap-4" onSubmit={(e) => { e.preventDefault(); setA((s) => ({ ...s, ...draft })); setDraft({}); setStep(step + 1); }}>
              {cur.fields.filter((f) => !f.showIf || f.showIf({ ...a, ...draft } as Answers)).map((f) => {
                const val = String((draft[f.name] ?? a[f.name]) as string | number);
                const id = `ob-${f.name}`;
                const put = (v: string) => setDraft((d) => ({ ...d, [f.name]: f.type === "text" || (f.options && typeof f.options[0].v === "string") ? v : Math.max(0, Number(v) || 0) }));
                return f.type === "choice" ? (
                  <fieldset key={f.name}><legend className="h-label">{f.label}</legend>
                    <div className="flex flex-wrap gap-2">{f.options!.map((o) => (
                      <button key={String(o.v)} type="button" className="h-chip" aria-pressed={String(o.v) === val} onClick={() => put(String(o.v))}>{o.l}</button>
                    ))}</div>
                  </fieldset>
                ) : (
                  <div key={f.name}><label htmlFor={id} className="h-label">{f.label}</label>
                    <input id={id} className="h-input" type={f.type} inputMode={f.type === "number" ? "decimal" : undefined} min={0} value={val} onChange={(e) => put(e.target.value)} autoFocus /></div>
                );
              })}
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="h-btn h-btn-primary">Next</button>
                <button type="button" className="h-btn" onClick={() => { setDraft({}); setStep(step + 1); }}>Skip</button>
                {step > 0 && <button type="button" className="h-btn h-btn-ghost" onClick={() => setStep(step - 1)}>Back</button>}
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            <p>Check and edit anything below. Skipped answers use typical values.</p>
            {STEPS.map((s, i) => (
              <div key={i} className="h-card grid gap-3">
                <p className="font-semibold">{s.q}</p>
                {s.fields.filter((f) => !f.showIf || f.showIf(a)).map((f) => {
                  const id = `cf-${f.name}`;
                  return (
                    <div key={f.name}><label htmlFor={id} className="h-label">{f.label}</label>
                      {f.options ? (
                        <select id={id} className="h-select" value={String(a[f.name])} onChange={(e) => set(f.name, e.target.value)}>
                          {f.options.map((o) => <option key={String(o.v)} value={String(o.v)}>{o.l}</option>)}
                        </select>
                      ) : <input id={id} className="h-input" type={f.type} min={0} value={String(a[f.name])} onChange={(e) => set(f.name, e.target.value)} />}
                    </div>
                  );
                })}
              </div>
            ))}
            {err && <p className="h-error" role="alert">{err}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="h-btn h-btn-primary" disabled={saving} onClick={save}>{saving ? "Saving…" : "Looks right: show my portfolio"}</button>
              <button type="button" className="h-btn" onClick={() => setStep(0)}>Start the questions again</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
