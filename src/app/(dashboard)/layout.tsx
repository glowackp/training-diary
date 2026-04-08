import { AppFrame } from "@/components/ui/app-frame";

/** Wraps the Phase 0 dashboard routes in a shared application shell. */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppFrame>{children}</AppFrame>;
}
