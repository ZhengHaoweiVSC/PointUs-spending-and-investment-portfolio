import { Engine } from "./engine";
import type { EngineProfile } from "./coach";

export const SPENDING_CATEGORIES = [
  "Rent",
  "Utilities",
  "Groceries",
  "Transport",
  "Dining/Entertainment",
  "Subscriptions",
  "Other day-to-day spending",
  "Savings",
] as const;

export type SpendingCategory = (typeof SPENDING_CATEGORIES)[number];
export type SpendingRow = { category: SpendingCategory; amount: number; incomeShare: number; dailyAverage: number };
export type SpendingBreakdown = {
  income: number;
  totalSpending: number;
  savingsRate: number;
  disposableIncome: number;
  rows: SpendingRow[];
  hasEstimatedFlexibleSplit: boolean;
};

type Schedule = { type?: string; day?: number; days?: number; months?: number[] };

function perMonth(amount: number, schedule?: Schedule) {
  if (!schedule) return 0;
  const activeShare = schedule.months ? schedule.months.length / 12 : 1;
  if (schedule.type === "monthly") return amount * activeShare;
  if (schedule.type === "weekly") return amount * 52 / 12;
  if (schedule.type === "every" && schedule.days) return amount * (365 / schedule.days) / 12;
  if (schedule.type === "annual") return amount / 12;
  return 0;
}

function categoryFor(label: string, tag?: string): Exclude<SpendingCategory, "Savings"> {
  const value = `${label} ${tag ?? ""}`.toLowerCase();
  if (/rent|mortgage|housing|halls/.test(value)) return "Rent";
  if (/gym|subscription|netflix|spotify|prime video/.test(value)) return "Subscriptions";
  if (/car|travel|transport|fuel|bus|train|tfl|stagecoach/.test(value)) return "Transport";
  if (/dining|restaurant|takeaway|entertainment|cinema/.test(value)) return "Dining/Entertainment";
  if (/grocer|supermarket|food shop/.test(value)) return "Groceries";
  if (/council|energy|water|phone|broadband|internet|utility|gas|electric/.test(value)) return "Utilities";
  return "Other day-to-day spending";
}

/** Uses the saved profile's own amounts; only the flexible total receives an estimated category split. */
export function spendingBreakdown(profile: EngineProfile): SpendingBreakdown {
  const amounts = Object.fromEntries(SPENDING_CATEGORIES.map((category) => [category, 0])) as Record<SpendingCategory, number>;
  const add = (category: Exclude<SpendingCategory, "Savings">, amount: number) => { amounts[category] += amount; };

  for (const bill of profile.bills ?? []) add(categoryFor(String(bill.label), bill.tag), perMonth(Number(bill.amount) * (bill.winter ? 1.1 : 1), bill.schedule));
  for (const item of profile.annual ?? []) add(categoryFor(String(item.label)), Number(item.amount) / 12);
  for (const debt of profile.debts ?? []) add("Other day-to-day spending", Number(debt.min) || 0);

  const flexible = (Number(profile.varWeekly) || 0) * 52 / 12;
  add("Groceries", flexible * 0.35);
  add("Transport", flexible * 0.20);
  add("Dining/Entertainment", flexible * 0.25);
  add("Other day-to-day spending", flexible * 0.20);

  const summary = Engine.summarise(profile);
  const income = Math.max(0, summary.income);
  const totalSpending = SPENDING_CATEGORIES.filter((category) => category !== "Savings").reduce((sum, category) => sum + amounts[category], 0);
  const savings = Math.max(0, income - totalSpending);
  amounts.Savings = savings;

  return {
    income,
    totalSpending,
    savingsRate: income > 0 ? savings / income : 0,
    disposableIncome: savings,
    rows: SPENDING_CATEGORIES.map((category) => ({
      category,
      amount: amounts[category],
      incomeShare: income > 0 ? amounts[category] / income : 0,
      dailyAverage: amounts[category] / 30,
    })),
    hasEstimatedFlexibleSplit: flexible > 0,
  };
}
