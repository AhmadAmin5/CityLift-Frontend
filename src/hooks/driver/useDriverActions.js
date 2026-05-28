import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acceptDriverOffer,
  declineDriverOffer,
  updateDriverAvailability,
  updateDriverLocation,
} from "@/api/drivers.api";
import { queryKeys } from "@/query/queryKeys";

export function useDriverAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDriverAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.driverProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.driverOffers("sent") });
    },
  });
}

export function useDriverLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDriverLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.driverProfile });
    },
  });
}

export function useAcceptRideOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptDriverOffer,
    onSuccess: (data) => {
      const ride = data?.ride || data;
      queryClient.invalidateQueries({ queryKey: queryKeys.driverProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.driverOffers("sent") });
      if (ride?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.ride(ride.id) });
      }
    },
  });
}

export function useDeclineRideOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: declineDriverOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.driverOffers("sent") });
    },
  });
}
