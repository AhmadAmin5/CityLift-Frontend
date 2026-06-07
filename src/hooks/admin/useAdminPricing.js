import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPricingRule,
  getAdminMlModels,
  getPricingRules,
  updatePricingRule,
  upsertSurgeZone,
} from "@/api/admin.api";
import { queryKeys } from "@/query/queryKeys";

export function useAdminPricingRules() {
  return useQuery({
    queryKey: queryKeys.adminPricingRules,
    queryFn: getPricingRules,
  });
}

export function useCreatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPricingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPricingRules });
    },
  });
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePricingRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminPricingRules });
    },
  });
}

export function useUpsertSurgeZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertSurgeZone,
    onSuccess: (data) => {
      const zone = data?.surge_zone || data;
      if (zone?.city) {
        queryClient.invalidateQueries({ queryKey: queryKeys.surgeZones(zone.city) });
      } else {
        queryClient.invalidateQueries({ queryKey: ["maps", "surge_zones"] });
      }
    },
  });
}

export function useAdminMlModels() {
  return useQuery({
    queryKey: queryKeys.adminMlModels,
    queryFn: getAdminMlModels,
  });
}
