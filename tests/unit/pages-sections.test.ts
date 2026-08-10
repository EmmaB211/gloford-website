import { describe, expect, it } from "vitest";
import type { ContentStatus } from "@prisma/client";
import { splitPagesByStatus } from "@/lib/services/pages/sections";

describe("splitPagesByStatus", () => {
  it("separates published and archived pages into current and previous groups", () => {
    const pages = [
      { id: "1", status: "PUBLISHED" as ContentStatus },
      { id: "2", status: "ARCHIVED" as ContentStatus },
      { id: "3", status: "PUBLISHED" as ContentStatus },
    ];

    const result = splitPagesByStatus(pages);

    expect(result.currentPages).toHaveLength(2);
    expect(result.currentPages.map((page) => page.id)).toEqual(["1", "3"]);
    expect(result.previousPages).toHaveLength(1);
    expect(result.previousPages[0]?.id).toBe("2");
  });
});
