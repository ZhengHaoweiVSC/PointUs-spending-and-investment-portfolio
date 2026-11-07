import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_KEY, useCoach } from "@/lib/coach";
import { Card } from "@/components/app/widgets";

export const Route = createFileRoute("/app/help")({ component: Help });

const CHECKS = [
  { k: "benefits", label: "Check benefits you may be missing", href: "https://benefits-calculator.turn2us.org.uk/", site: "Turn2us benefits calculator" },
  { k: "council", label: "Check for Council Tax Reduction", href: "https://www.gov.uk/apply-council-tax-reduction", site: "GOV.UK Council Tax Reduction" },
  { k: "social", label: "Check for social tariffs on broadband and phone", href: "https://www.moneyhelper.org.uk/en/everyday-money/types-of-account/social-tariffs", site: "MoneyHelper social tariffs" },
] as const;

function Help() {
  const c = useCoach();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const checks = c.p.supportChecks ?? {};

  async function deleteAll() {
    setBusy(true); setErr("");
    if (c.mode === "demo") { sessionStorage.removeItem(DEMO_KEY); nav({ to: "/demo", replace: true }); return; }
    const { error } = await supabase.from("profiles").delete().eq("user_id", c.userId!);
    if (error) { setErr("We couldn't delete your data. Please try again."); setBusy(false); return; }
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/", replace: true });
  }

  return (
    <div className="grid gap-6">
      <header><p className="h-eyebrow">Help and support</p><h1 className="h-h2 mt-1">Help, transparency and your data</h1></header>
      <Card id="checks" title="Support checks (each one raises your score)">
        <ul className="grid gap-3">
          {CHECKS.map((x) => (
            <li key={x.k} className="h-card">
              <label className="h-check">
                <input type="checkbox" checked={!!checks[x.k]} onChange={(e) => c.update({ engine: { ...c.p, supportChecks: { ...checks, [x.k]: e.target.checked } } })} />
                <span>{x.label}</span>
              </label>
              <a href={x.href} target="_blank" rel="noopener noreferrer" className="h-link text-sm">Open the {x.site}</a>
            </li>
          ))}
        </ul>
      </Card>
      <Card id="crisis" title="If things feel too much" tone="warn">
        <p>Samaritans are there 24/7, free: call <strong>116 123</strong>. For debt worries: <a className="h-link" href="https://www.stepchange.org" target="_blank" rel="noopener noreferrer">StepChange</a> or <a className="h-link" href="https://www.citizensadvice.org.uk" target="_blank" rel="noopener noreferrer">Citizens Advice</a>.</p>
      </Card>
      <Card id="transp" title="How PointUs works">
        <ul className="grid gap-2 list-[square] pl-5">
          <li>A tested maths engine does every calculation. AI only explains the numbers in plain words.</li>
          <li>This is guidance, not regulated financial advice. We never recommend individual companies.</li>
          <li>We never sell your data. Read the <Link to="/security-and-privacy" className="h-link">security brief</Link> and <Link to="/privacy" className="h-link">privacy policy</Link>.</li>
        </ul>
      </Card>
      <Card id="edit" title="Edit my details">
        <p>Change your answers any time. Your plan updates straight away.</p>
        {c.mode === "user" ? <Link to="/onboarding" search={{ edit: true }} className="h-btn mt-3">Edit my details</Link> : <p className="mt-2 h-muted">Not available in demo mode.</p>}
      </Card>
      <Card id="delete" title="Delete all my data" tone="risk">
        {!confirm ? (
          <button type="button" className="h-btn h-btn-danger" onClick={() => setConfirm(true)}>Delete all my data</button>
        ) : (
          <div className="grid gap-3">
            <p>This permanently deletes your profile and plan, then signs you out. It can't be undone.</p>
            <div><label htmlFor="del" className="h-label">Type DELETE to confirm</label><input id="del" className="h-input" value={typed} onChange={(e) => setTyped(e.target.value)} /></div>
            {err && <p className="h-error" role="alert">{err}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="h-btn h-btn-danger" disabled={typed !== "DELETE" || busy} onClick={deleteAll}>{busy ? "Deleting…" : "Yes, delete everything"}</button>
              <button type="button" className="h-btn" onClick={() => { setConfirm(false); setTyped(""); }}>Cancel</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
