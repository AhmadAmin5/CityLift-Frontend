import { useQuery } from "@tanstack/react-query";
import { getDriverEarnings } from "@/api/drivers.api";
import { queryKeys } from "@/query/queryKeys";

export function useDriverEarnings({ period, from, to } = {}) {
  return useQuery({
    queryKey: queryKeys.driverEarnings(period, from, to),
    queryFn: () => getDriverEarnings({ period, from, to }),
  });
}
