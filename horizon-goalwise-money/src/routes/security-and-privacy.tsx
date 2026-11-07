import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingPage } from "@/components/site/MarketingPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/security-and-privacy")({ head: () => pageHead("security"), component: Page });

function Page() {
  return (
    <MarketingPage eyebrow="Security brief" title="Your money data, protected by design"
      subhead="Everyone reads and agrees to this brief, our terms and our privacy policy before using PointUs. Here's exactly how we keep you safe."
      sections={[
        { title: "Data minimisation", body: <><p>We only ask for what the coach needs to calculate your forecast and plan: rough amounts and dates. We never ask for bank logins, card numbers, National Insurance numbers, ID documents or your full address. You can skip any question.</p></> },
        { title: "How your data is protected", alt: true, body: <ul>
          <li>All traffic is encrypted in transit (HTTPS/TLS) and stored data is encrypted at rest.</li>
          <li>Your profile is locked to your account by database access rules: no other user can read it.</li>
          <li>Email verification is required before anyone can open the app.</li>
          <li>Passwords are never stored in readable form. Strength checks stop weak passwords.</li>
          <li>Market data keys and AI access stay on our servers, never in your browser.</li>
          <li>Contact messages can be written but never read back from the public site.</li></ul> },
        { title: "We never sell your data", body: <p>No advertising, no data brokers, no selling or sharing your information for marketing. Ever. The AI coach receives only a short numbers summary (no email or name beyond your first name) and is told to use only those numbers.</p> },
        { title: "AI explains, the engine calculates", alt: true, body: <p>Every figure comes from a tested maths engine. AI is only used to explain those numbers in plain words. Replies are filtered: the coach never names individual stocks or funds to buy, never says "guaranteed" or "risk-free", and never suggests taking on new credit. If you mention a crisis, support links and Samaritans (116 123) are always shown.</p> },
        { title: "Stay safe from scams", body: <ul>
          <li>We will never ask for your password, PIN or one-time code by email, text or phone.</li>
          <li>We will never ask you to move money or "verify" your account by transfer.</li>
          <li>Only log in at our own web address. If in doubt, close the message and visit us directly.</li></ul> },
        { title: "Your control: delete-my-data", alt: true, body: <p>From Help → Delete all my data, you can permanently delete your profile and plan in one step. PointUs offers guidance, not regulated financial advice. Read the full <Link to="/privacy" className="h-link">privacy policy</Link> and <Link to="/terms" className="h-link">terms of use</Link>.</p> },
      ]}
    />
  );
}
