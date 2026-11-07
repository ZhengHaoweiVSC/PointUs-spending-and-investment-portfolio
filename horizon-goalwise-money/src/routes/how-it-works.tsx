import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/site/MarketingPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({ head: () => pageHead("how"), component: Page });

function Page() {
  return (
    <MarketingPage eyebrow="How it works & features" title="From money stress to a clear plan" gallery
      subhead="Answer a few questions, see your next 90 days and build a plan you understand. No bank login or financial expertise needed."
      sections={[
        { eyebrow: "Step 1", title: "Tell us about your money", body: <p>Share your household, income, essential bills, debts, savings and goal. Setup takes about five minutes; you can skip questions and review every answer. Before starting, you agree to the security brief, terms, privacy policy and guidance-not-advice boundary.</p> },
        { eyebrow: "Step 2", title: "See your next 90 days", alt: true, body: <><p>PointUs simulates 1,000 possible futures with varying pay, spending and timing. You see your likely balance, riskiest date and chance of dipping below £0 in plain English.</p><p>Your Resilience Score and five-rung ladder turn your buffer, surplus, debt, income stability and support checks into one clear next action.</p></> },
        { eyebrow: "Step 3", title: "Fix risks before they happen", body: <p>Test lost shifts, a repair, higher rent or another shock. Apply realistic fixes—such as spreading a bill or saving a small weekly amount—and see the forecast update. When money is tight, PointUs also points to free, confidential debt and hardship support.</p> },
        { eyebrow: "Step 4", title: "Build towards your goal", alt: true, body: <p>Once your safety gate is met, the goal simulator estimates your chance of success and the monthly contribution needed at different confidence levels. Your portfolio combines cash, bonds and global shares using the lower of your financial capacity and emotional attitude to risk. Live market proxies show movement; PointUs never picks individual stocks.</p> },
        { title: "Understand the news and every recommendation", body: <p>The briefing connects current headlines to your numbers in plain language. Every recommendation includes a “Why?” explanation covering the inputs, rule or model, confidence and what could change the answer.</p> },
        { title: "Use PointUs your way", alt: true, body: <p>Choose simple mode, listen to key cards with read-aloud, and use menus and the coach in English, Hindi or Polish. You can explore the complete product through a fictional demo before creating an account.</p> },
      ]}
    />
  );
}
