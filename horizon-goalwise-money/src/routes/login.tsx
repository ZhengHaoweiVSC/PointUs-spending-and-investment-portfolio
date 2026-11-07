import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/site/AuthCard";
import { FieldError, TextField } from "@/components/forms";
import { nextStep } from "@/lib/auth-nav";
import { DEMO_KEY } from "@/lib/coach";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({ head: () => pageHead("login"), component: Login });

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setErr("Enter your email and password."); return; }
    setBusy(true); setErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setBusy(false);
      if (/confirm/i.test(error.message)) { nav({ to: "/verify-email", search: { email: email.trim() } }); return; }
      setErr("That email and password don't match. Please try again.");
      return;
    }
    sessionStorage.removeItem(DEMO_KEY);
    const to = await nextStep();
    if (to === "/verify-email") nav({ to: "/verify-email", search: { email: email.trim() } });
    else if (to === "/onboarding") nav({ to: "/onboarding", search: { edit: undefined }, replace: true });
    else nav({ to, replace: true });
  }

  return (
    <AuthCard title="Log in" lead="Welcome back.">
      <form onSubmit={submit} noValidate className="grid gap-5">
        <TextField id="l-email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField id="l-password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <FieldError id="l-err" msg={err} />
        <button type="submit" className="h-btn h-btn-primary" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
        <div className="flex flex-wrap justify-between gap-2 text-sm">
          <Link to="/forgot-password" className="h-link">Forgot your password?</Link>
          <Link to="/signup" className="h-link">Create a free account</Link>
        </div>
      </form>
    </AuthCard>
  );
}
