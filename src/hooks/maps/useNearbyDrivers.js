import { useQuery } from "@tanstack/react-query";
import { getNearbyDrivers } from "@/api/maps.api";
import { queryKeys } from "@/query/queryKeys";

export function useNearbyDrivers({ latitude, longitude, radius_km = 3 }) {
  return useQuery({
    queryKey: queryKeys.nearbyDrivers(latitude, longitude, radius_km),
    queryFn: () =>
      getNearbyDrivers({
        latitude,
        longitude,
        radius_km,
      }),
    enabled: Boolean(latitude && longitude),
  });
}