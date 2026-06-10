import { useQuery } from "@tanstack/react-query";
import {
  getPopularRoutes,
  getCollusionDetection,
  getDriverDensity,
} from "@/api/admin.api";

export function usePopularRoutes() {
  return useQuery({
    queryKey: ["admin", "graph", "popular-routes"],
    queryFn: getPopularRoutes,
    retry: false,
  });
}

export function useCollusionDetection() {
  return useQuery({
    queryKey: ["admin", "graph", "collusion-detection"],
    queryFn: getCollusionDetection,
    retry: false,
  });
}

export function useDriverDensity() {
  return useQuery({
    queryKey: ["admin", "graph", "driver-density"],
    queryFn: getDriverDensity,
    retry: false,
  });
}
