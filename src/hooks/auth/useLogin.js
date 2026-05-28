import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "@/api/auth.api";
import { queryKeys } from "@/query/queryKeys";
import { setAccessToken } from "@/utils/tokenStorage";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAccessToken(data?.access_token);
      queryClient.setQueryData(queryKeys.me, data);
    },
  });
}