import { Engine } from "./engine";

export type AssetKey = "equity" | "bonds" | "cash" | "commodities";
export type PortfolioMix = Partial<Record<AssetKey, number>>;

export const PORTFOLIO_ASSETS: Record<AssetKey, { label: string; ticker: string; mu: number; sd: number; beta: number }> = {
  equity: { label: "Equities", ticker: "VT", mu: Engine.ASSETS.equity.mu, sd: Engine.ASSETS.equity.sd, beta: 1 },
  bonds: { label: "Bonds", ticker: "BNDW", mu: Engine.ASSETS.bonds.mu, sd: Engine.ASSETS.bonds.sd, beta: 0.05 },
  cash: { label: "Cash", ticker: "SHV", mu: Engine.ASSETS.cash.mu, sd: Engine.ASSETS.cash.sd, beta: 0 },
  commodities: { label: "Commodities", ticker: "GLD", mu: 0.04, sd: 0.16, beta: 0.25 },
};

export const DEMO_PORTFOLIO: { label: string; mix: PortfolioMix } = {
  label: "Balanced illustration",
  mix: { equity: 0.45, bonds: 0.30, cash: 0.15, commodities: 0.10 },
};

function activeAssets(mix: PortfolioMix) {
  return (Object.keys(PORTFOLIO_ASSETS) as AssetKey[])
    .map((key) => ({ key, weight: Math.max(0, mix[key] ?? 0), asset: PORTFOLIO_ASSETS[key] }))
    .filter((entry) => entry.weight > 0);
}

function modelMaxDrawdown(mu: number, sd: number) {
  const rand = Engine.mulberry32(2026);
  const normal = Engine.normalGen(rand);
  const monthlyMu = mu / 12;
  const monthlySd = sd / Math.sqrt(12);
  const drawdowns: number[] = [];
  for (let path = 0; path < 300; path += 1) {
    let value = 1;
    let peak = 1;
    let worst = 0;
    for (let month = 0; month < 180; month += 1) {
      const monthlyReturn = Math.exp(monthlyMu - (monthlySd * monthlySd) / 2 + monthlySd * normal()) - 1;
      value *= 1 + monthlyReturn;
      peak = Math.max(peak, value);
      worst = Math.min(worst, value / peak - 1);
    }
    drawdowns.push(worst);
  }
  drawdowns.sort((a, b) => a - b);
  return drawdowns[Math.floor(drawdowns.length / 2)];
}

export function portfolioStatistics(mix: PortfolioMix, band?: number) {
  const entries = activeAssets(mix);
  const engineStats = band ? Engine.bandStats(band) : null;
  const mu = engineStats?.mu ?? entries.reduce((sum, entry) => sum + entry.weight * entry.asset.mu, 0);
  const variance = entries.reduce((sum, entry) => sum + (entry.weight * entry.asset.sd) ** 2, 0);
  const equity = entries.find((entry) => entry.key === "equity");
  const bonds = entries.find((entry) => entry.key === "bonds");
  const commodities = entries.find((entry) => entry.key === "commodities");
  const equityBondCovariance = equity && bonds ? 2 * 0.2 * (equity.weight * equity.asset.sd) * (bonds.weight * bonds.asset.sd) : 0;
  const equityCommodityCovariance = equity && commodities ? 2 * 0.1 * (equity.weight * equity.asset.sd) * (commodities.weight * commodities.asset.sd) : 0;
  const sd = engineStats?.sd ?? Math.sqrt(variance + equityBondCovariance + equityCommodityCovariance);
  const beta = entries.reduce((sum, entry) => sum + entry.weight * entry.asset.beta, 0);
  const herfindahl = entries.reduce((sum, entry) => sum + entry.weight ** 2, 0);
  const diversification = entries.length > 1 ? 100 * (1 - herfindahl) / (1 - 1 / entries.length) : 0;
  return {
    expectedReturn: mu,
    volatility: sd,
    sharpe: sd > 0 ? (mu - Engine.ASSETS.cash.mu) / sd : 0,
    beta,
    maxDrawdown: modelMaxDrawdown(mu, sd),
    diversification,
  };
}
