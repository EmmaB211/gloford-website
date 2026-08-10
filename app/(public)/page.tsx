import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";
import { getTranslations } from "next-intl/server";
import { getActiveHeroSlides } from "@/lib/services/heroSlides";
import { getActiveTestimonials } from "@/lib/services/testimonials";
import { getActiveLeaderMessages } from "@/lib/services/leaderMessages";
import { HeroSlider } from "@/components/public/HeroSlider";
import { TestimonialsSection } from "@/components/public/TestimonialsSection";
import { LeaderMessageSection } from "@/components/public/LeaderMessageSection";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import ReadMore from "@/components/ui/ReadMore";
import { cn } from "@/lib/utils/cn";
import { FALLBACK_IMAGES } from "@/lib/utils/images";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/services/settings/site";
import { getDisplaySiteStats } from "@/lib/services/siteStats";
import {
  Heart,
  Users,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Globe,
  HandHeart,
  Calendar,
  MapPin,
  Briefcase,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  organizationJsonLd,
  webSiteJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo/json-ld";
import SocialFeeds from "@/components/public/SocialFeeds";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://gloford.org";
const WHATSAPP_FALLBACK_PHONE = "+256 755 000283";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Gloford Foundation — strengthening communities through health, youth empowerment, climate resilience, and information access across Uganda.",
  openGraph: {
    title: "Gloford Foundation",
    description:
      "Strengthening communities through health, youth empowerment, and climate resilience across Uganda.",
    type: "website",
    url: APP_URL,
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Gloford" }],
  },
  twitter: { card: "summary_large_image", title: "Gloford Foundation", images: ["/logo.png"] },
};

export default async function HomePage() {
  const t = await getTranslations("public.home");
  const settings = await getSiteSettings();
  const contact = (settings?.contact as Record<string, string> | null) ?? {};
  const whatsappPhone = contact.phone ?? WHATSAPP_FALLBACK_PHONE;
  const [
    slides,
    testimonials,
    leaderMessages,
    siteStats,
    latestPosts,
    upcomingEvents,
    galleryImages,
  ] = await Promise.all([
    getActiveHeroSlides(),
    getActiveTestimonials(),
    getActiveLeaderMessages(),
    getDisplaySiteStats(),
    db.post
      .findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          publishedAt: true,
          cover: { select: { url: true, alt: true } },
        },
      })
      .catch(() => []),
    db.event
      .findMany({
        where: { isPublic: true, startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        take: 3,
        select: {
          id: true,
          slug: true,
          title: true,
          startsAt: true,
          location: true,
          cover: { select: { url: true, alt: true } },
        },
      })
      .catch(() => []),
    db.media
      .findMany({
        where: { showInGallery: true, mime: { startsWith: "image/" } },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { id: true, url: true, alt: true },
      })
      .catch(() => []),
  ]);

  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webSiteJsonLd(),
          breadcrumbJsonLd([{ name: "Home", href: "/" }]),
        ]}
      />

      {/* ── Section 1: Hero Slider ── */}
      {slides.length > 0 ? (
        <HeroSlider
          slides={slides.map((s) => ({
            id: s.id,
            title: s.title,
            subtitle: s.subtitle,
            ctaLabel: s.ctaLabel,
            ctaHref: s.ctaHref,
            imageUrl: s.imageUrl,
            imageAlt: s.imageAlt,
            durationMs: s.durationMs,
          }))}
        />
      ) : (
        <FallbackHero />
      )}

      {/* ── Section 2: Animated Stats (muted bg) ── */}
      <DynamicStatsSection dbStats={siteStats} t={t} foundingYear={settings?.foundingYear ?? 2017} />

      {/* ── Section 3: About Intro (light gradient bg) ── */}
      <AboutIntroSection t={t} />

      {/* ── Section 4: Leader Messages (white bg) ── */}
      {leaderMessages.length > 0 && (
        <LeaderMessageSection messages={leaderMessages} heading={t("leaderMessagesHeading")} />
      )}

      {/* ── Section 5: Latest Blog Posts ── */}
      {latestPosts.length > 0 && <LatestPostsSection posts={latestPosts} t={t} />}

      {/* ── Section 6: Upcoming Events ── */}
      {upcomingEvents.length > 0 && (
        <UpcomingEventsSection events={upcomingEvents} t={t} />
      )}

      {/* ── Section 7: Mini Gallery ── */}
      {galleryImages.length > 0 && (
        <MiniGallerySection images={galleryImages} t={t} />
      )}

      {/* ── Section 8: Social Feeds (from configured socials) ── */}
      <SocialFeeds socials={(settings?.socials as Record<string, string>) ?? {}} />

      {/* ── Section 9: Testimonials ── */}
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      {/* ── Section 10: Get Involved CTA ── */}
      <GetInvolvedSection t={t} />

      <WhatsAppFloatingButton phone={whatsappPhone} />
    </>
  );
}

