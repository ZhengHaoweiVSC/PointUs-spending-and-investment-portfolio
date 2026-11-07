import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/site/MarketingPage";
import { ContactForm } from "@/components/ContactForm";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({ head: () => pageHead("contact"), component: Page });
function Page() {
  return <MarketingPage eyebrow="Contact" title="Contact PointUs" subhead="Pilot PointUs with your community, explore a partnership, ask a press question or share feedback. We aim to reply within two working days." sections={[
    { title: "Let's talk", body: <ContactForm /> },
    { title: "Community pilots", alt: true, body: <><p>Tell us who you support, how many people might take part and the money challenges they face. Please share general needs, not another person's financial details.</p><p>We can discuss a supported demo, accessible sessions and feedback on whether the coach helps people spot pressure earlier. A message does not commit your organisation to a pilot.</p></> },
    { title: "Need help now?", body: <><p>PointUs is not an emergency or debt-advice service. For free debt support, contact StepChange on 0800 138 1111. If you feel unable to cope, Samaritans is available on 116 123.</p><p>Please never send passwords, bank account numbers or identity documents in your message.</p></> },
  ]} />;
}
