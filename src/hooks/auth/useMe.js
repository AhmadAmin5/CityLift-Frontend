import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/api/auth.api";
import { queryKeys } from "@/query/queryKeys";
import { getAccessToken } from "@/utils/tokenStorage";

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled: Boolean(getAccessToken()),
  });
}