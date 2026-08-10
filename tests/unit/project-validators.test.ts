import { describe, expect, it } from "vitest";
import { projectCreateSchema } from "@/lib/validators/projects";

describe("projectCreateSchema", () => {
  it("defaults a new project to current status", () => {
    const parsed = projectCreateSchema.parse({
      slug: "sample-project",
      title: "Sample project",
      summary: "A sample project",
    });

    expect(parsed.status).toBe("PUBLISHED");
  });

  it("accepts a completed project status", () => {
    const parsed = projectCreateSchema.parse({
      slug: "completed-project",
      title: "Completed project",
      summary: "A completed project",
      status: "ARCHIVED",
    });

    expect(parsed.status).toBe("ARCHIVED");
  });
});
