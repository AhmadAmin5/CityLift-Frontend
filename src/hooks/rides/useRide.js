import { useQuery } from "@tanstack/react-query";
import { getRide } from "@/api/rides.api";
import { queryKeys } from "@/query/queryKeys";

export function useRide(rideId) {
  return useQuery({
    queryKey: queryKeys.ride(rideId),
    queryFn: () => getRide(rideId),
    enabled: Boolean(rideId),
  });
}
