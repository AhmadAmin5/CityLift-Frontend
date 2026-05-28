import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Car, Loader2 } from "lucide-react";

import { useMe } from "@/hooks/auth/useMe";
import { clearAccessToken, getAccessToken } from "@/utils/tokenStorage";
import { getHomeRouteForRole } from "@/utils/authRoutes";

function RouteLoader({ label = "Loading..." }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#E8F7F4]">
          <Car className="h-7 w-7 text-[#008C78]" />
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-[#4B5563]">
          <Loader2 className="h-5 w-5 animate-spin text-[#008C78]" />
          <span className="text-sm font-medium">{label}</span>
        </div>
      </div>
    </main>
  );
}

export function RequireAuth({ allowedRoles }) {
  const location = useLocation();
  const token = getAccessToken();
  const { data, isLoading, isError } = useMe();

  if (!token) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (isLoading) {
    return <RouteLoader label="Checking your session..." />;
  }

  if (isError) {
    clearAccessToken();
    return <Navigate to="/auth/login" replace />;
  }

  const role = data?.user?.role;

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return <Navigate to={getHomeRouteForRole(role)} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const token = getAccessToken();
  const { data, isLoading, isError } = useMe();

  if (!token) {
    return <Outlet />;
  }

  if (isLoading) {
    return <RouteLoader label="Checking your session..." />;
  }

  if (isError) {
    clearAccessToken();
    return <Outlet />;
  }

  return <Navigate to={getHomeRouteForRole(data?.user?.role)} replace />;
}