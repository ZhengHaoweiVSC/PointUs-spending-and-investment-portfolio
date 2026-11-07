import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/site/MarketingPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/financial-time-travel")({ head: () => pageHead("time"), component: Page });

function Page() {
  return (
    <MarketingPage eyebrow="Deep dive" title="Financial time travel: 1,000 futures, one clear answer"
      subhead="How our cash flow forecast works, why it's built for irregular income, and how fixes are tested before you commit."
      sections={[
        { title: "Why one forecast isn't enough", body: <p>A normal budget gives one number: what you'd have if everything went exactly to plan. Real life doesn't. Shifts get cancelled, a weekly wage varies by £80, a bill lands a day early. A single line hides the risk. So instead of one future, PointUs simulates a thousand, each with realistic randomness in your pay and spending, based on how much your income usually varies.</p> },
        { title: "Reading the fan chart", alt: true, body: <><p>The shaded band shows where your balance lands in the middle 80% of futures. The dark line is the most likely path. The red line is £0. For every one of the next 90 days we count how many futures fall below zero. The day with the highest share is your riskiest day, and we say it plainly: "4 Feb: 76% risk".</p><p>Winter energy bills, annual costs like Christmas or insurance, debt repayments and seasonal dips in hours are all included.</p></> },
        { title: "Shocks and fixes", body: <><p>What-if shocks let you rehearse a bad month: lose a quarter of your shifts for eight weeks, a £400 repair in three weeks, rent up 8%, energy up 20%, a mortgage fix ending, or a currency drop if your money comes from abroad. You can add your own too.</p><p>Fixes are tested the same way. Spreading an annual bill, or putting a few pounds a week into a pot for the risky date, is re-simulated a thousand times so you see the new risk before you change anything.</p></> },
        { title: "What it can't do", alt: true, body: <p>The forecast is only as good as the numbers you give it, and it can't predict truly unexpected events. It's a tool for seeing risk early, not a promise. If your risk stays above 50%, we show free, confidential help straight away.</p> },
      ]}
    />
  );
}
