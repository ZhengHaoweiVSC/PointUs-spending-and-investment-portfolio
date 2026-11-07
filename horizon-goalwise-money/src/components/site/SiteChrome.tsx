import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { SiteButton } from "./SiteButton";
import { BRAND } from "@/lib/brand";

export const NAV = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/for-communities", label: "For communities" },
  { to: "/about", label: "About & FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

const FOOTER = [
  { to: "/", label: "Home" },
  { to: "/login", label: "Log in" },
  ...NAV,
  { to: "/financial-time-travel", label: "Financial time travel" },
  { to: "/demo", label: "Try the demo" },
  { to: "/signup", label: "Get started free" },
  { to: "/security-and-privacy", label: "Security brief" },
  { to: "/privacy", label: "Privacy policy" },
  { to: "/terms", label: "Terms of use" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="h-head flex items-center gap-2 text-xl font-bold" aria-label={`${BRAND} home`}>
      <span aria-hidden="true" className="inline-block h-5 w-5 h-fill-ok" />
      {BRAND}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="h-header">
      <div className="h-container flex min-h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center xl:flex">
          {NAV.map((n) => <Link key={n.to} to={n.to} className="h-nav-link">{n.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 xl:flex">
          <Link to="/login" className="h-btn h-btn-ghost">Log in</Link>
          <Link to="/signup" className="h-btn h-btn-primary">Get started free</Link>
        </div>
        <SiteButton ref={toggle} className="h-icon-btn h-menu-toggle" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </SiteButton>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="h-mobile-menu xl:hidden">
          <div className="h-container flex flex-col py-3">
            {NAV.map((n) => <Link key={n.to} to={n.to} className="h-nav-link" onClick={() => setOpen(false)}>{n.label}</Link>)}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/login" onClick={() => setOpen(false)} className="h-btn">Log in</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="h-btn h-btn-primary">Get started free</Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="h-footer">
      <div className="h-container grid gap-8 md:grid-cols-3">
        <div>
          <p className="h-head text-2xl font-bold">{BRAND}</p>
          <p className="mt-2 text-sm">A free AI money coach for financial resilience. Guidance, not regulated financial advice.</p>
          <p className="mt-4 text-sm">Struggling? Samaritans, 24/7: 116 123</p>
        </div>
        <nav aria-label="Footer" className="md:col-span-2">
          <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
            {FOOTER.map((f) => <li key={f.to}><Link to={f.to}>{f.label}</Link></li>)}
            <li><a href="/sitemap.xml">Sitemap</a></li>
          </ul>
        </nav>
      </div>
      <div className="h-container mt-8 text-sm">© 2026 {BRAND}. Built at the NatWest hackathon 2026.</div>
    </footer>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter />
    </>
  );
}
