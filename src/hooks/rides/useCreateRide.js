import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRide } from "@/api/rides.api";
import { queryKeys } from "@/query/queryKeys";

export function useCreateRide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rides({}) });
    },
  });
}