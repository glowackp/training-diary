import Link from "next/link";
import { APP_NAME, APP_VERSION } from "@/lib/config/app";

const navigationItems = [
  { href: "/", label: "Dashboard" },
  { href: "/calendar", label: "Calendar" },
  { href: "/activities/demo-activity", label: "Activity detail" },
  { href: "/settings", label: "Settings" },
];

/** Provides the shared dashboard shell used by the placeholder pages. */
export function AppFrame({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-shell min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-panel)] p-5 shadow-[0_24px_80px_-48px_rgba(29,43,52,0.55)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Personal training diary
              </p>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{APP_NAME}</h1>
                <p className="max-w-2xl text-sm text-[var(--color-muted)] sm:text-base">
                  Local-first groundwork for activities, stats, calendar views,
                  and Strava-driven ingestion.
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-panel-strong)] px-4 py-2 text-sm font-medium transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1 py-6">{children}</main>

        <footer className="flex flex-col gap-2 border-t border-[var(--color-border)] px-1 pt-6 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>Version {APP_VERSION}</p>
          <p>Designed to run locally without Azure dependencies.</p>
        </footer>
      </div>
    </div>
  );
}
