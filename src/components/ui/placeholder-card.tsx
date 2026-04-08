type PlaceholderCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

/** Presents a compact card for placeholder content during early scaffolding phases. */
export function PlaceholderCard({
  eyebrow,
  title,
  description,
  children,
}: PlaceholderCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-panel)] p-5 shadow-[0_16px_40px_-32px_rgba(29,43,52,0.45)] backdrop-blur">
      <div className="space-y-3">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm leading-6 text-[var(--color-muted)]">
            {description}
          </p>
        </div>
        {children}
      </div>
    </article>
  );
}
