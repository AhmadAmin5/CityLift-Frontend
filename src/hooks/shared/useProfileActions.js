import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/api/auth.api";
import { updateCurrentUser, uploadProfilePhoto } from "@/api/users.api";
import { queryKeys } from "@/query/queryKeys";
import { clearAccessToken } from "@/utils/tokenStorage";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (data) => {
      const user = data?.user || data;
      if (user) {
        queryClient.setQueryData(queryKeys.me, (current) => ({
          ...current,
          user,
        }));
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.riderProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.driverProfile });
    },
  });
}

export function useUploadProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfilePhoto,
    onSuccess: (data) => {
      const user = data?.user || data;
      if (user?.id) {
        queryClient.setQueryData(queryKeys.me, (current) => ({
          ...current,
          user,
        }));
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.riderProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.driverProfile });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAccessToken();
      queryClient.clear();
    },
  });
}
