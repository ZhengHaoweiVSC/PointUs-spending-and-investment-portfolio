import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteShell } from "./SiteChrome";
import { SiteButton } from "./SiteButton";
import { Gallery } from "@/components/Gallery";

export type Section = { eyebrow?: string; title: string; body: ReactNode; alt?: boolean };
export type Faq = { q: string; a: string };

export function MarketingPage({
  eyebrow, title, subhead, sections, gallery, faq, after, heroExtra,
}: {
  eyebrow: string; title: string; subhead: string; sections: Section[]; gallery?: boolean; faq?: Faq[]; after?: ReactNode; heroExtra?: ReactNode;
}) {
  return (
    <SiteShell>
      <section className="h-section">
        <div className="h-container">
          <p className="h-eyebrow">{eyebrow}</p>
          <h1 className="h-h1 h-hero-title mt-3">{title}</h1>
          <p className="h-lead mt-5">{subhead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <SiteButton asChild className="h-btn h-btn-primary"><Link to="/signup">Start free: see your next 90 days</Link></SiteButton>
            <SiteButton asChild className="h-btn"><Link to="/demo">Try the demo</Link></SiteButton>
          </div>
          {heroExtra}
        </div>
      </section>
      {sections.map((s, i) => (
        <section key={i} className={`h-section ${s.alt ? "h-section-alt" : ""}`}>
          <div className="h-container grid gap-6 lg:grid-cols-[1fr_2fr]">
            <div>
              {s.eyebrow && <p className="h-eyebrow">{s.eyebrow}</p>}
              <h2 className="h-h2 mt-2">{s.title}</h2>
            </div>
            <div className="h-prose min-w-0">{s.body}</div>
          </div>
        </section>
      ))}
      {gallery && (
        <section className="h-section">
          <div className="h-container">
            <h2 className="h-h2 mb-6">Inside the app</h2>
            <Gallery />
          </div>
        </section>
      )}
      {after}
      {faq && faq.length > 0 && (
        <section className="h-section h-section-alt">
          <div className="h-container">
            <h2 className="h-h2 mb-6">Questions people ask</h2>
            <dl className="grid gap-4 md:grid-cols-2">
              {faq.map((f) => (
                <div key={f.q} className="h-card">
                  <dt className="h-h3">{f.q}</dt>
                  <dd className="mt-2 h-muted">{f.a}</dd>
                </div>
              ))}
            </dl>
            <Link to="/about" className="h-link mt-6 inline-block">Read all frequently asked questions</Link>
          </div>
        </section>
      )}
      <CtaBand />
    </SiteShell>
  );
}

export function CtaBand() {
  return (
    <section className="h-cta-band" aria-labelledby="cta-title">
      <div className="h-container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="cta-title" className="h-h2">Start free: see your next 90 days</h2>
          <p className="mt-2">Five minutes. No bank login needed. Delete everything any time.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SiteButton asChild className="h-btn h-btn-primary"><Link to="/signup">Start free</Link></SiteButton>
          <SiteButton asChild className="h-btn h-btn-dark"><Link to="/demo">Try the demo</Link></SiteButton>
        </div>
      </div>
    </section>
  );
}
