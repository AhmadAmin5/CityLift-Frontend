import { useQuery } from "@tanstack/react-query";
import { getSurgeZones } from "@/api/maps.api";
import { queryKeys } from "@/query/queryKeys";

export function useSurgeZones(city = "Lahore") {
  return useQuery({
    queryKey: queryKeys.surgeZones(city),
    queryFn: () => getSurgeZones({ city }),
  });
}