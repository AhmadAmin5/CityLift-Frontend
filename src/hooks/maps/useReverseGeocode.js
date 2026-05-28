import { useMutation } from "@tanstack/react-query";
import { reverseGeocode } from "@/api/maps.api";

export function useReverseGeocode() {
  return useMutation({
    mutationFn: reverseGeocode,
  });
}