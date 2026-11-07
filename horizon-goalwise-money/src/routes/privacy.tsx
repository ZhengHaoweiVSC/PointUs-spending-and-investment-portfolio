import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingPage } from "@/components/site/MarketingPage";
import { pageHead } from "@/lib/seo";
import { CONSENT_VERSION } from "@/lib/brand";

export const Route = createFileRoute("/privacy")({ head: () => pageHead("privacy"), component: Page });

function Page() {
  return (
    <MarketingPage eyebrow={`Privacy policy · version ${CONSENT_VERSION}`} title="Privacy policy"
      subhead="Plain-English privacy. You agree to this policy before using PointUs, and you can withdraw at any time by deleting your data."
      sections={[
        { title: "1. Who we are", body: <p>PointUs ("we") is a free AI money coach built at the NatWest hackathon 2026. We are the controller of the personal data described here. Contact us through the <Link to="/contact" className="h-link">contact page</Link>.</p> },
        { title: "2. What we collect", alt: true, body: <ul>
          <li><strong>Account:</strong> first name, email address, and a password stored as a one-way hash, not readable text.</li>
          <li><strong>Money profile:</strong> the amounts and dates you choose to share (income, bills, savings, debts, goals, risk answers).</li>
          <li><strong>Consent record:</strong> the version and time you agreed to these terms.</li>
          <li><strong>Contact messages:</strong> name, email, organisation, topic, message and browser type.</li>
          <li>We do not collect bank logins, card numbers, ID documents or precise location.</li></ul> },
        { title: "3. Why we use it (lawful basis)", body: <ul>
          <li>To provide the coach you asked for (contract).</li>
          <li>To keep the service secure and prevent abuse, such as rate limits and spam checks (legitimate interests).</li>
          <li>To reply to your messages (consent, which you can withdraw).</li></ul> },
        { title: "4. AI processing", alt: true, body: <p>When you use "Talk to PointUs" or "Explain simply", a short numbers summary and your question are sent to our AI provider to write a reply. Your email is never sent. Replies are not used to make automated decisions about you.</p> },
        { title: "5. Sharing", body: <p>We never sell your data or share it for advertising. We use trusted processors only to host the app, store data and run AI and market data services, under contract and only on our instructions.</p> },
        { title: "6. Storage and deletion", alt: true, body: <><p>Your profile is kept while you use the service. Delete all my data removes your saved profile and signs you out; it does not itself delete your authentication account or contact messages. Contact us for these requests.</p><p>If a contact message cannot send, your consent allows a copy of the message, name and email to be saved in this browser until delivery succeeds. Avoid using shared devices for sensitive messages. Demo profiles stay in this browser rather than being saved to your account.</p></> },
        { title: "7. Your rights", body: <p>Under UK GDPR you can access, correct, delete, restrict or object to the use of your data, and take a copy. You can also complain to the Information Commissioner's Office (ico.org.uk). Contact us to use any of these rights.</p> },
        { title: "8. Browser storage", alt: true, body: <p>PointUs uses browser storage to keep your session, consent choices, preferences and any unsent contact message. These are used to provide the service rather than target advertising. Clearing site data removes local copies and signs you out; it does not remove a message already delivered.</p> },
        { title: "9. Hackathon policy status", body: <p>This policy is a draft for the hackathon pilot. The operating organisation, processor locations and final retention arrangements must be confirmed before a wider launch. You should not include sensitive information in free-text messages.</p> },
      ]}
    />
  );
}
