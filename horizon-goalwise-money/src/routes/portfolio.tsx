import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site/SiteChrome";
import { PortfolioSection } from "@/components/portfolio/PortfolioSection";
import { pageHead } from "@/lib/seo";
import { supabase } from "@/integrations/supabase/client";
import type { Stored } from "@/lib/coach";

export const Route = createFileRoute("/portfolio")({ head: () => pageHead("portfolio"), component: Page });

function Page() {
  const [stored, setStored] = useState<Stored | null>(null);

  useEffect(() => {
    let active = true;
    async function loadPortfolio() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user?.email_confirmed_at) { setStored(null); return; }
      const { data } = await supabase.from("profiles").select("profile").eq("user_id", user.id).maybeSingle();
      if (!active) return;
      const profile = data?.profile as unknown as Stored | undefined;
      setStored(profile?.engine && profile.consent ? profile : null);
    }
    void loadPortfolio();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setStored(null);
      if (event === "SIGNED_IN" || event === "USER_UPDATED") void loadPortfolio();
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  return (
    <SiteShell>
      <section className="h-section">
        <div className="h-container">
          <PortfolioSection stored={stored} />
        </div>
      </section>
    </SiteShell>
  );
}
