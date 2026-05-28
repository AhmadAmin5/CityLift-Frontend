import { cn } from "@/lib/utils";

export function PageContainer({ children, muted = false, className }) {
  return (
    <main className={cn(muted ? "ride-page-muted" : "ride-page", className)}>
      {children}
    </main>
  );
}