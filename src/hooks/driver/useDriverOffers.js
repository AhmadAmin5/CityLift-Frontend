import { useQuery } from "@tanstack/react-query";
import { getDriverOffers } from "@/api/drivers.api";
import { queryKeys } from "@/query/queryKeys";

export function useDriverOffers(status = "sent") {
  return useQuery({
    queryKey: queryKeys.driverOffers(status),
    queryFn: () => getDriverOffers(status ? { status } : undefined),
  });
}
