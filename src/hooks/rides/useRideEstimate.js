import { useMutation } from "@tanstack/react-query";
import { estimateRide } from "@/api/rides.api";

export function useRideEstimate() {
  return useMutation({
    mutationFn: estimateRide,
  });
}