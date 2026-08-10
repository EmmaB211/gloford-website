import { describe, expect, it } from "vitest";
import type { ContentStatus } from "@prisma/client";
import { splitProjectsBySection } from "@/lib/services/projects/sections";

describe("splitProjectsBySection", () => {
  it("groups published and archived projects into current and completed sections", () => {
    const projects = [
      { id: "1", status: "PUBLISHED" as ContentStatus },
      { id: "2", status: "ARCHIVED" as ContentStatus },
      { id: "3", status: "PUBLISHED" as ContentStatus },
    ];

    const result = splitProjectsBySection(projects);

    expect(result.currentProjects).toHaveLength(2);
    expect(result.currentProjects.map((project) => project.id)).toEqual(["1", "3"]);
    expect(result.completedProjects).toHaveLength(1);
    expect(result.completedProjects[0]?.id).toBe("2");
  });
});
