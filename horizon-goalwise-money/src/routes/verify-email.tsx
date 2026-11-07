import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/site/AuthCard";
import { nextStep } from "@/lib/auth-nav";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (s: Record<string, unknown>): { email?: string } => ({ email: typeof s.email === "string" ? s.email.slice(0, 255) : undefined }),
  head: () => pageHead("verify"),
  component: Verify,
});

function Verify() {
  const { email: qEmail } = Route.useSearch();
  const nav = useNavigate();
  const [email, setEmail] = useState(qEmail ?? "");
  const [cool, setCool] = useState(0);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let stop = false;
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email && !email) setEmail(session.user.email);
      if (session?.user?.email_confirmed_at && !stop) { const to = await nextStep(); if (to !== "/verify-email") nav({ to, replace: true }); }
    };
    check();
    const t = setInterval(check, 4000);
    const { data } = supabase.auth.onAuthStateChange(() => check());
    return () => { stop = true; clearInterval(t); data.subscription.unsubscribe(); };
  }, [nav, email]);

  useEffect(() => { if (cool <= 0) return; const t = setTimeout(() => setCool(cool - 1), 1000); return () => clearTimeout(t); }, [cool]);

  return (
    <AuthCard title="Check your inbox">
      <p className="flex items-start gap-3"><MailCheck aria-hidden="true" className="shrink-0" />
        <span>We've sent a confirmation link to <strong>{email || "your email"}</strong>. Click it to continue. This page moves on by itself once you've confirmed.</span></p>
      <p className="mt-3 text-sm h-muted">Can't see it? Check spam or promotions.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className="h-btn" disabled={cool > 0 || !email} onClick={async () => {
          const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${window.location.origin}/verify-email` } });
          setMsg(error ? "We couldn't resend just now. Please wait a minute and try again." : "Sent again. Check your inbox.");
          setCool(60);
        }}>{cool > 0 ? `Resend in ${cool}s` : "Resend email"}</button>
        <Link to="/login" className="h-btn h-btn-ghost">Back to log in</Link>
      </div>
      {msg && <p className="mt-3" role="status">{msg}</p>}
    </AuthCard>
  );
}
