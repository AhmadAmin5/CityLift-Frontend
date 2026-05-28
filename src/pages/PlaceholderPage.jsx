import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Car, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { queryKeys } from "@/query/queryKeys";
import { clearAccessToken } from "@/utils/tokenStorage";

export default function PlaceholderPage({ title, subtitle }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function handleLogout() {
    clearAccessToken();
    queryClient.removeQueries({ queryKey: queryKeys.me });
    navigate("/auth/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-6 pb-8 pt-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#E8F7F4]">
              <Car className="h-5 w-5 text-[#008C78]" />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#008C78]">RideFlow</p>
              <h1 className="text-xl font-bold text-[#101820]">{title}</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E1E5EA] text-[#4B5563]"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <div className="mt-10 rounded-[24px] border border-[#E1E5EA] bg-[#F7F8FA] p-5">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#101820]">
            {title}
          </h2>

          <p className="mt-2 text-base leading-6 text-[#4B5563]">
            {subtitle || "This screen is ready to build next."}
          </p>
        </div>

        <Button
          type="button"
          onClick={handleLogout}
          className="mt-auto h-14 w-full rounded-[14px] bg-[#008C78] text-base font-semibold text-white hover:bg-[#006F60]"
        >
          Logout
        </Button>
      </section>
    </main>
  );
}