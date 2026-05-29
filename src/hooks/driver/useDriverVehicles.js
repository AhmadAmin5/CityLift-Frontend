import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDriverVehicle,
  getDriverVehicles,
  setActiveDriverVehicle,
  updateDriverVehicle,
} from "@/api/drivers.api";
import { queryKeys } from "@/query/queryKeys";

function invalidateDriverVehicles(queryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.driverVehicles });
  queryClient.invalidateQueries({ queryKey: queryKeys.driverProfile });
}

export function useDriverVehicles() {
  return useQuery({
    queryKey: queryKeys.driverVehicles,
    queryFn: getDriverVehicles,
  });
}

export function useCreateDriverVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDriverVehicle,
    onSuccess: () => invalidateDriverVehicles(queryClient),
  });
}

export function useUpdateDriverVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDriverVehicle,
    onSuccess: () => invalidateDriverVehicles(queryClient),
  });
}

export function useSetActiveDriverVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setActiveDriverVehicle,
    onSuccess: () => invalidateDriverVehicles(queryClient),
  });
}
