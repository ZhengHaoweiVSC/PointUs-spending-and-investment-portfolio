import { describe, expect, it, vi } from "vitest";
import { Engine } from "@/lib/engine";
import { Personas } from "@/lib/personas";
import { buildFromAnswers, christmasCost, contributionSplit, debtMin, defaultAnswers, perPayment } from "@/lib/build-profile";
import { isDisposable, suggestEmail } from "@/lib/email";

describe("onboarding profile rules", () => {
  it("Christmas costs are 80 + 70 per person", () => expect(christmasCost(2, 2)).toBe(360));
  it("debt minimum is max(£25, 3% of balance)", () => { expect(debtMin(500)).toBe(25); expect(debtMin(2000)).toBe(60); });
  it("weekly pay converts monthly × 12 / 52", () => expect(perPayment(1300, "weekly")).toBe(300));
  it("other bills are tagged energy with 1.15 winter uplift on day 15", () => {
    const p = buildFromAnswers({ ...defaultAnswers(), bills: 200 });
    expect(p.bills.find((b) => b.label === "Other bills")).toMatchObject({ tag: "energy", winter: 1.15, schedule: { day: 15 } });
  });
});

describe("contribution split by rung", () => {
  it("rung 1-2 protect first", () => expect(contributionSplit(2)).toEqual({ buffer: 1, debt: 0, invest: 0 }));
  it("rung 3 is 70% debt / 30% buffer", () => expect(contributionSplit(3)).toEqual({ buffer: 0.3, debt: 0.7, invest: 0 }));
  it("rung 4 is 50/50", () => expect(contributionSplit(4)).toEqual({ buffer: 0.5, debt: 0, invest: 0.5 }));
  it("rung 5 all to portfolio", () => expect(contributionSplit(5).invest).toBe(1));
});

describe("email checks", () => {
  it("suggests gmail for gmial", () => expect(suggestEmail("a@gmial.com")).toBe("a@gmail.com"));
  it("blocks mailinator", () => expect(isDisposable("a@mailinator.com")).toBe(true));
});

describe("engine self-check (Amara, early November)", () => {
  it("score ≈ 51, rung 1, worst risk ≈ 76% near early Feb", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-07T12:00:00Z"));
    const p = Personas.amara;
    const fc = Engine.forecast(p, {});
    const sc = Engine.score(p, fc);
    vi.useRealTimers();
    expect(sc.rung).toBe(1);
    expect(Math.abs(sc.total - 51)).toBeLessThanOrEqual(3);
    expect(Math.abs(fc.worstPNeg - 0.76)).toBeLessThanOrEqual(0.06);
  });
});
