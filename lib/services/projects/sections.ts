import type { ContentStatus } from "@prisma/client";

type ProjectLike = {
  status: ContentStatus;
};

export function splitProjectsBySection<T extends ProjectLike>(projects: T[]) {
  return projects.reduce(
    (acc, project) => {
      if (project.status === "ARCHIVED") {
        acc.completedProjects.push(project);
      } else {
        acc.currentProjects.push(project);
      }
      return acc;
    },
    { currentProjects: [] as T[], completedProjects: [] as T[] },
  );
}
