import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendOtp, verifyOtp } from "@/api/auth.api";
import { queryKeys } from "@/query/queryKeys";

export function useSendOtp() {
  return useMutation({
    mutationFn: sendOtp,
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}