import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/site/AuthCard";
import { FieldError, TextField } from "@/components/forms";
import { Bar } from "@/components/app/charts";
import { isDisposable, passwordStrength, suggestEmail } from "@/lib/email";
import { CONSENT_VERSION } from "@/lib/brand";
import { DEMO_KEY } from "@/lib/coach";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/signup")({ head: () => pageHead("signup"), component: Signup });

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
  consent: z.literal(true, { message: "Please agree to the terms, privacy policy and security brief" }),
});

function Signup() {
  const nav = useNavigate();
  const [v, setV] = useState({ name: "", email: "", password: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const strength = passwordStrength(v.password);
  const suggestion = v.email.includes("@") ? suggestEmail(v.email) : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(v);
    const errs: Record<string, string> = {};
    if (!r.success) for (const i of r.error.issues) errs[String(i.path[0])] ??= i.message;
    if (!errs.email && isDisposable(v.email)) errs.email = "Temporary email addresses can't be used. Please use your normal email.";
    if (!errs.password && strength.score < 2) errs.password = "Make your password stronger: mix letters, numbers and a symbol.";
    setErrors(errs);
    if (Object.keys(errs).length) { document.getElementById(`s-${Object.keys(errs)[0]}`)?.focus(); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: v.email.trim(), password: v.password,
      options: { emailRedirectTo: `${window.location.origin}/verify-email`, data: { full_name: v.name.trim(), consent_version: CONSENT_VERSION, consent_at: new Date().toISOString() } },
    });
    setBusy(false);
    if (error) { setErrors({ form: error.message.includes("registered") ? "An account with this email already exists. Try logging in." : "We couldn't create your account. Please try again." }); return; }
    sessionStorage.removeItem(DEMO_KEY);
    nav({ to: "/verify-email", search: { email: v.email.trim() } });
  }

  return (
    <AuthCard title="Create your free account" lead="Five minutes to see your next 90 days. No bank login needed.">
      <form onSubmit={submit} noValidate className="grid gap-5">
        <TextField id="s-name" label="First name" autoComplete="given-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={errors.name} />
        <TextField id="s-email" label="Email" type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} error={errors.email}>
          {suggestion && <p className="h-hint">Did you mean <button type="button" className="h-link" onClick={() => setV({ ...v, email: suggestion })}>{suggestion}</button>?</p>}
        </TextField>
        <TextField id="s-password" label="Password" type="password" autoComplete="new-password" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} error={errors.password}
          hint="At least 8 characters. Longer is stronger.">
          {v.password && <div className="mt-2"><Bar value={(strength.score + 1) / 5} tone={strength.score < 2 ? "risk" : strength.score < 3 ? "warn" : "ok"} label={`Password strength: ${strength.label}`} /><p className="h-hint" aria-live="polite">Strength: {strength.label}</p></div>}
        </TextField>
        <div>
          <label className="h-check" htmlFor="s-consent">
            <input id="s-consent" type="checkbox" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} aria-describedby={errors.consent ? "s-consent-err" : undefined} />
            <span>I agree to the <Link to="/terms" className="h-link" target="_blank">terms of use</Link> and <Link to="/privacy" className="h-link" target="_blank">privacy policy</Link>, and I've read the <Link to="/security-and-privacy" className="h-link" target="_blank">security brief</Link>.</span>
          </label>
          <FieldError id="s-consent-err" msg={errors.consent} />
        </div>
        <FieldError id="s-form-err" msg={errors.form} />
        <button type="submit" className="h-btn h-btn-primary" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
        <p className="text-sm">Already have an account? <Link to="/login" className="h-link">Log in</Link></p>
      </form>
    </AuthCard>
  );
}
