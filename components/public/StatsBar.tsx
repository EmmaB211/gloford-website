import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";
import { getDisplaySiteStats } from "@/lib/services/siteStats";

export async function StatsBar() {
  const stats = await getDisplaySiteStats();
  return <StatsGrid stats={stats} />;
}

function StatsGrid({
  stats,
}: {
  stats: Array<{ id: string; label: string; value: string }>;
}) {
  return (
    <section className="border-y border-[var(--color-border)] bg-[rgb(var(--token-surface-2))] py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.id} delay={i * 0.1}>
              <div className="text-center">
                <AnimatedCounter
                  value={stat.value}
                  className="block text-3xl font-bold text-[var(--color-primary)] sm:text-4xl"
                />
                <p className="mt-2 text-sm text-[var(--color-muted-fg)]">
                  {stat.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
