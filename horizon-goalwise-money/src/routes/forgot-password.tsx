import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/site/AuthCard";
import { TextField } from "@/components/forms";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/forgot-password")({ head: () => pageHead("forgot"), component: Forgot });

function Forgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <AuthCard title="Reset your password">
      {sent ? <p role="status">If an account exists for {email}, we've sent a reset link. Check your inbox and spam folder.</p> : (
        <form className="grid gap-5" noValidate onSubmit={async (e) => {
          e.preventDefault();
          if (!/^\S+@\S+\.\S+$/.test(email)) { setErr("Enter a valid email address"); return; }
          setBusy(true);
          await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
          setBusy(false); setSent(true);
        }}>
          <TextField id="f-email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={err} />
          <button type="submit" className="h-btn h-btn-primary" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
          <Link to="/login" className="h-link text-sm">Back to log in</Link>
        </form>
      )}
    </AuthCard>
  );
}
