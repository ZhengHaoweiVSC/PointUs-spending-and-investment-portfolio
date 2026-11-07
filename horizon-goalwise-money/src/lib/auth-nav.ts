import { supabase } from "@/integrations/supabase/client";

/** Where a signed-in user should land: verify → onboarding → app. */
export async function nextStep(): Promise<"/verify-email" | "/onboarding" | "/app" | "/login"> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "/login";
  if (!user.email_confirmed_at) return "/verify-email";
  const { data } = await supabase.from("profiles").select("profile").eq("user_id", user.id).maybeSingle();
  const p = data?.profile as { engine?: unknown; consent?: unknown } | null;
  return p?.engine && p?.consent ? "/app" : "/onboarding";
}
