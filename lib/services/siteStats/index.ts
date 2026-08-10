import { db } from "@/lib/db";
import { revalidateTag, unstable_noStore } from "next/cache";
import { buildFallbackSiteStats } from "./fallback";

const CACHE_TAG = "site-stats";

export async function getActiveSiteStats() {
  unstable_noStore();
  return db.siteStatistic.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getDisplaySiteStats() {
  unstable_noStore();
  const [dbStats, programCount, donationCount, subscriberCount, eventCount] = await Promise.all([
    db.siteStatistic.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
    db.program.count({ where: { status: "PUBLISHED" } }).catch(() => 0),
    db.donation.count({ where: { status: "SUCCEEDED" } }).catch(() => 0),
    db.subscriber.count().catch(() => 0),
    db.event.count().catch(() => 0),
  ]);

  if (dbStats.length > 0) {
    return dbStats;
  }

  return buildFallbackSiteStats({
    programCount,
    donationCount,
    subscriberCount,
    eventCount,
  });
}

export async function getAllSiteStats() {
  return db.siteStatistic.findMany({ orderBy: { order: "asc" } });
}

export async function createSiteStat(data: {
  label: string;
  value: string;
  icon?: string;
  order?: number;
}) {
  const stat = await db.siteStatistic.create({ data });
  revalidateTag(CACHE_TAG);
  return stat;
}

export async function updateSiteStat(
  id: string,
  data: {
    label?: string;
    value?: string;
    icon?: string | null;
    order?: number;
    isActive?: boolean;
  },
) {
  const stat = await db.siteStatistic.update({ where: { id }, data });
  revalidateTag(CACHE_TAG);
  return stat;
}

export async function deleteSiteStat(id: string) {
  await db.siteStatistic.delete({ where: { id } });
  revalidateTag(CACHE_TAG);
}
