import type { ReactNode } from "react";
import { SiteShell } from "./SiteChrome";

export function AuthCard({ title, lead, children }: { title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <SiteShell>
      <section className="h-section">
        <div className="h-container max-w-xl">
          <h1 className="h-h2">{title}</h1>
          {lead && <p className="mt-3 h-muted">{lead}</p>}
          <div className="h-card mt-6">{children}</div>
        </div>
      </section>
    </SiteShell>
  );
}