function DynamicStatsSection({
  dbStats,
}: {
  dbStats: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  t: (key: string) => string;
  foundingYear: number;
}) {
  return (
    <section className="border-y border-[var(--color-border)] bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {dbStats.map((stat, i) => (
            <ScrollReveal key={stat.id} delay={i * 0.1}>
              <div className="text-center">
                <AnimatedCounter
                  value={stat.value}
                  className="block text-3xl font-bold text-[var(--color-primary)]"
                />
                <p className="mt-1 text-sm text-[var(--color-muted-fg)]">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatsAppFloatingButton({ phone }: { phone: string }) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 items-center gap-2 rounded-full bg-[#25D366] px-4 text-white shadow-[0_18px_40px_rgba(37,211,102,0.35)] transition hover:scale-105 hover:shadow-[0_22px_48px_rgba(37,211,102,0.45)] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-current">
        <path d="M12.04 2.01C6.5 2.01 2 6.5 2 12.05c0 1.77.46 3.5 1.34 5.03L2 22l5.07-1.31A9.95 9.95 0 0 0 12.04 22C17.58 22 22 17.54 22 12.05 22 6.5 17.58 2.01 12.04 2.01Zm0 18.15a8.1 8.1 0 0 1-4.1-1.12l-.29-.17-3.01.78.8-2.93-.19-.3a8.02 8.02 0 0 1-1.24-4.3c0-4.43 3.61-8.04 8.03-8.04 2.15 0 4.17.83 5.69 2.36a8.01 8.01 0 0 1 2.34 5.68c0 4.43-3.61 8.04-8.03 8.04Zm4.67-6.1c-.26-.13-1.53-.76-1.77-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.03-.15.17-.3.2-.56.07-.26-.13-1.1-.4-2.1-1.28-.78-.69-1.31-1.54-1.47-1.8-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.07-.13-.58-1.39-.79-1.9-.21-.5-.42-.43-.58-.44h-.5c-.17 0-.45.06-.68.32-.23.26-.88.86-.88 2.1s.9 2.44 1.02 2.61c.13.17 1.76 2.69 4.26 3.77.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.53-.62 1.74-1.22.22-.6.22-1.11.15-1.22-.07-.11-.23-.18-.49-.31Z" />
      </svg>
      <span className="text-sm font-semibold tracking-wide">WhatsApp</span>
    </a>
  );
}

function AboutIntroSection({ t }: { t: (key: string) => string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[rgb(240_247_244)] via-white to-[rgb(220_237_230)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">
              {t("aboutEyebrow")}
            </p>
            <h2 className="font-display text-3xl font-bold text-[var(--color-fg)] sm:text-4xl lg:text-5xl">
              {t("aboutHeading")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-muted-fg)]">
              {t("aboutDesc")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/who-we-are"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white transition hover:shadow-lg"
              >
                {t("aboutOurStory")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
              >
                {t("aboutOurPrograms")}
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── What We Do Section ─── */
const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Heart,
  Users,
  Globe,
  TrendingUp,
  HandHeart,
  Sparkles,
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

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, i) => (
            <ScrollReveal key={card.title} delay={i * 0.1}>
              <div className="group rounded-2xl bg-white border border-[var(--color-border)] p-8 shadow-sm transition hover:shadow-xl">
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}
                >
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
    </section>
  );
}

/* ─── Latest Blog Posts Section ─── */
function LatestPostsSection({
  posts,
  t,
}: {
  posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    publishedAt: Date | null;
    cover: { url: string; alt: string | null } | null;
  }>;
  t: (key: string) => string;
}) {
  return (
    <section className="bg-[var(--color-bg)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">
              {t("blogEyebrow")}
            </p>
            <h2 className="font-display text-3xl font-bold text-[var(--color-fg)] sm:text-4xl">
              {t("blogHeading")}
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 0.1}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition hover:shadow-xl"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-[rgb(248_250_249)]">
                  {post.cover?.url ? (
                    <Image
                      src={post.cover.url}
                      alt={post.cover.alt ?? post.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-10 w-10 text-[rgb(var(--token-muted-fg)/0.30)]" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {post.publishedAt && (
                    <time className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-fg)]">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  )}
                  <h3 className="mt-2 text-lg font-bold text-[var(--color-fg)] line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-fg)] line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]">
                    {t("blogReadMore")} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
            >
              {t("blogViewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Upcoming Events Section ─── */
function UpcomingEventsSection({
  events,
  t,
}: {
  events: Array<{
    id: string;
    slug: string;
    title: string;
    startsAt: Date;
    location: string | null;
    cover: { url: string; alt: string | null } | null;
  }>;
  t: (key: string) => string;
}) {
  return (
    <section className="bg-gradient-to-br from-[rgb(248_250_249)] to-[rgb(240_247_244)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">
              {t("eventsEyebrow")}
            </p>
            <h2 className="font-display text-3xl font-bold text-[var(--color-fg)] sm:text-4xl">
              {t("eventsHeading")}
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => {
            const d = new Date(event.startsAt);
            return (
              <ScrollReveal key={event.id} delay={i * 0.1}>
                <Link
                  href={`/events/${event.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition hover:shadow-xl"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-[rgb(248_250_249)]">
                    {event.cover?.url ? (
                      <Image
                        src={event.cover.url}
                        alt={event.cover.alt ?? event.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Calendar className="h-10 w-10 text-[rgb(var(--token-muted-fg)/0.30)]" />
                      </div>
                    )}
                    {/* Date badge */}
                    <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-3 py-2 text-center shadow-lg backdrop-blur-sm">
                      <span className="block text-xs font-bold uppercase text-[var(--color-primary)]">
                        {d.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="block text-2xl font-bold leading-none text-[var(--color-fg)]">
                        {d.getDate()}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[var(--color-fg)] line-clamp-2">
                      {event.title}
                    </h3>
                    {event.location && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--color-muted-fg)]">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {event.location}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]">
                      {t("eventsLearnMore")} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal>
          <div className="mt-12 text-center">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
            >
              {t("eventsViewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Open Positions Section ─── */
function OpenPositionsSection({
  positions,
  t,
}: {
  positions: Array<{
    slug: string;
    title: string;
    department: string;
    location: string;
    type: string;
  }>;
  t: (key: string) => string;
}) {
  const typeLabel = (tp: string) =>
    tp.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">
              {t("careersEyebrow")}
            </p>
            <h2 className="font-display text-3xl font-bold text-[var(--color-fg)] sm:text-4xl">
              {t("careersHeading")}
            </h2>
          </div>
        </ScrollReveal>

        <div className="mx-auto max-w-3xl space-y-4">
          {positions.map((pos, i) => (
            <ScrollReveal key={pos.slug} delay={i * 0.1}>
              <Link
                href={`/careers/${pos.slug}`}
                className="group flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm transition hover:shadow-xl hover:border-[rgb(var(--token-primary)/0.30)]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--token-primary)/0.10)]">
                    <Briefcase className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--color-fg)]">
                      {pos.title}
                    </h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--color-muted-fg)]">
                      <span>{pos.department}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {pos.location}
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span className="rounded-full bg-[rgb(var(--token-primary)/0.10)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-primary)]">
                        {typeLabel(pos.type)}
                      </span>
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-[var(--color-muted-fg)] transition group-hover:text-[var(--color-primary)] group-hover:translate-x-1" />
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="mt-12 text-center">
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
            >
              {t("careersViewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Mini Gallery Section ─── */
function MiniGallerySection({
  images,
  t,
}: {
  images: Array<{ id: string; url: string; alt: string | null }>;
  t: (key: string) => string;
}) {
  // Create a mixed masonry-like layout: first row 2 items, second row 3, third row 1 wide
  return (
    <section className="bg-gradient-to-b from-white to-[rgb(var(--token-muted))] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">
              {t("galleryEyebrow")}
            </p>
            <h2 className="font-display text-3xl font-bold text-[var(--color-fg)] sm:text-4xl">
              {t("galleryHeading")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--color-muted-fg)]">
              Moments captured from the field — community gatherings, outreach, and the people who make it all possible.
            </p>
          </div>
        </ScrollReveal>

        {/* Masonry-style grid: 2 tall + 1 square on top, 3 equal on bottom */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-2 sm:gap-4">
          {images.slice(0, 6).map((img, i) => (
            <ScrollReveal key={img.id} delay={i * 0.06}>
              <div className={cn(
                "group relative overflow-hidden rounded-2xl bg-[var(--color-muted)] shadow-sm transition-shadow duration-300 hover:shadow-xl",
                i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto sm:h-full" :
                "aspect-[4/3]",
              )}>
                <Image
                  src={img.url}
                  alt={img.alt ?? t("galleryImageAlt")}
                  fill
                  className="object-cover transition duration-700 ease-out group-hover:scale-110"
                  sizes={i === 0 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="mt-12 text-center">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
            >
              {t("galleryViewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ─── Get Involved CTA ─── */
function GetInvolvedSection({ t }: { t: (key: string) => string }) {
  const actions = [
    {
      icon: Heart,
      title: t("ctaDonateTitle"),
      desc: t("ctaDonateDesc"),
      href: "/donate",
      label: t("ctaDonateLabel"),
    },
    {
      icon: Users,
      title: t("ctaPartnerTitle"),
      desc: t("ctaPartnerDesc"),
      href: "/partners",
      label: t("ctaPartnerLabel"),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[rgb(240_247_244)] via-white to-[rgb(230_242_236)] py-20 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-14 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">
              {t("ctaEyebrow")}
            </p>
            <h2 className="font-display text-3xl font-bold text-[var(--color-fg)] sm:text-4xl">
              {t("ctaHeading")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted-fg)]">
              {t("ctaDesc")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 sm:grid-cols-2">
          {actions.map((action, i) => (
            <ScrollReveal key={action.title} delay={i * 0.15}>
              <div className="group rounded-2xl border border-[var(--color-border)] bg-white p-8 shadow-sm transition hover:shadow-xl hover:border-[rgb(var(--token-primary)/0.30)]">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[rgb(var(--token-primary)/0.10)]">
                  <action.icon className="h-7 w-7 text-[var(--color-primary)]" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[var(--color-fg)]">
                  {action.title}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-[var(--color-muted-fg)]">
                  {action.desc}
                </p>
                <Link
                  href={action.href}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] transition group-hover:gap-3"
                >
                  {action.label} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Fallback Hero (when no slides exist) ─── */
async function FallbackHero() {
  const t = await getTranslations("public.hero");
  const tHome = await getTranslations("public.home");
  return (
    <section className="relative min-h-[75vh] overflow-hidden bg-[rgb(var(--token-primary))]">
      <Image
        src={FALLBACK_IMAGES.hero}
        alt="Community action"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      <div className="relative z-10 mx-auto flex min-h-[75vh] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-6">
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {t("heading")}
          </h1>
          <p className="max-w-lg text-lg text-white/85 sm:text-xl">
            {t("subheading")}
          </p>
          <div className="flex gap-4">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:brightness-110"
            >
              <Heart className="h-4 w-4" /> {t("cta")}
            </Link>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {tHome("fallbackOurPrograms")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
