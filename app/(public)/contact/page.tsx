import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { getBrand } from "@/config/brand";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { contactPageJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://gloford.org";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with us. We'd love to hear from you.",
  openGraph: {
    title: "Contact Us",
    description: "Get in touch with us. We'd love to hear from you.",
    type: "website",
    url: `${APP_URL}/contact`,
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Gloford" }],
  },
  twitter: { card: "summary_large_image", title: "Contact Us", images: ["/logo.png"] },
};

export default async function ContactPage() {
  const t = await getTranslations("public.contact");

  const settings = await db.siteSettings
    .findUnique({
      where: { id: "singleton" },
      select: { siteName: true, contact: true },
    })
    .catch(() => null);

  const brand = getBrand();
  const contact = (settings?.contact as Record<string, string> | null) ?? {};
  const mapLocationUrl = "https://maps.app.goo.gl/H5danmuYR2pHbGJg7";

  return (
    <>
      <JsonLd
        data={[
          contactPageJsonLd({
            email: contact.email ?? brand.supportEmail,
            phone: contact.phone,
            address: contact.address,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Contact", href: "/contact" },
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
            <p className="mx-auto mt-4 max-w-xl text-[var(--color-muted-fg)]">
              {t("subheading")}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Cards + Form */}
      <section className="bg-[var(--color-bg)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <ScrollReveal delay={0.05}>
              <a
                href="/suggestion-box"
                className="group block overflow-hidden rounded-3xl border border-red-200 bg-[linear-gradient(135deg,#fff7f7_0%,#fee2e2_55%,#fecaca_100%)] p-6 shadow-[0_18px_45px_-20px_rgba(220,38,38,0.45)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_-18px_rgba(220,38,38,0.55)]"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-600">
                      Suggestion Box
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-[var(--color-fg)]">
                      Have a suggestion, complaint, or compliment?
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[var(--color-muted-fg)]">
                      We value your voice. Share your feedback with GLOFORD Uganda through our confidential suggestion box.
                    </p>
                  </div>
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/80 text-red-600 shadow-sm">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 10h10" />
                      <path d="M7 14h6" />
                      <path d="M5 5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-4l-4 3-4-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition group-hover:translate-x-1">
                  Submit Feedback
                  <span aria-hidden="true">→</span>
                </div>
              </a>
            </ScrollReveal>
          </div>

          <div className="grid gap-12 lg:grid-cols-5">
            {/* Info cards */}
            <div className="space-y-6 lg:col-span-2">
              <ScrollReveal>
                <h2 className="font-display text-2xl font-bold text-[var(--color-fg)]">
                  {t("getInTouch")}
                </h2>
                <p className="mt-2 text-sm text-[var(--color-muted-fg)]">
                  {t("responseTime")}
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="space-y-3">
                  {[
                    {
                      icon: Mail,
                      label: t("labelEmail"),
                      value: contact.email ?? brand.supportEmail ?? "info@gloford.org",
                      href: `mailto:${contact.email ?? brand.supportEmail ?? "info@gloford.org"}`,
                    },
                    {
                      icon: Phone,
                      label: t("labelPhone"),
                      value: contact.phone ?? "+256 700 000000",
                      href: `tel:${contact.phone ?? "+256700000000"}`,
                    },
                    {
                      icon: MapPin,
                      label: t("labelAddress"),
                      value: contact.address ?? "Kampala, Uganda",
                      href: null,
                    },
                    {
                      icon: Clock,
                      label: t("labelOfficeHours"),
                      value: t("officeHoursValue"),
                      href: null,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-white p-4 transition hover:shadow-sm"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--token-primary)/0.10)]">
                        <item.icon className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-fg)]">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-sm text-[var(--color-primary)] hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm text-[var(--color-muted-fg)]">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <a
                  href={mapLocationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm"
                >
                  <div className="border-b border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(240,247,244,1))] p-5">
                    <h3 className="font-display text-lg font-semibold text-[var(--color-fg)]">
                      Our location
                    </h3>
                    <p className="mt-1 text-sm text-[var(--color-muted-fg)]">
                      {contact.address ?? "Kampala, Uganda"}
                    </p>
                  </div>
                  <div className="flex h-80 items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.15),transparent_45%),linear-gradient(135deg,#f8faf9,#ecfdf5)] p-6">
                    <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white/90 p-6 text-center shadow-lg backdrop-blur">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(var(--token-primary)/0.10)]">
                        <MapPin className="h-7 w-7 text-[var(--color-primary)]" />
                      </div>
                      <h4 className="mt-4 text-lg font-semibold text-[var(--color-fg)]">
                        Open in Google Maps
                      </h4>
                      <p className="mt-2 text-sm text-[var(--color-muted-fg)]">
                        Tap to view the full location in Google Maps and get directions.
                      </p>
                      <span className="mt-5 inline-flex items-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition group-hover:scale-[1.02]">
                        View location
                      </span>
                    </div>
                  </div>
                </a>
              </ScrollReveal>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              <ScrollReveal delay={0.25}>
                <ContactForm />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
