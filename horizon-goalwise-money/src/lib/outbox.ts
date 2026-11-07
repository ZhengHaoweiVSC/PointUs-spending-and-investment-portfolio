import { supabase } from "@/integrations/supabase/client";
import { submitContact } from "./contact.functions";
import { contactSchema, type ContactInput } from "./contact-schema";

export const OUTBOX_KEY = "pointus-contact-outbox";
type Item = { payload: ContactInput; attempts: number; next: number };
type Submit = (options: { data: ContactInput }) => ReturnType<typeof submitContact>;
function read(): Item[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(item => item && contactSchema.safeParse(item.payload).success && Number.isFinite(item.next) && Number.isFinite(item.attempts));
  } catch { return []; }
}
function write(items: Item[]) { localStorage.setItem(OUTBOX_KEY, JSON.stringify(items)); }
async function timeout<T>(promise: Promise<T>, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try { return await Promise.race([promise, new Promise<T>((_, reject) => { timer = setTimeout(() => reject(new Error("timeout")), ms); })]); }
  finally { clearTimeout(timer); }
}
export type SendResult = { status: "sent" | "queued" | "rate_limited"; ref: string; via?: "server" | "direct" };

async function direct(payload: ContactInput) {
  const { error } = await supabase.from("contact_submissions").insert({
    client_id: payload.client_id, name: payload.name, email: payload.email.toLowerCase(), organisation: payload.organisation || null,
    topic: payload.topic, message: payload.message, form_started_at: payload.form_started_at, website: payload.website,
    user_agent: navigator.userAgent.slice(0, 300),
  });
  if (error?.code === "P0001") return false;
  if (error && error.code !== "23505") throw error;
  return true;
}
async function deliver(payload: ContactInput, submit: Submit): Promise<SendResult> {
  const ref = payload.client_id.slice(0, 8).toUpperCase();
  if (!navigator.onLine) throw new Error("offline");
  try {
    const result = await timeout(submit({ data: payload }), 8000);
    return result.ok ? { status: "sent", ref, via: "server" } : { status: "rate_limited", ref };
  } catch {
    return await timeout(direct(payload), 8000) ? { status: "sent", ref, via: "direct" } : { status: "rate_limited", ref };
  }
}
/** Preserve a single client_id through all layers and never bypass a rate limit. */
export async function sendContact(payload: ContactInput, submit: Submit = submitContact): Promise<SendResult> {
  try { return await deliver(payload, submit); }
  catch {
    const items = read().filter(item => item.payload.client_id !== payload.client_id);
    items.push({ payload, attempts: 0, next: Date.now() });
    write(items);
    return { status: "queued", ref: payload.client_id.slice(0, 8).toUpperCase() };
  }
}
export const retryDelay = (attempts: number) => Math.min(3600_000, 2 ** Math.min(attempts, 20) * 5000);
let flushing = false;
export async function flushOutbox(force = false) {
  if (flushing || typeof window === "undefined" || !navigator.onLine) return;
  flushing = true;
  try {
    for (const item of read()) {
      if (!force && item.next > Date.now()) continue;
      let sent = false;
      try { sent = (await deliver(item.payload, submitContact)).status === "sent"; } catch { /* retain for retry */ }
      // Read again after async work so a new submission in this tab isn't discarded.
      const latest = read();
      write(sent ? latest.filter(i => i.payload.client_id !== item.payload.client_id) : latest.map(i => i.payload.client_id === item.payload.client_id ? { ...i, attempts: i.attempts + 1, next: Date.now() + retryDelay(i.attempts + 1) } : i));
    }
  } finally { flushing = false; }
}
export function startOutboxSync() {
  const retry = () => { void flushOutbox().catch(() => {}); };
  const online = () => { void flushOutbox(true).catch(() => {}); };
  retry();
  window.addEventListener("online", online);
  const timer = setInterval(retry, 5000);
  return () => { window.removeEventListener("online", online); clearInterval(timer); };
}
