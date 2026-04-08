import { PlaceholderCard } from "@/components/ui/placeholder-card";

type ActivitySummaryProps = {
  activityId: string;
};

/** Summarizes the future activity metrics and comment area for a single entry. */
export function ActivitySummary({ activityId }: ActivitySummaryProps) {
  return (
    <PlaceholderCard
      eyebrow="Metrics"
      title="Activity summary placeholder"
      description="The final view will show minimum metrics like distance, pace or speed, heart rate, elapsed time, and a personal comment."
    >
      <dl className="grid gap-3 text-sm text-[var(--color-muted)] sm:grid-cols-2">
        <div className="rounded-2xl bg-[var(--color-accent-soft)] px-4 py-3">
          <dt className="font-medium text-[var(--color-ink)]">Activity ID</dt>
          <dd>{activityId}</dd>
        </div>
        <div className="rounded-2xl bg-[var(--color-accent-soft)] px-4 py-3">
          <dt className="font-medium text-[var(--color-ink)]">Comment</dt>
          <dd>Comment editing will be added in a later phase.</dd>
        </div>
      </dl>
    </PlaceholderCard>
  );
}
