import { useQuery } from "@tanstack/react-query";
import { getRiderProfile } from "@/api/riders.api";
import { queryKeys } from "@/query/queryKeys";

export function useRiderProfile() {
  return useQuery({
    queryKey: queryKeys.riderProfile,
    queryFn: getRiderProfile,
  });
}