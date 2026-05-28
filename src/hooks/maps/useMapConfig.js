import { useQuery } from "@tanstack/react-query";
import { getMapConfig } from "@/api/maps.api";
import { queryKeys } from "@/query/queryKeys";

export function useMapConfig() {
  return useQuery({
    queryKey: queryKeys.mapConfig,
    queryFn: getMapConfig,
  });
}
