import { PlaceholderCard } from "@/components/ui/placeholder-card";

/** Holds the initial settings surface for storage and Strava configuration. */
export default function SettingsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Settings
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Local-first setup</h1>
        <p className="max-w-2xl text-sm text-[var(--color-muted)] sm:text-base">
          Phase 0 keeps configuration explicit: local file storage for uploads,
          Docker Compose for PostgreSQL, and server-side placeholders for Strava
          credentials.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderCard
          eyebrow="Storage"
          title="Local uploads"
          description="Uploads are configured to target the local filesystem in development."
        />
        <PlaceholderCard
          eyebrow="Integrations"
          title="Strava placeholders"
          description="OAuth exchange and sync flows are server-only and will be filled in during later phases."
        />
      </div>
    </section>
  );
}
