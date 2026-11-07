import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingPage } from "@/components/site/MarketingPage";
import { MarketTicker } from "@/components/MarketTicker";
import { ContactForm } from "@/components/ContactForm";
import { pageHead } from "@/lib/seo";
import { Engine } from "@/lib/engine";

export const Route = createFileRoute("/")({ head: () => pageHead("home"), component: Home });

function Home() {
  return (
    <MarketingPage
      eyebrow="Free AI money coach · UK"
      title="PointUs AI money coach"
      subhead="See your next 90 days. Fix money stress before it starts. Then grow. Free money guidance for irregular lives, with a cash flow forecast and a personalised portfolio plan."
      heroExtra={<div className="mt-10 -mx-4 md:-mx-8"><MarketTicker /></div>}
      gallery
      sections={[
        { eyebrow: "The problem", title: "Money stress hits irregular incomes hardest", body: <>
          <p>Millions of people in the UK are paid by the shift, the week or the gig. Their income moves every month, but rent, energy and council tax don't. Most budgeting apps look backwards at what you spent last month. That's too late when a £400 boiler bill lands two days before payday.</p>
          <p>Money stress isn't about being bad with money. It's about not being able to see what's coming. That's the gap PointUs fills, and it's why we built a budgeting app for irregular income first, rather than as an afterthought.</p></> },
        { eyebrow: "How PointUs helps", title: "Protect, then plan, then grow", alt: true, body: <>
          <ul>
            <li><strong>Protect.</strong> A 90-day cash flow forecast runs 1,000 simulated futures and shows the exact day you're most at risk of going below £0, and how likely it is.</li>
            <li><strong>Plan.</strong> Simple fixes, like spreading an annual bill or setting aside a few pounds a week, are tested live so you can see the risk fall before you commit.</li>
            <li><strong>Grow.</strong> Once your emergency fund is in place, we build a personalised investment portfolio that matches both your goal and how much risk you can really afford.</li>
          </ul>
          <p>Every number comes from a tested maths engine. AI only explains it, in plain English, Hindi or Polish.</p></> },
        { eyebrow: "The Resilience Ladder", title: "Five rungs to financial wellbeing", body: <>
          <ol className="list-decimal pl-5">{Engine.RUNGS.map((r: { n: number; name: string; goal: string }) => <li key={r.n}><strong>{r.name}:</strong> {r.goal}.</li>)}</ol>
          <p>We never suggest investing while you're on the first two rungs. Your monthly money goes to safety first: that's our ethical gate.</p></> },
        { eyebrow: "Impact", title: "Built for financial inclusion", alt: true, body: <>
          <ul>
            <li>Works without bank data: answer 16 quick questions, or skip any you like.</li>
            <li>Free core features, forever. No ads, and we never sell data.</li>
            <li>Designed for gig and shift workers, single parents, international students, newcomers and older people.</li>
          </ul>
          <p><Link to="/for-communities" className="h-link">See who PointUs is for</Link></p></> },
      ]}
      after={
        <section className="h-section">
          <div className="h-container grid gap-8 lg:grid-cols-2">
            <div><h2 className="h-h2">Join the pilot</h2><p className="mt-3 h-muted">Run PointUs with your community group, employer or charity. Tell us a little and we'll be in touch.</p></div>
            <ContactForm short />
          </div>
        </section>
      }
      faq={[
        { q: "Is PointUs really free?", a: "Yes. The core coach, forecast and portfolio guidance are free. There are no ads and we never sell data." },
        { q: "Do I need to connect my bank?", a: "No. You can answer a few questions instead. Your answers are used to provide the coach, as explained in our privacy policy." },
      ]}
    />
  );
}
