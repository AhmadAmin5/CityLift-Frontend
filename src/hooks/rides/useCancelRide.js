import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelRide } from "@/api/rides.api";
import { queryKeys } from "@/query/queryKeys";

export function useCancelRide(rideId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason) => cancelRide({ rideId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ride(rideId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rideLive(rideId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rides({}) });
    },
  });
}
