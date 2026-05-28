import { useQuery } from "@tanstack/react-query";
import { getDriverProfile } from "@/api/drivers.api";
import { queryKeys } from "@/query/queryKeys";

export function useDriverProfile() {
  return useQuery({
    queryKey: queryKeys.driverProfile,
    queryFn: getDriverProfile,
  });
}
