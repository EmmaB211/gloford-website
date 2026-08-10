import type { ContentStatus } from "@prisma/client";

type PageLike = {
  status: ContentStatus;
};

export function splitPagesByStatus<T extends PageLike>(pages: T[]) {
  return pages.reduce(
    (acc, page) => {
      if (page.status === "ARCHIVED") {
        acc.previousPages.push(page);
      } else {
        acc.currentPages.push(page);
      }
      return acc;
    },
    { currentPages: [] as T[], previousPages: [] as T[] },
  );
}

export function splitPartnerPagesBySelection<T extends PageLike>(pages: T[]) {
  return pages.reduce(
    (acc, page) => {
      if (page.status === "ARCHIVED") {
        acc.previousPages.push(page);
      } else {
        acc.currentPages.push(page);
      }
      return acc;
    },
    { currentPages: [] as T[], previousPages: [] as T[] },
  );
}
