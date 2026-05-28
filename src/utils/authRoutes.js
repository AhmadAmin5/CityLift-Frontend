export function getHomeRouteForRole(role) {
  if (role === "rider") return "/rider/home";
  if (role === "driver") return "/driver/home";
  if (role === "admin") return "/admin/dashboard";

  return "/auth/login";
}