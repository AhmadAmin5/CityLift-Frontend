import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDriverDocuments,
  uploadDriverDocument,
} from "@/api/drivers.api";
import { queryKeys } from "@/query/queryKeys";

export function useDriverDocuments() {
  return useQuery({
    queryKey: queryKeys.driverDocuments,
    queryFn: getDriverDocuments,
  });
}

export function useUploadDriverDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDriverDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.driverDocuments });
      queryClient.invalidateQueries({ queryKey: queryKeys.driverVehicles });
      queryClient.invalidateQueries({ queryKey: queryKeys.driverProfile });
    },
  });
}
