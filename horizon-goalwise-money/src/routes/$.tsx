import { createFileRoute, notFound } from "@tanstack/react-router";
import { MarketingPage } from "@/components/site/MarketingPage";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/$")({ beforeLoad: () => { throw notFound(); }, head: () => pageHead("notfound"), component: NotFoundPage, notFoundComponent: NotFoundPage });
function NotFoundPage() {
  return <MarketingPage eyebrow="Error 404" title="This page took a wrong turn." subhead="The PointUs page you're looking for doesn't exist or has moved." sections={[{ title: "Find your next step", body: <p>Explore the money coach using the menu, try a fictional demo or contact the team if a link brought you here.</p> }]} />;
}
