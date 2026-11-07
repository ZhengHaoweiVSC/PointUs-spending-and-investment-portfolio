import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { contactSchema, isContactTooQuick, TOPICS } from "@/lib/contact-schema";
import { sendContact, type SendResult } from "@/lib/outbox";
import { isDisposable, suggestEmail } from "@/lib/email";
import { useServerFn } from "@tanstack/react-start";
import { submitContact } from "@/lib/contact.functions";
import { SiteButton } from "./site/SiteButton";
import { FieldError, TextField } from "./forms";

type Errors = Partial<Record<"name" | "email" | "organisation" | "topic" | "message" | "consent" | "form", string>>;

export function ContactForm({ short = false }: { short?: boolean }) {
  const submit = useServerFn(submitContact);
  const pending = useRef(false);
  const [v, setV] = useState({ name: "", email: "", organisation: "", topic: short ? "pilot" : "", message: "", consent: false, website: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<SendResult | null>(null);
  const started = useRef(Date.now());
  const clientId = useRef<string>("");
  useEffect(() => { clientId.current = crypto.randomUUID(); started.current = Date.now(); }, []);
  const suggestion = v.email.includes("@") ? suggestEmail(v.email) : null;
  const set = (k: keyof typeof v, val: string | boolean) => setV((s) => ({ ...s, [k]: val }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending.current) return;
    if (v.website) { setDone({ status: "sent", ref: "OK" }); return; } // honeypot
    if (isContactTooQuick(started.current)) { setErrors({ form: "That was quick! Please check your details and try again." }); return; }
    const parsed = contactSchema.safeParse({ ...v, client_id: clientId.current, form_started_at: started.current });
    const errs: Errors = {};
    if (!parsed.success) for (const i of parsed.error.issues) errs[i.path[0] as keyof Errors] ??= i.message;
    if (!errs.email && isDisposable(v.email)) errs.email = "Please use a permanent email address so we can reply.";
    setErrors(errs);
    if (Object.keys(errs).length || !parsed.success) {
      document.getElementById(`c-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    pending.current = true;
    setSending(true);
    try {
      const r = await sendContact(parsed.data, submit);
      if (r.status === "rate_limited") setErrors({ form: "You've sent 5 messages in the last hour. Please try again later." });
      else setDone(r);
    } catch { setErrors({ form: "We couldn’t send or save your message on this device. Please keep a copy and try again." }); }
    finally { pending.current = false; setSending(false); }
  }

  if (done) {
    return (
      <div className="h-card h-card-ok" role="status" aria-live="polite">
        <p className="h-h3 flex items-center gap-2"><CheckCircle2 aria-hidden="true" />
          {done.status === "queued" ? "Saved on this device. We'll send it automatically." : "Thanks, your message is in."}</p>
        <p className="mt-2">Your reference: <strong className="h-num">{done.ref}</strong></p>
        {done.status === "queued" && <p className="mt-2 h-muted">We couldn't reach our server just now. We'll retry as soon as you're back online.</p>}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5" aria-describedby={errors.form ? "c-form-err" : undefined}>
      <div className="grid gap-5 md:grid-cols-2">
        <TextField id="c-name" label="Full name" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
        <TextField id="c-email" label="Email" type="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} error={errors.email}>
          {suggestion && (
            <p className="h-hint">Did you mean <SiteButton type="button" className="h-link" onClick={() => set("email", suggestion)}>{suggestion}</SiteButton>?</p>
          )}
        </TextField>
      </div>
      {!short && <TextField id="c-organisation" label="Organisation (optional)" autoComplete="organization" value={v.organisation} onChange={(e) => set("organisation", e.target.value)} error={errors.organisation} />}
      {!short && (
        <div>
          <label htmlFor="c-topic" className="h-label">Topic</label>
          <select id="c-topic" className="h-select" value={v.topic} onChange={(e) => set("topic", e.target.value)} aria-invalid={errors.topic ? true : undefined} aria-describedby={errors.topic ? "c-topic-err" : undefined}>
            <option value="">Choose a topic</option>
            {TOPICS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <FieldError id="c-topic-err" msg={errors.topic} />
        </div>
      )}
      <div>
        <label htmlFor="c-message" className="h-label">{short ? "Tell us about your community" : "Message"}</label>
        <textarea id="c-message" className="h-textarea" value={v.message} maxLength={4000} onChange={(e) => set("message", e.target.value)}
          aria-invalid={errors.message ? true : undefined} aria-describedby="c-message-count c-message-err" />
        <p id="c-message-count" className="h-hint h-num">{v.message.trim().length} / 20 characters minimum</p>
        <FieldError id="c-message-err" msg={errors.message} />
      </div>
      <div className="h-honeypot" aria-hidden="true">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" tabIndex={-1} autoComplete="off" value={v.website} onChange={(e) => set("website", e.target.value)} />
      </div>
      <div>
        <label className="h-check" htmlFor="c-consent">
          <input id="c-consent" type="checkbox" checked={v.consent} onChange={(e) => set("consent", e.target.checked)} aria-describedby={errors.consent ? "c-consent-err" : undefined} />
          <span>I agree that PointUs may store this message to reply to me, including on this device if sending fails, as described in the <Link to="/privacy" className="h-link">privacy policy</Link>.</span>
        </label>
        <FieldError id="c-consent-err" msg={errors.consent} />
      </div>
      <FieldError id="c-form-err" msg={errors.form} />
      <div><SiteButton type="submit" className="h-btn h-btn-primary" disabled={sending}>{sending ? "Sending…" : short ? "Join the pilot" : "Send message"}</SiteButton></div>
    </form>
  );
}
