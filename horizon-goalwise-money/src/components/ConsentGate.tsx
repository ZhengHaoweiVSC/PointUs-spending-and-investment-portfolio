import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { CONSENT_VERSION } from "@/lib/brand";

export type Consent = { version: string; acceptedAt: string; terms: boolean; privacy: boolean; security: boolean; guidance: boolean };

const BRIEF = [
  "We only ask for what the coach needs: no bank login, no ID documents, no card numbers.",
  "Your answers are stored encrypted, and only your signed-in account can read them.",
  "We never sell or share your data for advertising.",
  "A tested maths engine calculates every number. AI only explains them, and never sees your email.",
  "You can delete all your data at any time from Help → Delete all my data.",
  "We will never ask for your password, PIN or a one-time code by email, text or phone.",
];

export function ConsentGate({ onAccept, cta = "I agree, continue", demo = false }: { onAccept: (c: Consent) => void; cta?: string; demo?: boolean }) {
  const [v, setV] = useState({ terms: false, privacy: false, security: false, guidance: false });
  const [tried, setTried] = useState(false);
  const all = v.terms && v.privacy && v.security && v.guidance;
  const items = [
    { k: "security", label: <>I have read the security brief above and the full <Link to="/security-and-privacy" className="h-link" target="_blank">security brief</Link>.</> },
    { k: "privacy", label: <>I agree to the <Link to="/privacy" className="h-link" target="_blank">privacy policy</Link>{demo ? "" : " and how my answers are stored"}.</> },
    { k: "terms", label: <>I agree to the <Link to="/terms" className="h-link" target="_blank">terms of use</Link>.</> },
    { k: "guidance", label: <>I understand PointUs gives guidance, not regulated financial advice, and I stay in control of my decisions.</> },
  ] as const;
  return (
    <section className="h-card" aria-labelledby="brief-title">
      <h2 id="brief-title" className="h-h3 flex items-center gap-2"><ShieldCheck aria-hidden="true" /> Security brief</h2>
      <ul className="mt-3 grid gap-2 list-[square] pl-5">{BRIEF.map((b) => <li key={b}>{b}</li>)}</ul>
      <fieldset className="mt-5 grid gap-1">
        <legend className="h-label">Before you continue, please confirm:</legend>
        {items.map((i) => (
          <label key={i.k} className="h-check">
            <input type="checkbox" checked={v[i.k]} onChange={(e) => setV((s) => ({ ...s, [i.k]: e.target.checked }))} aria-invalid={tried && !v[i.k] ? true : undefined} />
            <span>{i.label}</span>
          </label>
        ))}
      </fieldset>
      {tried && !all && <p className="h-error" role="alert">Please tick all four boxes to continue.</p>}
      <button type="button" className="h-btn h-btn-primary mt-4" aria-disabled={!all} onClick={() => {
        setTried(true);
        if (all) onAccept({ ...v, version: CONSENT_VERSION, acceptedAt: new Date().toISOString() });
      }}>{cta}</button>
    </section>
  );
}
