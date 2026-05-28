import { useMutation } from "@tanstack/react-query";
import { getRoutePreview } from "@/api/maps.api";

export function useRoutePreview() {
  return useMutation({
    mutationFn: getRoutePreview,
  });
}
