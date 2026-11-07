import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Briefcase, CalendarClock, ClipboardList, LifeBuoy, Newspaper, Settings, Target, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CoachProvider, DEMO_KEY, demoStored, useCoach, type Stored } from "@/lib/coach";
import { Personas } from "@/lib/personas";
import { t, type TKey } from "@/lib/i18n";
import { Logo } from "@/components/site/SiteChrome";
import { ChatWidget } from "@/components/app/ChatWidget";
import { pageHead } from "@/lib/seo";

type Boot = { mode: "demo" | "user"; initial: Stored; userId?: string; personaId?: string };

export const Route = createFileRoute("/app")({
  ssr: false,
  head: () => pageHead("app"),
  beforeLoad: async (): Promise<{ boot: Boot }> => {
    const demo = sessionStorage.getItem(DEMO_KEY);
    if (demo) return { boot: { mode: "demo", personaId: demo, initial: demoStored(demo) } };
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/login" });
    if (!user.email_confirmed_at) throw redirect({ to: "/verify-email" });
    const { data } = await supabase.from("profiles").select("profile").eq("user_id", user.id).maybeSingle();
    const prof = data?.profile as unknown as Stored | undefined;
    if (!prof?.engine || !prof?.consent) throw redirect({ to: "/onboarding" });
    return { boot: { mode: "user", userId: user.id, initial: prof } };
  },
  component: AppLayout,
});

const LINKS: { to: string; k: TKey; icon: typeof Briefcase; tab?: boolean }[] = [
  { to: "/app", k: "portfolio", icon: Briefcase, tab: true },
  { to: "/app/time-travel", k: "time", icon: CalendarClock, tab: true },
  { to: "/app/goals", k: "goals", icon: Target, tab: true },
  { to: "/app/plan", k: "plan", icon: ClipboardList, tab: true },
  { to: "/app/briefing", k: "briefing", icon: Newspaper, tab: true },
  { to: "/app/help", k: "help", icon: LifeBuoy },
  { to: "/app/settings", k: "settings", icon: Settings },
];

function AppLayout() {
  const { boot } = Route.useRouteContext();
  return (
    <CoachProvider key={boot.userId ?? boot.personaId} initial={boot.initial} mode={boot.mode} userId={boot.userId} personaId={boot.personaId}>
      <Shell />
    </CoachProvider>
  );
}

function Shell() {
  const c = useCoach();
  const nav = useNavigate();
  const qc = useQueryClient();
  async function leave() {
    if (c.mode === "demo") { sessionStorage.removeItem(DEMO_KEY); nav({ to: "/demo", replace: true }); return; }
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/login", replace: true });
  }
  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      {c.mode === "demo" && (
        <div className="h-demo-bar">
          <div className="flex flex-wrap items-center gap-3 px-4 py-2 text-sm">
            <strong>Demo mode: fictional data, nothing saved.</strong>
            <label htmlFor="persona" className="sr-only">Choose persona</label>
            <select id="persona" className="h-select max-w-56" value={c.personaId} onChange={(e) => c.setPersona(e.target.value)}>
              {Personas.list.map((p) => <option key={p.id} value={p.id}>{p.name}: {p.blurb.split(".")[0]}</option>)}
            </select>
            <button className="h-btn h-btn-sm" onClick={leave}>Exit demo</button>
            <Link to="/signup" className="h-btn h-btn-sm h-btn-primary">Start free with my numbers</Link>
          </div>
        </div>
      )}
      <div className="lg:grid lg:grid-cols-[15rem_1fr]">
        <aside className="h-sidenav hidden min-h-screen flex-col gap-1 p-4 lg:flex">
          <Logo />
          <nav aria-label="App" className="mt-6 flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="h-side-link">
                <l.icon aria-hidden="true" size={18} /> {t(l.k, c.lang)}
              </Link>
            ))}
          </nav>
          <button className="h-side-link mt-auto" onClick={leave}><LogOut aria-hidden="true" size={18} />{c.mode === "demo" ? "Exit demo" : t("logout", c.lang)}</button>
        </aside>
        <div className="min-w-0">
          <header className="h-header flex items-center justify-between gap-2 px-4 py-2 lg:hidden">
            <Logo />
            <nav aria-label="More" className="flex gap-1">
              <Link to="/app/help" className="h-nav-link">{t("help", c.lang)}</Link>
              <Link to="/app/settings" className="h-nav-link">{t("settings", c.lang)}</Link>
            </nav>
          </header>
          <main id="main" className="mx-auto w-full max-w-6xl p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
      <nav aria-label="Tabs" className="h-tabbar lg:hidden">
        {LINKS.filter((l) => l.tab).map((l) => (
          <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="h-tab">
            <l.icon aria-hidden="true" size={20} /> {t(l.k, c.lang)}
          </Link>
        ))}
      </nav>
      <ChatWidget />
    </div>
  );
}
