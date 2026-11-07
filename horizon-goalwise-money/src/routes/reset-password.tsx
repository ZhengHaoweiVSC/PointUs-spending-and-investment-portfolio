import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthCard } from "@/components/site/AuthCard";
import { TextField } from "@/components/forms";
import { passwordStrength } from "@/lib/email";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/reset-password")({ head: () => pageHead("reset"), component: Reset });

function Reset() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((ev) => { if (ev === "PASSWORD_RECOVERY" || ev === "SIGNED_IN") setReady(true); });
    supabase.auth.getSession().then(({ data: s }) => s.session && setReady(true));
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <AuthCard title="Choose a new password">
      {!ready ? <p>Open this page from the link in your reset email.</p> : (
        <form className="grid gap-5" noValidate onSubmit={async (e) => {
          e.preventDefault();
          if (passwordStrength(pw).score < 2 || pw.length < 8) { setErr("Use at least 8 characters with a mix of letters, numbers and symbols."); return; }
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password: pw });
          setBusy(false);
          if (error) { setErr("We couldn't update your password. The link may have expired."); return; }
          nav({ to: "/app" });
        }}>
          <TextField id="r-pw" label="New password" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} error={err} hint={`Strength: ${passwordStrength(pw).label}`} />
          <button type="submit" className="h-btn h-btn-primary" disabled={busy}>{busy ? "Saving…" : "Save new password"}</button>
        </form>
      )}
    </AuthCard>
  );
}
