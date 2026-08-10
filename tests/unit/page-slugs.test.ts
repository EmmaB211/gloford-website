import { describe, expect, it } from "vitest";
import { ensureCollectionSlug } from "@/lib/pages/slug";

describe("ensureCollectionSlug", () => {
  it("prefixes partner slugs so they appear in the public partners listing", () => {
    expect(ensureCollectionSlug("partner", "new-partner")).toBe("partner-new-partner");
  });

  it("keeps an existing collection slug unchanged", () => {
    expect(ensureCollectionSlug("partner", "partner-existing-partner")).toBe("partner-existing-partner");
  });
});
