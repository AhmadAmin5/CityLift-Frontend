import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPendingVehicles, verifyVehicle } from "@/api/admin.api";

export function usePendingVehicles() {
  return useQuery({
    queryKey: ["admin", "pending-vehicles"],
    queryFn: getPendingVehicles,
  });
}

export function useVerifyVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "vehicles"] });
    },
  });
}
