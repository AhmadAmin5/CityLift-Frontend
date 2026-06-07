import { useQuery } from "@tanstack/react-query";
import { getDriverRatings } from "@/api/drivers.api";
import { queryKeys } from "@/query/queryKeys";

export function useDriverRatings() {
  return useQuery({
    queryKey: queryKeys.driverRatings,
    queryFn: getDriverRatings,
  });
}
