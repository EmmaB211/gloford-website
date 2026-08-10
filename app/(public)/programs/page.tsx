import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { getActiveServiceAreas } from "@/lib/services/serviceAreas";
import { listPublishedPrograms } from "@/lib/services/programs";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { StatsBar } from "@/components/public/StatsBar";
import { ArrowRight, Sparkles, BookOpen, Heart, Users, Globe, Briefcase, TrendingUp, HandHeart, type LucideIcon } from "lucide-react";
import ReadMore from "@/components/ui/ReadMore";
import { cn } from "@/lib/utils/cn";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionPageJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://gloford.org";

export const metadata: Metadata = {
  title: "Our Programs",
  description: "Explore our community development programs in education, healthcare, and sustainable livelihoods.",
  openGraph: {
    title: "Our Programs",
    description: "Explore our community development programs in education, healthcare, and sustainable livelihoods.",
    type: "website",
    url: `${APP_URL}/programs`,
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Gloford" }],
  },
  twitter: { card: "summary_large_image", title: "Our Programs", images: ["/logo.png"] },
};

export default async function ProgramsPage() {
  const t = await getTranslations("public.programs");
  const tHome = await getTranslations("public.home");
  const programs = await listPublishedPrograms();
  const serviceAreas = await getActiveServiceAreas();
  const impactStories = await db.page
    .findMany({
      where: { slug: { startsWith: "impact-story-" }, status: "PUBLISHED" },
      take: 3,
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true, seoDesc: true },
    })
    .catch(() => []);

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: "Our Programs",
            path: "/programs",
            description: "Explore our community development programs in education, healthcare, and sustainable livelihoods.",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Programs", href: "/programs" },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[rgb(248_250_249)] via-white to-[rgb(240_247_244)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">
              {t("eyebrow")}
            </p>
            <h1 className="font-display text-4xl font-bold text-[var(--color-fg)] sm:text-5xl">
              {t("heading")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--color-muted-fg)]">
              {t("subheading")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <StatsBar />

      {/* Areas of Impact */}
      <WhatWeDoSection t={tHome} serviceAreas={serviceAreas} />

      {/* Impact Stories */}
      {impactStories.length > 0 && (
        <ImpactStoriesSection stories={impactStories} t={tHome} />
      )}

      {/* Programs Grid */}
      <section className="bg-[var(--color-bg)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {programs.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-[var(--color-muted-fg)]">
                {t("empty")}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 0.1}>
                  <Link
                    href={`/programs/${p.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white transition hover:shadow-xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-muted)]">
                      {p.cover?.url ? (
                        <Image
                          src={p.cover.url}
                          alt={p.cover.alt ?? p.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[rgb(240_247_244)] to-[rgb(220_237_230)]">
                          <span className="text-4xl font-bold text-[rgb(var(--token-primary)/0.20)]">
                            {p.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h2 className="text-lg font-bold text-[var(--color-fg)] group-hover:text-[var(--color-primary)]">
                        {p.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--color-muted-fg)]">
                        {p.summary}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)]">
                        {t("learnMore")} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[rgb(240_247_244)] to-[rgb(230_242_236)] py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <ScrollReveal>
            <h2 className="font-display text-3xl font-bold text-[var(--color-fg)]">
              {t("ctaHeading")}
            </h2>
            <p className="mt-4 text-[var(--color-muted-fg)]">
              {t("ctaDesc")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-white transition hover:shadow-lg"
              >
                {t("ctaDonate")}
              </Link>
              <Link
                href="/get-involved"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
              >
                {t("ctaGetInvolved")}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Heart,
  Users,
  Globe,
  Briefcase,
  TrendingUp,
  HandHeart,
};

function WhatWeDoSection({
  t,
  serviceAreas,
}: {
  t: (key: string) => string;
  serviceAreas: Array<{ id: string; title: string; description: string; icon: string; color: string }>;
}) {
  const fallbackCards = [
    {
      icon: BookOpen,
      title: t("whatWeDoEducation"),
      desc: t("whatWeDoEducationDesc"),
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Heart,
      title: t("whatWeDoHealthcare"),
      desc: t("whatWeDoHealthcareDesc"),
      color: "from-rose-500 to-rose-600",
    },
    {
      icon: Users,
      title: t("whatWeDoCommunity"),
      desc: t("whatWeDoCommunityDesc"),
      color: "from-emerald-500 to-emerald-600",
    },
    {
      icon: Globe,
      title: t("whatWeDoEnvironment"),
      desc: t("whatWeDoEnvironmentDesc"),
      color: "from-teal-500 to-teal-600",
    },
  ];

  const cards =
    serviceAreas.length > 0
      ? serviceAreas.map((area) => ({
          icon: ICON_MAP[area.icon] ?? BookOpen,
          title: area.title,
          desc: area.description,
          color: area.color,
        }))
      : fallbackCards;

  return (
    <section className="bg-[rgb(248_250_249)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">
              {t("whatWeDoEyebrow")}
            </p>
            <h2 className="font-display text-3xl font-bold text-[var(--color-fg)] sm:text-4xl">
              {t("whatWeDoHeading")}
            </h2>
          </div>
        </ScrollReveal>

        <div className="overflow-hidden">
          <div className="animate-impact-marquee flex w-max gap-6 pr-6 hover:[animation-play-state:paused]">
            {[...cards, ...cards].map((card, i) => (
            <ScrollReveal key={card.title} delay={i * 0.1}>
                <div className="w-[280px] shrink-0 group rounded-2xl bg-white border border-[var(--color-border)] p-8 shadow-sm transition hover:shadow-xl">
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                    <card.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-[var(--color-fg)]">
                    {card.title}
                  </h3>
                  <ReadMore className="text-sm leading-relaxed text-[var(--color-muted-fg)]" html={card.desc} limit={240} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactStoriesSection({
  stories,
  t,
}: {
  stories: Array<{
    slug: string;
    title: string;
    seoDesc: string | null;
  }>;
  t: (key: string) => string;
}) {
  return (
    <section className="bg-gradient-to-br from-[rgb(248_250_249)] to-[rgb(240_247_244)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">
              {t("impactEyebrow")}
            </p>
            <h2 className="font-display text-3xl font-bold text-[var(--color-fg)] sm:text-4xl">
              {t("impactHeading")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted-fg)]">
              {t("impactDesc")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, i) => (
            <ScrollReveal key={story.slug} delay={i * 0.1}>
              <Link
                href={`/impact-stories/${story.slug.replace(/^impact-story-/, "")}`}
                className="group block rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-sm transition hover:shadow-xl hover:border-[rgb(var(--token-primary)/0.30)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--token-primary)/0.10)]">
                  <Sparkles className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-fg)] line-clamp-2">
                  {story.title}
                </h3>
                {story.seoDesc && (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted-fg)] line-clamp-3">
                    {story.seoDesc}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]">
                  {t("impactReadStory")} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="mt-12 text-center">
            <Link
              href="/impact-stories"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
            >
              {t("impactViewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
