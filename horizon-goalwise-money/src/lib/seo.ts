import { BRAND, SITE_URL } from "./brand";

type Entry = { path: string; title: string; description: string; crumb: string; app?: boolean; noindex?: boolean; software?: boolean; type?: "AboutPage" | "ContactPage" | "FAQPage" };

export const SEO = {
  home: { path: "/", crumb: "Home", title: `${BRAND} | AI Money Coach`, description: "A free AI money coach for irregular income. Forecast your next 90 days, protect your emergency fund and plan a personalised investment portfolio.", software: true },
  how: { path: "/how-it-works", crumb: "How it works", title: `How it works & features | ${BRAND}`, description: "See how PointUs turns your answers into a 90-day forecast, practical fixes, a goal-based portfolio and clear explanations—without a bank login.", software: true },
  portfolio: { path: "/portfolio", crumb: "Portfolio", title: `Your portfolio | ${BRAND} AI Money Coach`, description: "View a personalised portfolio or labelled demo with live market-proxy prices, asset allocation and six explained portfolio statistics.", software: true },
  time: { path: "/financial-time-travel", crumb: "Financial time travel", title: `Financial time travel | ${BRAND} AI Money Coach`, description: "How 1,000 simulated futures show the chance your balance dips below £0 in the next 90 days, and which fixes protect you." },
  communities: { path: "/for-communities", crumb: "For communities", title: `For communities | ${BRAND} AI Money Coach`, description: "Financial inclusion for shift workers, parents, students and newcomers. A free, multilingual money coach with no bank connection needed." },
  security: { path: "/security-and-privacy", crumb: "Security and privacy", title: `Security brief | ${BRAND} AI Money Coach`, description: "Read the PointUs security brief: minimal data, account protection, deletion controls and AI explanations. Guidance, not regulated advice." },
  about: { path: "/about", crumb: "About & FAQ", title: `About & FAQ | ${BRAND} AI Money Coach`, description: "Why PointUs puts financial resilience first, plus answers about forecasts, portfolios, privacy, accessibility, pricing and getting started.", type: "AboutPage" },
  contact: { path: "/contact", crumb: "Contact", title: `Contact | ${BRAND} AI Money Coach`, description: "Run a pilot with your community, partner with us, ask a press question or send feedback. We reply within two working days.", type: "ContactPage" },
  privacy: { path: "/privacy", crumb: "Privacy policy", title: `Privacy policy | ${BRAND} AI Money Coach`, description: "What PointUs collects, why we use it, who processes it and your UK GDPR rights. Read about account, AI and contact-message privacy." },
  terms: { path: "/terms", crumb: "Terms", title: `Terms of use | ${BRAND} AI Money Coach`, description: "The terms you agree to when using the coach: guidance not regulated advice, acceptable use, your responsibilities and ours." },
  notfound: { path: "/404", crumb: "Page not found", title: `Page not found | ${BRAND} AI Money Coach`, description: "This PointUs page could not be found. Return home, explore the money coach or contact the team.", noindex: true },
  signup: { path: "/signup", crumb: "Sign up", title: `Create your free account | ${BRAND}`, description: "Create a free account to see your next 90 days and build your personalised plan.", noindex: true },
  login: { path: "/login", crumb: "Log in", title: `Log in | ${BRAND}`, description: "Log in to your money coach.", noindex: true },
  forgot: { path: "/forgot-password", crumb: "Forgot password", title: `Reset your password | ${BRAND}`, description: "Get a link to reset your password.", noindex: true },
  reset: { path: "/reset-password", crumb: "Reset password", title: `Choose a new password | ${BRAND}`, description: "Set a new password.", noindex: true },
  verify: { path: "/verify-email", crumb: "Verify email", title: `Check your inbox | ${BRAND}`, description: "Confirm your email to continue.", noindex: true },
  demo: { path: "/demo", crumb: "Demo", title: `Try the demo | ${BRAND}`, description: "Try the full app as a fictional persona. Nothing is saved.", noindex: true },
  onboarding: { path: "/onboarding", crumb: "Onboarding", title: `Get set up | ${BRAND}`, description: "Tell us about you.", noindex: true },
  app: { path: "/app", crumb: "App", title: `Your portfolio | ${BRAND}`, description: "Your portfolio dashboard.", noindex: true },
} satisfies Record<string, Entry>;

export type SeoKey = keyof typeof SEO;

const org = { "@context": "https://schema.org", "@type": "Organization", name: BRAND, url: SITE_URL, logo: `${SITE_URL}/og/horizon-og.png` };
const site = { "@context": "https://schema.org", "@type": "WebSite", name: `${BRAND} AI Money Coach`, url: SITE_URL };

export function pageHead(key: SeoKey, extraLd: object[] = []) {
  const e: Entry = SEO[key];
  const url = SITE_URL + (e.path === "/" ? "/" : e.path);
  const img = `${SITE_URL}/og/horizon-og.png`;
  const ld: object[] = [org, site, ...extraLd];
  if (e.software) ld.push({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: BRAND, applicationCategory: "FinanceApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" } });
  if (e.path !== "/") ld.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
    { "@type": "ListItem", position: 2, name: e.crumb, item: url },
  ] });
  if (e.type === "AboutPage" || e.type === "ContactPage") ld.push({ "@context": "https://schema.org", "@type": e.type, name: e.title, url });
  return {
    meta: [
      { title: e.title },
      { name: "description", content: e.description },
      { name: "robots", content: e.noindex ? "noindex, nofollow" : "index, follow" },
      { property: "og:title", content: e.title },
      { property: "og:description", content: e.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: BRAND },
      { property: "og:image", content: img },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: e.title },
      { name: "twitter:description", content: e.description },
      { name: "twitter:image", content: img },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: e.noindex ? [] : ld.map((x) => ({ type: "application/ld+json", children: JSON.stringify(x) })),
  };
}

export const PUBLIC_PATHS = Object.values(SEO as Record<string, Entry>).filter((e) => !e.noindex).map((e) => e.path);
