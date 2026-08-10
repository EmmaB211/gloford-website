import { db } from "@/lib/db";
import { toCollectionSlug, type PageCollectionKind } from "@/lib/pages/collections";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitialPageSlug(initialSlug: string | undefined, title: string) {
  return initialSlug?.trim() ? initialSlug : slugify(title);
}

export function ensureCollectionSlug(kind: PageCollectionKind, slug: string) {
  const normalized = slugify(slug || "page");
  return normalized.startsWith(`${kind}-`) ? normalized : toCollectionSlug(kind, normalized);
}

export function isPartnerCollectionSlug(slug: string) {
  return slugify(slug).startsWith("partner-");
}

export async function buildUniquePageSlug(baseSlug: string, excludeId?: string) {
  const trimmed = slugify(baseSlug || "page");
  if (!trimmed) return "page";

  let candidate = trimmed;
  let counter = 1;

  while (true) {
    const existing = await db.page.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;

    candidate = `${trimmed}-${counter}`;
    counter += 1;
  }
}
