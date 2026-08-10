import type { Metadata } from "next";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SuggestionBoxForm } from "./SuggestionBoxForm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://gloford.org";

export const metadata: Metadata = {
  title: "Suggestion Box",
  description: "Share feedback, suggestions, compliments, complaints, or concerns with GLOFORD Uganda.",
  openGraph: {
    title: "Suggestion Box",
    description: "Share feedback, suggestions, compliments, complaints, or concerns with GLOFORD Uganda.",
    type: "website",
    url: `${APP_URL}/suggestion-box`,
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Gloford" }],
  },
  twitter: { card: "summary_large_image", title: "Suggestion Box", images: ["/logo.png"] },
};

export default function SuggestionBoxPage() {
  return (
    <main className="bg-[var(--color-bg)]">
      <section className="bg-gradient-to-br from-[rgb(248_250_249)] via-white to-[rgb(240_247_244)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">Suggestion Box</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[var(--color-fg)] sm:text-5xl">
              Your Voice Matters — Help Us Improve Our Work
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-muted-fg)]">
              GLOFORD values feedback from the communities, staff, partners, beneficiaries, and stakeholders we serve. Use this suggestion box to share a suggestion, compliment, complaint, or concern. You may submit your feedback anonymously or provide your contact details if you would like us to follow up.
            </p>
            <p className="mt-4 text-lg font-semibold text-[var(--color-primary)]">Speak Up. Be Heard. Help Us Improve.</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SuggestionBoxForm />
        </div>
      </section>
    </main>
  );
}
