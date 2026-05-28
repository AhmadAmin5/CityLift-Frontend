import { useQuery } from "@tanstack/react-query";
import { getSavedPlaces } from "@/api/riders.api";
import { queryKeys } from "@/query/queryKeys";

export function useSavedPlaces() {
  return useQuery({
    queryKey: queryKeys.savedPlaces,
    queryFn: getSavedPlaces,
  });
}