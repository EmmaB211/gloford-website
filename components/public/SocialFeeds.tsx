"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { extractYouTubeId } from "@/lib/utils/youtube";

type Socials = {
  twitter?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
};

export default function SocialFeeds({ socials }: { socials: Socials }) {
  const [data, setData] = useState<Record<string, any[]>>({ twitter: [], facebook: [], instagram: [], youtube: [], linkedin: [] });

  useEffect(() => {
    // Load Twitter widgets script if a twitter url is present
    if (socials?.twitter && typeof window !== "undefined") {
      if (!document.querySelector("script[src='https://platform.twitter.com/widgets.js']")) {
        const s = document.createElement("script");
        s.src = "https://platform.twitter.com/widgets.js";
        s.async = true;
        document.body.appendChild(s);
      }
    }
    // Fetch aggregated social content from server
    (async () => {
      try {
        const res = await fetch("/api/socials");
        if (!res.ok) return;
        const json = await res.json();
        setData({
          twitter: json.twitter ?? [],
          facebook: json.facebook ?? [],
          instagram: json.instagram ?? [],
          youtube: json.youtube ?? [],
          linkedin: json.linkedin ?? [],
        });
      } catch (e) {
        // ignore
      }
    })();
  }, [socials?.twitter]);

  const ytId = socials?.youtube ? extractYouTubeId(socials.youtube) : null;
  const youtubeItems = data.youtube ?? [];
  const twitterItems = data.twitter ?? [];
  const facebookItems = data.facebook ?? [];
  const linkedinItems = data.linkedin ?? [];

  return (
    <section className="bg-[rgb(248_250_249)] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]">Social</p>
          <h2 className="font-display text-2xl font-bold text-[var(--color-fg)]">From Our Social Channels</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Twitter/X timeline */}
          <div className="rounded-2xl bg-white border p-4 shadow-sm">
            {socials?.twitter ? (
              <a
                className="twitter-timeline"
                href={socials.twitter}
                data-chrome="noheader nofooter noborders"
                data-theme="light"
              >
                Tweets
              </a>
            ) : (
              <div className="p-6 text-sm text-[var(--color-muted-fg)]">No Twitter/X account configured.</div>
            )}
          </div>

          {/* Instagram (link fallback) */}
          <div className="rounded-2xl bg-white border p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-bold">Instagram</h3>
            {socials?.instagram ? (
              <Link href={socials.instagram} className="text-[var(--color-primary)] underline">
                View our Instagram
              </Link>
            ) : (
              <p className="text-sm text-[var(--color-muted-fg)]">No Instagram account configured.</p>
            )}
          </div>

          {/* YouTube preview / pulled items */}
          <div className="rounded-2xl bg-white border p-4 shadow-sm">
            <h3 className="mb-3 text-lg font-bold">YouTube</h3>
            {youtubeItems.length > 0 ? (
              <div className="grid gap-3">
                {youtubeItems.slice(0, 3).map((it, i) => (
                  <a key={i} href={it.link} className="group flex items-center gap-3 rounded-md p-2 hover:bg-[rgb(248_250_249)]">
                    {it.thumbnail ? (
                      <img src={it.thumbnail} alt={it.title} className="h-20 w-36 flex-none rounded-md object-cover" />
                    ) : (
                      <div className="h-20 w-36 flex-none rounded-md bg-[rgb(240_247_244)]" />
                    )}
                    <div>
                      <div className="text-sm font-semibold group-hover:underline">{it.title}</div>
                      <div className="text-xs text-[var(--color-muted-fg)]">{it.publishedAt ? new Date(it.publishedAt).toLocaleDateString() : ""}</div>
                    </div>
                  </a>
                ))}
              </div>
            ) : ytId ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-md"
                />
              </div>
            ) : socials?.youtube ? (
              <Link href={socials.youtube} className="text-[var(--color-primary)] underline">
                Visit our YouTube channel
              </Link>
            ) : (
              <p className="text-sm text-[var(--color-muted-fg)]">No YouTube channel configured.</p>
            )}
          </div>
        </div>
        
        {/* Render Twitter posts if available */}
        {twitterItems.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {twitterItems.slice(0, 6).map((t, i) => (
              <a key={i} href={t.link} className="group rounded-2xl bg-white border p-4 shadow-sm hover:shadow-lg">
                <div className="text-sm leading-relaxed">{t.text}</div>
                <div className="mt-3 text-xs text-[var(--color-muted-fg)]">{t.likeCount ? `${t.likeCount} likes` : ""} {t.retweetCount ? ` · ${t.retweetCount} shares` : ""}</div>
              </a>
            ))}
          </div>
        )}

        {/* Render Facebook posts */}
        {facebookItems.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {facebookItems.slice(0, 6).map((p, i) => (
              <a key={i} href={p.link} className="group rounded-2xl bg-white border p-4 shadow-sm hover:shadow-lg">
                {p.picture && <img src={p.picture} className="mb-3 h-36 w-full object-cover rounded-md" />}
                <div className="text-sm leading-relaxed">{p.message}</div>
                <div className="mt-3 text-xs text-[var(--color-muted-fg)]">{p.likeCount ? `${p.likeCount} likes` : ""} {p.shareCount ? ` · ${p.shareCount} shares` : ""}</div>
              </a>
            ))}
          </div>
        )}

        {/* LinkedIn posts */}
        {linkedinItems.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {linkedinItems.slice(0, 6).map((l, i) => (
              <a key={i} href={l.link ?? '#'} className="group rounded-2xl bg-white border p-4 shadow-sm hover:shadow-lg">
                <div className="text-sm leading-relaxed">{l.text}</div>
                <div className="mt-3 text-xs text-[var(--color-muted-fg)]">{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
