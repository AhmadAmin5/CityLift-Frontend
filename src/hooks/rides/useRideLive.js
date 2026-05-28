import { useQuery } from "@tanstack/react-query";
import { getRideLive } from "@/api/rides.api";
import { queryKeys } from "@/query/queryKeys";

export function useRideLive(rideId) {
  return useQuery({
    queryKey: queryKeys.rideLive(rideId),
    queryFn: () => getRideLive(rideId),
    enabled: Boolean(rideId),
  });
}
