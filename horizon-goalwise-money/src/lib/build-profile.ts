import { Engine } from "./engine";

export type Answers = {
  firstName: string;
  household: "solo" | "solo_kids" | "couple" | "couple_kids";
  dependants: number;
  income: number;
  variation: "same" | "bit" | "lot";
  frequency: "weekly" | "fortnightly" | "four_weekly" | "monthly";
  housingType: "rent" | "mortgage";
  housing: number;
  bills: number;
  weekly: number;
  debtType: "none" | "credit_card" | "loan" | "bnpl";
  debtBalance: number;
  savings: number;
  balance: number;
  goalType: "home" | "children" | "emergency" | "retirement" | "purchase";
  goalTarget: number;
  goalYear: number;
  att1: number;
  att2: number;
  att3: number;
  invested: number;
};

export const CV = { same: 0.03, bit: 0.12, lot: 0.25 } as const;
export const DEBT_APR = { credit_card: 24.9, loan: 9.9, bnpl: 0 } as const;
export const GOAL_NAMES = { home: "Home deposit", children: "Children's future", emergency: "Emergency fund", retirement: "Retirement", purchase: "Big purchase" } as const;

export function defaultAnswers(): Answers {
  const y = new Date().getFullYear();
  return {
    firstName: "", household: "solo", dependants: 0, income: 1800, variation: "same", frequency: "monthly",
    housingType: "rent", housing: 750, bills: 250, weekly: 80, debtType: "none", debtBalance: 0, savings: 300,
    balance: 400, goalType: "emergency", goalTarget: 3000, goalYear: y + 3, att1: 3, att2: 3, att3: 3, invested: 0,
  };
}

export function perPayment(monthly: number, f: Answers["frequency"]) {
  if (f === "weekly") return (monthly * 12) / 52;
  if (f === "fortnightly") return (monthly * 12) / 26;
  if (f === "four_weekly") return (monthly * 12) / 13;
  return monthly;
}

export function christmasCost(adults: number, dependants: number) {
  return 80 + 70 * (adults + dependants);
}

export function debtMin(balance: number) {
  return Math.max(25, Math.round(balance * 0.03));
}

export function buildFromAnswers(a: Answers) {
  const today = Engine.todayUTC();
  const adults = a.household === "couple" || a.household === "couple_kids" ? 2 : 1;
  const dependants = a.household === "solo_kids" || a.household === "couple_kids" ? Math.max(1, a.dependants) : 0;
  const cv = CV[a.variation];
  const sched =
    a.frequency === "weekly" ? { type: "weekly", weekday: 5 }
    : a.frequency === "fortnightly" ? { type: "every", days: 14, anchor: Engine.iso(today) }
    : a.frequency === "four_weekly" ? { type: "every", days: 28, anchor: Engine.iso(today) }
    : { type: "monthly", day: 28 };
  const income = a.income > 0
    ? [{ label: "Take-home pay", amount: Math.round(perPayment(a.income, a.frequency) * 100) / 100, cv, variable: cv > 0.05, schedule: sched }]
    : [];
  const bills = [];
  if (a.housing > 0) bills.push({ label: a.housingType === "mortgage" ? "Mortgage" : "Rent", amount: a.housing, tag: "rent", schedule: { type: "monthly", day: 1 } });
  if (a.bills > 0) bills.push({ label: "Other bills", amount: a.bills, tag: "energy", winter: 1.15, schedule: { type: "monthly", day: 15 } });
  const debts = a.debtType !== "none" && a.debtBalance > 0
    ? [{ type: a.debtType === "loan" ? "loan" : a.debtType, label: a.debtType === "credit_card" ? "Credit card" : a.debtType === "loan" ? "Loan or car finance" : "Buy now pay later", balance: a.debtBalance, apr: DEBT_APR[a.debtType], min: debtMin(a.debtBalance), day: 25 }]
    : [];
  return {
    id: "me", name: a.firstName || "there", age: 30, emoji: "🙂", blurb: "",
    adults, dependants, employerPension: false,
    income, incomeDips: [], bills,
    annual: [{ label: "Christmas costs", amount: christmasCost(adults, dependants), month: 12, day: 15, spreadable: false }],
    varWeekly: a.weekly, varCv: 0.25, debts,
    balance: a.balance, savings: a.savings,
    goals: [{ name: GOAL_NAMES[a.goalType], target: a.goalTarget, year: a.goalYear }],
    attitude: [a.att1, a.att2, a.att3],
    supportChecks: { benefits: false, council: false, social: false },
    hasMortgage: a.housingType === "mortgage", fx: false,
  };
}

/** Monthly contribution split by Resilience Ladder rung. */
export function contributionSplit(rung: number) {
  if (rung <= 2) return { buffer: 1, debt: 0, invest: 0 };
  if (rung === 3) return { buffer: 0.3, debt: 0.7, invest: 0 };
  if (rung === 4) return { buffer: 0.5, debt: 0, invest: 0.5 };
  return { buffer: 0, debt: 0, invest: 1 };
}
