import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getRequestHeader } from "@tanstack/react-start/server";
import { contactSchema, isContactTooQuick } from "./contact-schema";

// "submit-contact": validates, rate-limits (5 per email per hour), idempotent on client_id.
export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    if (isContactTooQuick(data.form_started_at)) throw new Error("Please check your details and try again");
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    const url = process.env['SUPABASE_URL'];
    if (!key || !url) throw new Error("Contact service unavailable");
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });
    const email = data.email.toLowerCase();
    // The database trigger enforces the same limit and duplicate rules on both paths.
    // No privileged client or read access to private contact messages is needed.
    const { error } = await client.from("contact_submissions").insert({
      client_id: data.client_id, name: data.name, email, organisation: data.organisation || null,
      topic: data.topic, message: data.message, form_started_at: data.form_started_at, website: data.website, user_agent: (getRequestHeader("user-agent") ?? "").slice(0, 300),
    });
    if (error?.code === "P0001") return { ok: false as const, error: "rate_limited" };
    if (error && error.code !== "23505") throw new Error("Insert failed");
    return { ok: true as const, ref: data.client_id.slice(0, 8).toUpperCase(), duplicate: false };
  });
