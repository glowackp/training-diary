import { ActivitySummary } from "@/components/activity/activity-summary";
import { RouteMapPlaceholder } from "@/components/maps/route-map-placeholder";

type ActivityDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/** Shows the Phase 0 placeholder for a single training activity. */
export default async function ActivityDetailPage({
  params,
}: ActivityDetailPageProps) {
  const { id } = await params;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Activity detail
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Placeholder activity {id}
        </h1>
        <p className="max-w-2xl text-sm text-[var(--color-muted)] sm:text-base">
          This route is wired for future activity metrics, comments, and source
          sync metadata without coupling the local development experience to
          Azure infrastructure.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <RouteMapPlaceholder />
        <ActivitySummary activityId={id} />
      </div>
    </section>
  );
}
