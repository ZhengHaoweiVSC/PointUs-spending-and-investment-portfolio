import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteChrome";
import { ConsentGate } from "@/components/ConsentGate";
import { Personas } from "@/lib/personas";
import { DEMO_KEY } from "@/lib/coach";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/demo")({ head: () => pageHead("demo"), component: Demo });

function Demo() {
  const nav = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const go = (id: string) => { sessionStorage.setItem(DEMO_KEY, id); nav({ to: "/app" }); };
  return (
    <SiteShell>
      <section className="h-section">
        <div className="h-container grid gap-8">
          <div>
            <p className="h-eyebrow"><span className="h-badge h-badge-warn">Demo mode: fictional data, nothing saved</span></p>
            <h1 className="h-h1 mt-4">Try PointUs as someone else</h1>
            <p className="h-lead mt-4">Pick a fictional person and explore the full app: portfolio, 90-day forecast, fixes, goals and the AI coach. No sign-up.</p>
          </div>
          {!agreed ? <ConsentGate demo onAccept={() => setAgreed(true)} cta="I agree, choose a persona" /> : (
            <ul className="grid gap-4 md:grid-cols-3">
              {Personas.list.map((p) => (
                <li key={p.id} className="h-card h-card-primary flex flex-col">
                  <p className="text-4xl" aria-hidden="true">{p.emoji}</p>
                  <h2 className="h-h3 mt-2">{p.name}, {p.age}</h2>
                  <p className="mt-2 flex-1">{p.blurb}</p>
                  <button type="button" className="h-btn h-btn-primary mt-4" onClick={() => go(p.id)}>Explore as {p.name}</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
