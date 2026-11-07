import { Engine } from "./engine";

export type RiskAppetite = "Low" | "Medium" | "High";
export type FinancialBackground = "Beginner" | "Intermediate" | "Experienced";
export type StockStyle = "Value" | "Growth";

export const GBP_USD = 1.27;
export const RISK_ALLOCATIONS: Record<RiskAppetite, { value: number; growth: number; cash: number }> = {
  Low: { value: 0.75, growth: 0.15, cash: 0.10 },
  Medium: { value: 0.50, growth: 0.40, cash: 0.10 },
  High: { value: 0.25, growth: 0.70, cash: 0.05 },
};

type Stock = { mu: number; sd: number; beta: number };
export const STOCK_POOL: Record<string, Stock & { style: StockStyle }> = {
  JPM: { style: "Value", mu: 0.08, sd: 0.22, beta: 1.10 },
  JNJ: { style: "Value", mu: 0.06, sd: 0.15, beta: 0.55 },
  KO: { style: "Value", mu: 0.055, sd: 0.14, beta: 0.50 },
  PG: { style: "Value", mu: 0.055, sd: 0.14, beta: 0.45 },
  "BRK.B": { style: "Value", mu: 0.075, sd: 0.18, beta: 0.85 },
  XOM: { style: "Value", mu: 0.07, sd: 0.25, beta: 0.80 },
  NVDA: { style: "Growth", mu: 0.16, sd: 0.42, beta: 1.70 },
  MSFT: { style: "Growth", mu: 0.11, sd: 0.23, beta: 1.05 },
  AMZN: { style: "Growth", mu: 0.12, sd: 0.32, beta: 1.25 },
  GOOGL: { style: "Growth", mu: 0.11, sd: 0.27, beta: 1.10 },
  META: { style: "Growth", mu: 0.12, sd: 0.34, beta: 1.25 },
  TSLA: { style: "Growth", mu: 0.15, sd: 0.50, beta: 1.80 },
};

const SELECTIONS: Record<FinancialBackground, Record<StockStyle, string[]>> = {
  Beginner: { Value: ["JNJ", "KO", "PG"], Growth: ["MSFT", "GOOGL", "AMZN"] },
  Intermediate: { Value: ["JPM", "BRK.B"], Growth: ["MSFT", "NVDA"] },
  Experienced: { Value: ["BRK.B", "XOM"], Growth: ["NVDA", "TSLA"] },
};

export type InvestmentHolding = { ticker: string; style: StockStyle | "Cash"; weight: number; amount: number };

function correlation(a: StockStyle | "Cash", b: StockStyle | "Cash") {
  if (a === "Cash" || b === "Cash") return 0;
  if (a === b) return a === "Growth" ? 0.65 : 0.55;
  return 0.45;
}

export function investmentStatistics(holdings: InvestmentHolding[]) {
  const expectedReturn = holdings.reduce((sum, holding) => sum + holding.weight * (holding.ticker === "CASH" ? Engine.ASSETS.cash.mu : STOCK_POOL[holding.ticker]!.mu), 0);
  const beta = holdings.reduce((sum, holding) => sum + holding.weight * (holding.ticker === "CASH" ? 0 : STOCK_POOL[holding.ticker]!.beta), 0);
  let variance = 0;
  holdings.forEach((holding, i) => {
    const a = holding.ticker === "CASH" ? { sd: 0.005 } : STOCK_POOL[holding.ticker]!;
    holdings.forEach((other, j) => {
      const b = other.ticker === "CASH" ? { sd: 0.005 } : STOCK_POOL[other.ticker]!;
      variance += holding.weight * other.weight * a.sd * b.sd * (i === j ? 1 : correlation(holding.style, other.style));
    });
  });
  const volatility = Math.sqrt(Math.max(0, variance));
  return { expectedReturn, volatility, beta, sharpe: volatility > 0 ? (expectedReturn - Engine.ASSETS.cash.mu) / volatility : 0 };
}

export function buildInvestmentPortfolio(risk: RiskAppetite, background: FinancialBackground, monthlyBudget: number) {
  const allocation = RISK_ALLOCATIONS[risk];
  const budget = Math.max(0, monthlyBudget);
  const holdings: InvestmentHolding[] = [];
  (["Value", "Growth"] as const).forEach((style) => {
    const tickers = SELECTIONS[background][style];
    const classWeight = style === "Value" ? allocation.value : allocation.growth;
    tickers.forEach((ticker) => {
      const weight = classWeight / tickers.length;
      holdings.push({ ticker, style, weight, amount: budget * weight });
    });
  });
  holdings.push({ ticker: "CASH", style: "Cash", weight: allocation.cash, amount: budget * allocation.cash });
  return { allocation, holdings, statistics: investmentStatistics(holdings) };
}

export function estimatedShares(amountGbp: number, priceUsd: number) {
  return priceUsd > 0 ? amountGbp * GBP_USD / priceUsd : 0;
}
