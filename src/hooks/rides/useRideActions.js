import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  arriveRide,
  completeRide,
  startRide,
  submitRideRating,
  submitRideTracking,
} from "@/api/rides.api";
import { queryKeys } from "@/query/queryKeys";

function invalidateRide(queryClient, rideId) {
  queryClient.invalidateQueries({ queryKey: queryKeys.ride(rideId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.rideLive(rideId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.rideReceipt(rideId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.rides({}) });
  queryClient.invalidateQueries({ queryKey: ["driver"] });
}

export function useArriveRide(rideId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => arriveRide(rideId),
    onSuccess: () => invalidateRide(queryClient, rideId),
  });
}

export function useStartRide(rideId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startRide(rideId),
    onSuccess: () => invalidateRide(queryClient, rideId),
  });
}

export function useSubmitRideTracking(rideId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => submitRideTracking({ rideId, ...payload }),
    onSuccess: () => invalidateRide(queryClient, rideId),
  });
}

export function useCompleteRide(rideId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => completeRide({ rideId, ...payload }),
    onSuccess: () => invalidateRide(queryClient, rideId),
  });
}

export function useSubmitRideRating(rideId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => submitRideRating({ rideId, ...payload }),
    onSuccess: () => {
      invalidateRide(queryClient, rideId);
      queryClient.invalidateQueries({ queryKey: queryKeys.driverRatings });
    },
  });
}
