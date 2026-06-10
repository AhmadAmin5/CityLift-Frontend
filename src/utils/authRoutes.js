export function getHomeRouteForRole(role) {
  if (role === "rider") return "/rider/home";
  if (role === "driver") return "/driver/home";
  if (role === "admin") return "/admin/dashboard";

  return "/auth/login";
}

export function getActiveRideRoute(ride, role) {
  if (!ride) return null;
  const { status, id } = ride;
  if (role === "rider") {
    if (status === "searching_driver") {
      return `/rider/ride/${id}/searching`;
    }
    if (["accepted", "arrived", "started"].includes(status)) {
      return `/rider/ride/${id}/live`;
    }
  } else if (role === "driver") {
    if (status === "accepted") {
      return `/driver/rides/${id}/navigation`;
    }
    if (status === "arrived") {
      return `/driver/rides/${id}/arrived`;
    }
    if (status === "started") {
      return `/driver/rides/${id}/active`;
    }
  }
  return null;
}