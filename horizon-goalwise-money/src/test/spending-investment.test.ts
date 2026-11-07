import { describe, expect, it } from "vitest";
import { Engine } from "@/lib/engine";
import { Personas } from "@/lib/personas";
import { buildInvestmentPortfolio, estimatedShares, GBP_USD, RISK_ALLOCATIONS } from "@/lib/investment";
import { spendingBreakdown } from "@/lib/spending";

describe("Spending portfolio", () => {
  it("reconciles every demo scenario to the engine's income and outgoings", () => {
    for (const persona of Personas.list) {
      const model = spendingBreakdown(persona);
      const summary = Engine.summarise(persona);
      expect(model.income).toBeCloseTo(summary.income, 8);
      expect(model.totalSpending).toBeCloseTo(summary.outgoings, 8);
      expect(model.disposableIncome).toBeCloseTo(Math.max(0, summary.surplus), 8);
    }
  });

  it("uses monthly divided by 30 for daily averages and calculates savings rate", () => {
    const model = spendingBreakdown(Personas.family);
    const savings = model.rows.find((row) => row.category === "Savings")!;
    expect(savings.dailyAverage).toBeCloseTo(savings.amount / 30, 8);
    expect(model.savingsRate).toBeCloseTo(savings.amount / model.income, 8);
  });
});

describe("Investment portfolio", () => {
  it.each([
    ["Low", 0.75, 0.15, 0.10],
    ["Medium", 0.50, 0.40, 0.10],
    ["High", 0.25, 0.70, 0.05],
  ] as const)("uses the requested %s allocation", (risk, value, growth, cash) => {
    const model = buildInvestmentPortfolio(risk, "Beginner", 300);
    expect(model.allocation).toEqual({ value, growth, cash });
    expect(model.allocation).toEqual(RISK_ALLOCATIONS[risk]);
    expect(model.holdings.reduce((sum, holding) => sum + holding.weight, 0)).toBeCloseTo(1, 8);
    expect(model.holdings.reduce((sum, holding) => sum + holding.amount, 0)).toBeCloseTo(300, 8);
  });

  it("gives beginners six diversified holdings and experienced users four concentrated holdings", () => {
    expect(buildInvestmentPortfolio("Medium", "Beginner", 100).holdings.filter((holding) => holding.ticker !== "CASH")).toHaveLength(6);
    expect(buildInvestmentPortfolio("Medium", "Experienced", 100).holdings.filter((holding) => holding.ticker !== "CASH")).toHaveLength(4);
  });

  it("converts a small sterling budget into fractional shares at the disclosed rate", () => {
    expect(estimatedShares(10, 200)).toBeCloseTo(10 * GBP_USD / 200, 8);
  });
});
