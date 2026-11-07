import { describe, expect, it } from "vitest";
import { Engine } from "@/lib/engine";
import { DEMO_PORTFOLIO, portfolioStatistics } from "@/lib/portfolio";

describe("Portfolio presentation models", () => {
  it("uses four fully allocated asset types for the labelled demo", () => {
    const weights = Object.values(DEMO_PORTFOLIO.mix);
    expect(weights).toHaveLength(4);
    expect(weights.reduce((sum, weight) => sum + (weight ?? 0), 0)).toBe(1);
  });

  it("preserves engine return, volatility and Sharpe inputs for a real risk band", () => {
    const band = 3;
    const engine = Engine.bandStats(band);
    const stats = portfolioStatistics(Engine.BANDS[band]!.mix, band);
    expect(stats.expectedReturn).toBe(engine.mu);
    expect(stats.volatility).toBe(engine.sd);
    expect(stats.sharpe).toBe((engine.mu - Engine.ASSETS.cash.mu) / engine.sd);
  });

  it("rewards an even four-asset split with maximum diversification", () => {
    const stats = portfolioStatistics({ equity: 0.25, bonds: 0.25, cash: 0.25, commodities: 0.25 });
    expect(stats.diversification).toBeCloseTo(100);
    expect(stats.maxDrawdown).toBeLessThanOrEqual(0);
  });
});
