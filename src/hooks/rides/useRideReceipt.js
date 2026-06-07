import { useQuery } from "@tanstack/react-query";
import { getRideReceipt } from "@/api/rides.api";
import { queryKeys } from "@/query/queryKeys";

export function useRideReceipt(rideId, options = {}) {
  return useQuery({
    queryKey: queryKeys.rideReceipt(rideId),
    queryFn: () => getRideReceipt(rideId),
    enabled: Boolean(rideId),
    ...options,
  });
}
