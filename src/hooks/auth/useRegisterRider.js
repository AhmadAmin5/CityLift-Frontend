import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerRider } from "@/api/auth.api";
import { queryKeys } from "@/query/queryKeys";
import { setAccessToken } from "@/utils/tokenStorage";

export function useRegisterRider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerRider,
    onSuccess: (data) => {
      setAccessToken(data?.access_token);
      queryClient.setQueryData(queryKeys.me, data);
    },
  });
}