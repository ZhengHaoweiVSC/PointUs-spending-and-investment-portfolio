import { describe, expect, it } from "vitest";
import { PUBLIC_PATHS } from "@/lib/seo";

describe("Consolidated public pages", () => {
  it("keeps the merged pages in search listings and removes the retired duplicates", () => {
    expect(PUBLIC_PATHS).toContain("/how-it-works");
    expect(PUBLIC_PATHS).toContain("/about");
    expect(PUBLIC_PATHS).not.toContain("/features");
    expect(PUBLIC_PATHS).not.toContain("/faq");
  });
});
