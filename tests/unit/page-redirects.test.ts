import { describe, expect, it } from "vitest";
import { resolvePageCreateRedirectPath } from "@/lib/pages/redirects";

describe("resolvePageCreateRedirectPath", () => {
  it("uses the provided admin path when one is supplied", () => {
    expect(resolvePageCreateRedirectPath({ pageId: "page-123", redirectTo: "/admin/partners" })).toBe("/admin/partners");
  });

  it("falls back to the generic edit page when no admin path is provided", () => {
    expect(resolvePageCreateRedirectPath({ pageId: "page-123" })).toBe("/admin/pages/page-123");
  });
});
