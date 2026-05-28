import { AlertCircle } from "lucide-react";

export function ErrorState({ message = "Something went wrong" }) {
  return (
    <div className="rounded-[20px] border border-danger/20 bg-red-50 p-4 text-danger">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}