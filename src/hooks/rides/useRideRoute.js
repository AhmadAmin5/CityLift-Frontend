import { useQuery } from "@tanstack/react-query";
import { getRideRoute } from "@/api/rides.api";
import { queryKeys } from "@/query/queryKeys";

export function useRideRoute(rideId, routeType) {
  return useQuery({
    queryKey: queryKeys.rideRoute(rideId, routeType),
    queryFn: () =>
      getRideRoute(rideId, routeType ? { route_type: routeType } : undefined),
    enabled: Boolean(rideId),
  });
}
