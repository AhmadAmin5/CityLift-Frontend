import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchLocationSuggestions,
  fetchPlaceDetails,
} from "@/api/maps.api";
import { unwrapAutocompleteResponse } from "@/utils/locationUtils";

function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, value]);

  return debouncedValue;
}

export function useAddressAutocomplete({
  q,
  query,
  latitude,
  longitude,
  limit = 5,
  sessionToken,
  typePreset = "all",
}) {
  const normalizedQuery = (query || q || "").trim();
  const debouncedQuery = useDebouncedValue(normalizedQuery);

  return useQuery({
    queryKey: [
      "location-autocomplete",
      debouncedQuery,
      latitude,
      longitude,
      limit,
      sessionToken,
      typePreset,
    ],
    queryFn: async ({ signal }) => {
      const data = await fetchLocationSuggestions(
        {
          query: debouncedQuery,
          latitude,
          longitude,
          limit,
          sessionToken,
          typePreset,
        },
        signal
      );

      return unwrapAutocompleteResponse(data);
    },
    enabled: debouncedQuery.length >= 2 && Boolean(sessionToken),
    staleTime: 0,
    retry: 1,
  });
}

export function usePlaceDetailsMutation() {
  return useMutation({
    mutationFn: ({ placeId, sessionToken }) =>
      fetchPlaceDetails({
        placeId,
        sessionToken,
      }),
  });
}
