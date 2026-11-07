import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/site/MarketingPage";
import { pageHead } from "@/lib/seo";

const FAQS = [
  { q: "What is PointUs, and is it free?", a: "PointUs is a free AI money coach that forecasts your next 90 days, helps you reduce money stress and builds a goal-based portfolio. The core coach has no ads, and we never sell your data." },
  { q: "Do I need to connect my bank account?", a: "No. You answer a few questions instead, and you can skip any of them." },
  { q: "Is PointUs financial advice?", a: "No. It provides guidance, not regulated financial advice. You stay in control of every decision." },
  { q: "How does the forecast handle irregular income?", a: "It supports weekly, fortnightly, four-weekly and monthly pay. We simulate 1,000 possible 90-day futures with varying pay, spending and timing, then show the chance your balance falls below £0." },
  { q: "How big should my emergency fund be?", a: "After a £500 starter buffer, PointUs aims for three months of essentials—or six months when income varies substantially or you have dependants." },
  { q: "When will PointUs suggest investing?", a: "Only after your 90-day forecast has no shortfall, you have a starter buffer and no debt above 15% APR, and your emergency fund is growing." },
  { q: "Will PointUs tell me which shares to buy?", a: "No. It discusses cash, bonds and global shares as asset types, never individual stocks. Live market proxies illustrate how a portfolio mix moves." },
  { q: "What is a Lifetime ISA?", a: "A UK savings wrapper for a first home or retirement that must be opened before age 40. The government adds 25% to eligible contributions, up to £1,000 per year; withdrawal rules and penalties can apply." },
  { q: "What happens when live prices cannot load?", a: "PointUs shows a data-delayed badge and uses the last available prices when possible. It never invents missing values; market proxies are quoted in US dollars." },
  { q: "How is my data protected, and can I delete it?", a: "Before starting, you review the security brief and agree to the terms and privacy policy. Your signed-in account controls access to your saved answers. Help → Delete all my data permanently deletes your profile and signs you out." },
  { q: "What if a contact message cannot send?", a: "With your permission, the unsent message stays on your device and retries when you reconnect or reopen PointUs. A unique reference prevents duplicate submissions." },
  { q: "Can I try PointUs without signing up?", a: "Yes. Explore the full app as a fictional person in demo mode; nothing is saved. Menus and the coach support English, Hindi and Polish, with simple mode and read-aloud options." },
];

const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

export const Route = createFileRoute("/about")({ head: () => pageHead("about", [faqLd]), component: Page });

function Page() {
  return (
    <MarketingPage eyebrow="About & FAQ" title="Why PointUs exists"
      subhead="Financial resilience should not depend on a steady salary. PointUs helps people see trouble early, protect their essentials and then build towards their goals."
      sections={[
        { title: "Protect first, grow second", body: <p>Irregular income leaves less room for surprises. PointUs prioritises a safe emergency fund and manageable debt before investing, then turns each situation into one clear next step.</p> },
        { title: "Our principles", alt: true, body: <ul><li>Show the next step instead of lecturing.</li><li>Explain every number and recommendation.</li><li>Never judge someone for money worries.</li><li>Never sell data or push financial products.</li></ul> },
        { title: "Built for financial inclusion", body: <p>PointUs was created for the NatWest hackathon 2026 around AI-powered financial inclusion and resilience. It combines a tested calculation engine with plain-language AI explanations. It is a hackathon project, not a NatWest banking product or an endorsement of any investment provider.</p> },
        { title: "Frequently asked questions", alt: true, body: <div>{FAQS.map((f) => <details key={f.q} className="h-faq-item"><summary>{f.q}</summary><p>{f.a}</p></details>)}</div> },
      ]}
    />
  );
}
