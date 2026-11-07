import { createFileRoute } from "@tanstack/react-router";
import { useCoach, type Lang } from "@/lib/coach";
import { Card, ReadAloud } from "@/components/app/widgets";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

function SettingsPage() {
  const c = useCoach();
  const s = c.store.settings ?? { lang: "en" as Lang, simple: false };
  return (
    <div className="grid gap-6">
      <header><p className="h-eyebrow">Settings</p><h1 className="h-h2 mt-1">Make it work for you</h1></header>
      <Card id="lang" title="Language">
        <label htmlFor="lang-sel" className="h-label">Language for menus and the coach</label>
        <select id="lang-sel" className="h-select max-w-xs" value={s.lang} onChange={(e) => c.update({ settings: { ...s, lang: e.target.value as Lang } })}>
          <option value="en">English</option><option value="hi">हिन्दी (Hindi)</option><option value="pl">Polski (Polish)</option>
        </select>
      </Card>
      <Card id="simple" title="Simple mode">
        <label className="h-check"><input type="checkbox" checked={s.simple} onChange={(e) => c.update({ settings: { ...s, simple: e.target.checked } })} /><span>Bigger text and fewer details</span></label>
      </Card>
      <Card id="voice" title="Read aloud">
        <p>Look for the "Read aloud" buttons on key cards. Try it here:</p>
        <div className="mt-3"><ReadAloud text={`Hello ${c.p.name}. Your resilience score is ${c.sc.total}. ${c.sc.action}`} /></div>
      </Card>
    </div>
  );
}
