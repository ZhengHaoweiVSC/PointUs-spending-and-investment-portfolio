/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NewsItem } from "./market.functions";
import { gbp } from "./coach";

export const TAGS = [
  ["energy", /energy|oil|gas|electric|ofgem|power price/i],
  ["rates", /interest rate|bank of england|\bfed\b|rate cut|rate hike|central bank|yield/i],
  ["inflation", /inflation|\bcpi\b|prices rise|cost of living/i],
  ["housing", /housing|mortgage|rent|property|house price/i],
  ["jobs", /jobs|unemployment|payroll|hiring|layoff|wages/i],
  ["markets", /stock|shares|market|index|s&p|nasdaq|ftse|dow/i],
] as const;
export type Tag = (typeof TAGS)[number][0];

export function tagNews(n: NewsItem): Tag[] {
  const s = `${n.headline} ${n.summary}`;
  return TAGS.filter(([, re]) => re.test(s)).map(([t]) => t);
}

function findPct(s: string) {
  const m = s.match(/(\d+(?:\.\d+)?)\s?%/);
  return m ? parseFloat(m[1]) : null;
}

export function meaningFor(tags: Tag[], c: any, n?: NewsItem): string {
  const p = c.p, s = c.sc.summary;
  const txt = n ? `${n.headline} ${n.summary}` : "";
  const energy = p.bills.filter((b: any) => b.tag === "energy").reduce((a: number, b: any) => a + b.amount, 0);
  const rent = p.bills.filter((b: any) => b.tag === "rent").reduce((a: number, b: any) => a + b.amount, 0);
  const t = tags[0];
  if (t === "energy") { const x = findPct(txt) ?? 10; return `If energy bills move ${x}%, your ${gbp(energy)} a month changes by about ${gbp(energy * x / 100)}.`; }
  if (t === "rates") return `A 0.25% rate change on your ${gbp(p.savings)} savings is about ${gbp(p.savings * 0.0025, 2)} a year.`;
  if (t === "inflation") { const x = findPct(txt) ?? 3; return `At ${x}% inflation, your essentials (${gbp(s.essentials)} a month) cost about ${gbp(s.essentials * x / 100)} more each month over a year.`; }
  if (t === "housing") { const x = findPct(txt) ?? 5; return `A ${x}% rise on your ${gbp(rent)} housing cost would be ${gbp(rent * x / 100)} a month.`; }
  if (t === "jobs") return `If your income dipped 25% for a month, that's about ${gbp(s.income * 0.25)}. Your buffer covers ${c.sc.bufferMonths.toFixed(1)} months of essentials.`;
  if (t === "markets") return c.sc.rung < 5 ? "Day-to-day market moves matter less right now: you're still building your safety net first." : "Short-term swings are normal for a long-term mix. No action needed unless you're more than 5 points off target.";
  return "No direct effect on your numbers that we can see.";
}
