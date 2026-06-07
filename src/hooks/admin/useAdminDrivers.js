import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminDriverDocuments,
  reviewDriverDocument,
  updateDriverApproval,
} from "@/api/admin.api";

export function useAdminDriverDocuments() {
  return useQuery({
    queryKey: ["admin", "driver-documents"],
    queryFn: getAdminDriverDocuments,
  });
}

export function useVerifyDriverDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewDriverDocument,
    onSuccess: (data) => {
      const doc = data?.document || data;
      queryClient.invalidateQueries({ queryKey: ["driver", "documents"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "driver-documents"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "vehicles"] });
      if (doc?.driver_id) {
        queryClient.invalidateQueries({ queryKey: ["driver", doc.driver_id] });
      }
    },
  });
}

export function useUpdateDriverApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDriverApproval,
    onSuccess: (data) => {
      const driver = data?.driver || data;
      queryClient.invalidateQueries({ queryKey: ["driver", "me"] });
      if (driver?.id) {
        queryClient.invalidateQueries({ queryKey: ["driver", driver.id] });
      }
    },
  });
}
