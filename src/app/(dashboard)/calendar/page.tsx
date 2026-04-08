import { PlaceholderCard } from "@/components/ui/placeholder-card";

/** Reserves the calendar route for month and week-based training views. */
export default function CalendarPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Calendar
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Training calendar</h1>
        <p className="max-w-2xl text-sm text-[var(--color-muted)] sm:text-base">
          This placeholder will evolve into a responsive calendar view for daily
          training load, comments, and quick navigation into activity details.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <PlaceholderCard
          eyebrow="Month view"
          title="Calendar grid placeholder"
          description="A month-level matrix will live here with status chips for completed workouts."
        />
        <PlaceholderCard
          eyebrow="Stats bridge"
          title="Sidebar summary placeholder"
          description="Weekly totals and activity counts will be connected once the stats endpoints are implemented."
        />
      </div>
    </section>
  );
}
