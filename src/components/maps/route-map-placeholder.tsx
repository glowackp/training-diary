import { PlaceholderCard } from "@/components/ui/placeholder-card";

/** Reserves the map panel for future MapLibre route rendering. */
export function RouteMapPlaceholder() {
  return (
    <PlaceholderCard
      eyebrow="Map"
      title="Route map placeholder"
      description="Outdoor activities will render their route geometry here once the ingestion and map layers are wired up."
    >
      <div className="flex min-h-72 items-center justify-center rounded-[1.5rem] border border-dashed border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(14,116,144,0.08))] text-sm text-[var(--color-muted)]">
        MapLibre surface reserved for future route overlays.
      </div>
    </PlaceholderCard>
  );
}
