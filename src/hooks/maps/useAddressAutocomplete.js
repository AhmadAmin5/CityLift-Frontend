import { useQuery } from "@tanstack/react-query";
import { getAddressAutocomplete } from "@/api/maps.api";
import { unwrapAutocompleteResponse } from "@/utils/locationUtils";

export function useAddressAutocomplete({ q, latitude, longitude }) {
  return useQuery({
    queryKey: ["maps", "autocomplete", q, latitude, longitude],
    queryFn: async () => {
      const data = await getAddressAutocomplete({
        q,
        latitude,
        longitude,
        limit: 5,
      });

      return unwrapAutocompleteResponse(data);
    },
    enabled: Boolean(q && q.trim().length >= 2),
    staleTime: 15 * 1000,
  });
}