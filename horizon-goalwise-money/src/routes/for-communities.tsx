import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingPage } from "@/components/site/MarketingPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/for-communities")({ head: () => pageHead("communities"), component: Page });

function Page() {
  return (
    <MarketingPage eyebrow="Financial inclusion" title="Built for the people money apps forget"
      subhead="PointUs is free, works without bank data and speaks your language. Designed with people whose income doesn't arrive in neat monthly salaries."
      sections={[
        { title: "Gig and shift workers", body: <p>If your hours change every week, a monthly budget doesn't fit. PointUs models weekly, fortnightly and four-weekly pay, learns how much it usually varies, and warns you weeks ahead when a thin month is coming. It's a budgeting app for irregular income at its core.</p> },
        { title: "Single parents and carers", alt: true, body: <p>With dependants, the safety net matters more. Your full emergency fund target rises to six months, school costs and Christmas are built in, and support checks for benefits, Council Tax Reduction and social tariffs are one tap away. Small fixes are tested before you commit, so there are no nasty surprises.</p> },
        { title: "International students and newcomers", body: <p>If money arrives from abroad, exchange rates move your income. PointUs can model a 10% currency drop and term-time rent lumps, and explains UK basics like ISAs in plain English, Hindi or Polish. You don't need a UK credit history or a bank connection to start.</p> },
        { title: "Older people", alt: true, body: <p>Simple mode gives bigger text and fewer details, and read-aloud buttons speak key information. The coach is patient, non-judgemental and never pushes products. Your data stays yours, and you can delete it at any time.</p> },
        { title: "Run a pilot", body: <p>We're looking for community groups, housing associations, employers and charities to pilot PointUs. The core is free, forever. <Link to="/contact" className="h-link">Contact us about a community pilot</Link>.</p> },
      ]}
    />
  );
}
