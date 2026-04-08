import { PlaceholderCard } from "@/components/ui/placeholder-card";

/** Renders the initial dashboard summary for the scoped Phase 0 skeleton. */
export function DashboardOverview() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Dashboard
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          A clean starting point for training history
        </h2>
        <p className="max-w-2xl text-sm text-[var(--color-muted)] sm:text-base">
          The first phase focuses on a local-first app shell, typed integration
          boundaries, and the placeholders needed to grow into Strava sync,
          manual uploads, and statistics.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <PlaceholderCard
          eyebrow="Feed"
          title="Recent activity feed placeholder"
          description="This area will list synced or manually imported activities with quick access to metrics and comments."
        >
          <ul className="space-y-3 text-sm text-[var(--color-muted)]">
            <li className="rounded-2xl bg-[var(--color-accent-soft)] px-4 py-3">
              Morning run, route map, heart rate, and notes.
            </li>
            <li className="rounded-2xl bg-[var(--color-accent-soft)] px-4 py-3">
              Long ride, power and pace blocks, plus upload source metadata.
            </li>
          </ul>
        </PlaceholderCard>

        <div className="grid gap-4">
          <PlaceholderCard
            eyebrow="Stats"
            title="Summary cards placeholder"
            description="Weekly, monthly, and yearly aggregates will sit here once the stats endpoints are implemented."
          />
          <PlaceholderCard
            eyebrow="Imports"
            title="Strava and file ingestion placeholder"
            description="Primary ingestion comes from Strava, with FIT, TCX, and GPX uploads available as a fallback."
          />
        </div>
      </div>
    </section>
  );
}
