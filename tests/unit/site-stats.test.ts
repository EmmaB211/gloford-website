import { describe, expect, it } from "vitest";
import { buildFallbackSiteStats } from "@/lib/services/siteStats/fallback";

describe("site stats fallback", () => {
  it("returns a consistent set of fallback stats when the admin stats table is empty", () => {
    const stats = buildFallbackSiteStats({
      programCount: 8,
      donationCount: 1250,
      subscriberCount: 320,
      eventCount: 24,
    });

    expect(stats).toEqual([
      { id: "_communities", label: "Communities Served", value: "45+" },
      { id: "_lives", label: "Lives Impacted", value: "1,594+" },
      { id: "_programs", label: "Active Programs", value: "8" },
      { id: "_years", label: "Years of Impact", value: "9+" },
    ]);
  });
});
