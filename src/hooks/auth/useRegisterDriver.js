import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerDriver } from "@/api/auth.api";
import { queryKeys } from "@/query/queryKeys";
import { setAccessToken } from "@/utils/tokenStorage";

export function useRegisterDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerDriver,
    onSuccess: (data) => {
      setAccessToken(data?.access_token);
      queryClient.setQueryData(queryKeys.me, data);
    },
  });
}