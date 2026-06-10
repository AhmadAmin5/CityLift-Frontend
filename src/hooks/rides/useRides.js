import { useQuery } from "@tanstack/react-query";
import { getRides } from "@/api/rides.api";
import { queryKeys } from "@/query/queryKeys";

export function useRides(params, options = {}) {
  return useQuery({
    queryKey: queryKeys.rides(params || {}),
    queryFn: () => getRides(params),
    ...options,
  });
}
