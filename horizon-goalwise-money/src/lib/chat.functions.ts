import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateResponse } from "@lovable.dev/ai-gateway";
import { BANNED, CRISIS, SAFE_FALLBACK, SUPPORT_LINKS } from "./safety";

const input = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).min(1).max(20),
  context: z.record(z.string(), z.unknown()),
  lang: z.enum(["en", "hi", "pl"]).default("en"),
});

const LANG = { en: "English", hi: "Hindi", pl: "Polish" } as const;

function extractText(res: unknown): string {
  const r = res as { output_text?: string; output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }> };
  if (typeof r.output_text === "string" && r.output_text) return r.output_text;
  return (r.output ?? [])
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type === "output_text" && c.text)
    .map((c) => c.text)
    .join("\n");
}

export const askCoach = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data }) => {
    const last = data.messages[data.messages.length - 1].content;
    const crisis = CRISIS.test(last);
    const instructions = `You are PointUs, a kind, non-judgemental money coach for people in the UK.
Rules:
- Use ONLY numbers that appear in the CONTEXT JSON. Never invent figures.
- This is guidance, not regulated financial advice. Say so briefly when relevant.
- Never name individual stocks, funds or companies to buy or sell. Talk about asset types only.
- Never say "guaranteed" or "risk-free". Never suggest taking on new credit, loans or BNPL.
- Keep replies under 90 words, plain English, short sentences.
- Reply in ${LANG[data.lang]}.
CONTEXT: ${JSON.stringify(data.context).slice(0, 6000)}`;
    let text = "";
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions,
        input: data.messages.map((m) => ({ role: m.role, content: m.content })),
      });
      text = extractText(res).trim();
    } catch (e) {
      console.error("coach failed", e);
      return { text: SAFE_FALLBACK + (crisis ? SUPPORT_LINKS : ""), crisis, fallback: true };
    }
    if (!text || BANNED.test(text)) text = SAFE_FALLBACK;
    if (crisis) text += SUPPORT_LINKS;
    return { text, crisis, fallback: false };
  });
