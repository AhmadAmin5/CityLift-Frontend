import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSavedPlace,
  deleteSavedPlace,
  getSavedPlaces,
  updateSavedPlace,
} from "@/api/riders.api";
import { queryKeys } from "@/query/queryKeys";

export function useSavedPlaces() {
  return useQuery({
    queryKey: queryKeys.savedPlaces,
    queryFn: getSavedPlaces,
  });
}

export function useCreateSavedPlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSavedPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedPlaces });
    },
  });
}

export function useUpdateSavedPlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSavedPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedPlaces });
    },
  });
}

export function useDeleteSavedPlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSavedPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedPlaces });
    },
  });
}
