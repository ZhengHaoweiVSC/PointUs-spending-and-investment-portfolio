import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Engine } from "./engine";
import { Personas, PERSONA_INVESTED } from "./personas";
import { supabase } from "@/integrations/supabase/client";
import type { Answers } from "./build-profile";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type EngineProfile = any;
export type Fixes = { spread?: boolean; trimWeekly?: number };
export type Shock = { id: string; label: string; kind: string; [k: string]: unknown };
export type Lang = "en" | "hi" | "pl";

export type Stored = {
  engine: EngineProfile;
  answers?: Answers;
  invested: number;
  consent?: { version: string; acceptedAt: string; terms: boolean; privacy: boolean; security: boolean; guidance: boolean };
  settings?: { lang: Lang; simple: boolean };
  plan?: Record<string, boolean>;
  surplusPct?: number;
};

export const DEMO_KEY = "pointus-demo";

export function demoStored(id: string): Stored {
  const p = (Personas as any)[id] ?? Personas.amara;
  return { engine: JSON.parse(JSON.stringify(p)), invested: PERSONA_INVESTED[p.id] ?? 0, settings: { lang: "en", simple: false }, plan: {}, surplusPct: 50 };
}

type Ctx = {
  mode: "demo" | "user";
  personaId?: string;
  userId?: string;
  store: Stored;
  update: (patch: Partial<Stored>) => Promise<void>;
  setPersona: (id: string) => void;
  shocks: Shock[];
  setShocks: (s: Shock[]) => void;
  fixes: Fixes;
  setFixes: (f: Fixes) => void;
  p: EngineProfile;
  fcRaw: any; fcPlan: any; fcView: any; fixList: any[]; sc: any; rp: any;
  lang: Lang; simple: boolean;
};

const C = createContext<Ctx | null>(null);

export function CoachProvider({ initial, mode, userId, personaId: pid, children }: { initial: Stored; mode: "demo" | "user"; userId?: string; personaId?: string; children: ReactNode }) {
  const [store, setStore] = useState<Stored>(initial);
  const [personaId, setPersonaId] = useState(pid);
  const [shocks, setShocks] = useState<Shock[]>([]);
  const [fixes, setFixes] = useState<Fixes>({});
  const latest = useRef(store);
  latest.current = store;

  const update = useCallback(async (patch: Partial<Stored>) => {
    const next = { ...latest.current, ...patch };
    setStore(next);
    if (mode === "user" && userId) {
      await supabase.from("profiles").upsert({ user_id: userId, profile: next as never, updated_at: new Date().toISOString() });
    }
  }, [mode, userId]);

  const setPersona = useCallback((id: string) => {
    sessionStorage.setItem(DEMO_KEY, id);
    setPersonaId(id); setShocks([]); setFixes({});
    setStore(demoStored(id));
  }, []);

  const p = store.engine;
  const calc = useMemo(() => {
    const fcRaw = Engine.forecast(p, { shocks });
    const fcPlan = Engine.forecast(p, { fixes });
    const fcView = Engine.forecast(p, { shocks, fixes });
    const fixList = Engine.suggestFixes(p, fcRaw, shocks);
    const sc = Engine.score(p, fcPlan);
    const rp = Engine.riskProfile(p, sc);
    return { fcRaw, fcPlan, fcView, fixList, sc, rp };
  }, [p, shocks, fixes]);

  const lang = store.settings?.lang ?? "en";
  const simple = store.settings?.simple ?? false;
  useEffect(() => {
    document.documentElement.classList.toggle("h-simple", simple);
    document.documentElement.lang = lang === "en" ? "en-GB" : lang;
    return () => { document.documentElement.classList.remove("h-simple"); document.documentElement.lang = "en-GB"; };
  }, [simple, lang]);

  const value: Ctx = { mode, personaId, userId, store, update, setPersona, shocks, setShocks, fixes, setFixes, p, ...calc, lang, simple };
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useCoach() {
  const c = useContext(C);
  if (!c) throw new Error("useCoach outside provider");
  return c;
}

export const gbp = (n: number, dp = 0) =>
  `${n < 0 ? "−" : ""}£${Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
export const pct = (x: number) => `${Math.round(x * 100)}%`;

/** Compact numbers-only context for the AI coach. */
export function coachContext(c: Ctx, live?: { dayMovePct: number | null }) {
  const s = c.sc.summary;
  return {
    name: c.p.name,
    monthly: { income: Math.round(s.income), outgoings: Math.round(s.outgoings), surplus: Math.round(s.surplus), essentials: Math.round(s.essentials) },
    savings: c.p.savings, balance: c.p.balance, invested: c.store.invested,
    resilienceScore: c.sc.total, rung: c.sc.rung, rungName: Engine.RUNGS[c.sc.rung - 1].name, nextAction: c.sc.action,
    forecast90: { worstDate: Engine.fmtDate(c.fcRaw.worstDate), chanceBelowZero: pct(c.fcRaw.worstPNeg), lowestLikelyBalance: Math.round(c.fcRaw.lowestP10) },
    fixes: c.fixList.map((f: any) => ({ title: f.title, riskAfter: pct(f.after) })),
    riskBand: c.rp.label, portfolioMix: c.rp.mix, liveDayChangePct: live?.dayMovePct ?? null,
    goal: c.p.goals?.[0] ?? null,
  };
}
