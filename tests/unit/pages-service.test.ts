import { describe, it, expect, vi, beforeEach } from "vitest";

const findFirstMock = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    page: {
      findFirst: findFirstMock,
    },
  },
}));

describe("getPublishedCollectionPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("resolves report pages with the collection prefix", async () => {
    const { getPublishedCollectionPage } = await import("@/lib/services/pages");
    findFirstMock.mockImplementation(async ({ where }: any) => {
      if (where.slug === "report-annual-accountability" && where.status === "PUBLISHED") {
        return { id: "1", slug: "report-annual-accountability", title: "Annual accountability", status: "PUBLISHED", deletedAt: null };
      }
      return null;
    });

    const page = await getPublishedCollectionPage("report", "annual-accountability");
    expect(page.slug).toBe("report-annual-accountability");
  });

  it("falls back to plain slug when the prefixed slug is not found", async () => {
    const { getPublishedCollectionPage } = await import("@/lib/services/pages");
    findFirstMock
      .mockImplementationOnce(async () => null)
      .mockImplementationOnce(async ({ where }: any) => {
        if (where.slug === "annual-accountability" && where.status === "PUBLISHED") {
          return { id: "2", slug: "annual-accountability", title: "Annual accountability (legacy)", status: "PUBLISHED", deletedAt: null };
        }
        return null;
      });

    const page = await getPublishedCollectionPage("report", "annual-accountability");
    expect(page.slug).toBe("annual-accountability");
  });
});
