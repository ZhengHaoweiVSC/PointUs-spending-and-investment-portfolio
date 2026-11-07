import { z } from "zod";

export const TOPICS = [
  { value: "pilot", label: "Pilot with my community" },
  { value: "partnership", label: "Partnership" },
  { value: "press", label: "Press" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" },
] as const;

export const contactSchema = z.object({
  client_id: z.string().uuid(),
  form_started_at: z.number().int().positive(),
  website: z.string().max(0, "Spam submission rejected").default(""),
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(255),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  topic: z.enum(["pilot", "partnership", "press", "feedback", "other"], { message: "Choose a topic" }),
  message: z.string().trim().min(20, "Message must be at least 20 characters").max(4000),
  consent: z.literal(true, { message: "Please agree so we can reply to you" }),
});
export type ContactInput = z.infer<typeof contactSchema>;

export function isContactTooQuick(started: number, now = Date.now()) { return now - started < 3000; }
