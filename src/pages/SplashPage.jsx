import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Loader2 } from "lucide-react";

import { useMe } from "@/hooks/auth/useMe";
import { clearAccessToken, getAccessToken } from "@/utils/tokenStorage";
import { getHomeRouteForRole, getActiveRideRoute } from "@/utils/authRoutes";
import { useRides } from "@/hooks/rides/useRides";

export default function SplashPage() {
  const navigate = useNavigate();
  const token = getAccessToken();
  const { data, isLoading, isError } = useMe();
  const role = data?.user?.role;

  const ridesQuery = useRides(
    role === "driver" ? { role: "driver" } : undefined,
    { enabled: !!role && (role === "rider" || role === "driver") }
  );

  useEffect(() => {
    if (!token) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (isError) {
      clearAccessToken();
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!role) return;

    if (role === "admin") {
      navigate(getHomeRouteForRole(role), { replace: true });
      return;
    }

    if (role === "rider" || role === "driver") {
      if (ridesQuery.isLoading && !ridesQuery.isError) return;

      const rides = ridesQuery.data?.data || ridesQuery.data || [];
      const activeRide = rides.find((r) => {
        if (role === "rider") {
          return ["searching_driver", "accepted", "arrived", "started"].includes(
            r.status
          );
        } else {
          return ["accepted", "arrived", "started"].includes(r.status);
        }
      });

      if (activeRide) {
        const route = getActiveRideRoute(activeRide, role);
        if (route) {
          navigate(route, { replace: true });
          return;
        }
      }

      navigate(getHomeRouteForRole(role), { replace: true });
    }
  }, [token, data, isError, role, navigate, ridesQuery.isLoading, ridesQuery.isError, ridesQuery.data]);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col items-center justify-center px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#E8F7F4] shadow-soft">
          <Car className="h-10 w-10 text-[#008C78]" />
        </div>

        <h1 className="mt-5 text-[34px] font-bold tracking-[-0.04em] text-[#101820]">
          CityLift
        </h1>

        <p className="mt-2 text-center text-base leading-6 text-[#4B5563]">
          Reliable rides, simple booking, and seamless navigation.
        </p>

        <div className="mt-8 flex items-center gap-2 text-sm font-medium text-[#4B5563]">
          <Loader2 className="h-5 w-5 animate-spin text-[#008C78]" />
          {isLoading ? "Checking your session..." : "Starting app..."}
        </div>
      </section>
    </main>
  );
}