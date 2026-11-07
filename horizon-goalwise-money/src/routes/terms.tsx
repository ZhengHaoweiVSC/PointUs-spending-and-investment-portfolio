import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingPage } from "@/components/site/MarketingPage";
import { pageHead } from "@/lib/seo";
import { CONSENT_VERSION } from "@/lib/brand";

export const Route = createFileRoute("/terms")({ head: () => pageHead("terms"), component: Page });

function Page() {
  return (
    <MarketingPage eyebrow={`Terms of use · version ${CONSENT_VERSION}`} title="Terms of use"
      subhead="You must agree to these terms, our privacy policy and our security brief before you can use the app."
      sections={[
        { title: "1. Guidance, not advice", body: <p>PointUs provides general financial guidance and education. It is not regulated financial advice, and we are not authorised by the Financial Conduct Authority to give advice. Forecasts and goal results are illustrations based on the numbers you give, not promises. You are responsible for your own financial decisions.</p> },
        { title: "2. Who can use PointUs", alt: true, body: <p>You must be 18 or over and live in the UK. You need a verified email address to use the app. You agree to give honest information and keep your password private.</p> },
        { title: "3. Acceptable use", body: <ul><li>Don't try to access other people's data or break our security.</li><li>Don't send spam or abusive messages through the contact form.</li><li>Don't use the service for anything unlawful.</li></ul> },
        { title: "4. Investments carry risk", alt: true, body: <p>The value of investments can go down as well as up, and you may get back less than you put in. Live prices are shown as market proxies for asset types only, not recommendations to buy any fund or company.</p> },
        { title: "5. Your data", body: <p>How we use your data is set out in our <Link to="/privacy" className="h-link">privacy policy</Link> and <Link to="/security-and-privacy" className="h-link">security brief</Link>. You can delete all your data at any time.</p> },
        { title: "6. Changes and liability", alt: true, body: <p>We may update these terms; if we make important changes we'll ask you to agree again. We provide the service with reasonable care but can't guarantee it will always be available or error-free. Nothing in these terms limits your rights under UK consumer law.</p> },
      ]}
    />
  );
}
