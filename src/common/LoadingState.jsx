import { Loader2 } from "lucide-react";

export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-neutral-secondary">
      <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}