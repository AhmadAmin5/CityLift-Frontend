import { useEffect, useMemo, useState } from "react";
import { Home, MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddressAutocomplete,
  usePlaceDetailsMutation,
} from "@/hooks/maps/useAddressAutocomplete";
import {
  createSessionToken,
  hasValidCoordinates,
  normalizeLocation,
} from "@/utils/locationUtils";

export function LocationSearchInput({
  label,
  value,
  onSelect,
  savedPlaces = [],
  currentLocation,
  placeholder = "Search location",
}) {
  const [q, setQ] = useState(value?.address || "");
  const [sessionToken, setSessionToken] = useState(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [resolvingPlaceId, setResolvingPlaceId] = useState(null);
  const placeDetailsMutation = usePlaceDetailsMutation();

  useEffect(() => {
    setQ(value?.address || "");
  }, [value?.address]);

  const autocompleteQuery = useAddressAutocomplete({
    q,
    latitude: currentLocation?.latitude,
    longitude: currentLocation?.longitude,
    sessionToken,
  });

  const isSearching = q.trim().length >= 2;

  const suggestions = useMemo(() => {
    if (isSearching && suggestionsOpen) {
      return autocompleteQuery.data || [];
    }

    return suggestionsOpen ? savedPlaces || [] : [];
  }, [isSearching, suggestionsOpen, autocompleteQuery.data, savedPlaces]);

  function ensureSessionToken() {
    if (!sessionToken) {
      const nextToken = createSessionToken();
      setSessionToken(nextToken);
      return nextToken;
    }

    return sessionToken;
  }

  async function handleSelect(place) {
    if (!isSearching) {
      const selectedPlace = normalizeLocation(place);

      if (!hasValidCoordinates(selectedPlace)) return;

      setQ(selectedPlace.name || selectedPlace.address || "");
      setSuggestionsOpen(false);
      onSelect(selectedPlace);
      return;
    }

    const placeId = place.place_id || place.provider_place_id;
    const token = ensureSessionToken();

    if (!placeId) return;

    setResolvingPlaceId(placeId);

    try {
      const details = await placeDetailsMutation.mutateAsync({
        placeId,
        sessionToken: token,
      });
      const selectedPlace = normalizeLocation(details);

      if (!hasValidCoordinates(selectedPlace)) return;

      setQ(selectedPlace.name || selectedPlace.address || "");
      setSuggestionsOpen(false);
      setSessionToken(createSessionToken());
      onSelect(selectedPlace);
    } catch {
      // The inline error state below keeps the search field usable.
    } finally {
      setResolvingPlaceId(null);
    }
  }

  return (
    <div>
      {label ? (
        <p className="mb-2 text-sm font-semibold text-[#101820]">{label}</p>
      ) : null}

      <div className="flex h-[52px] items-center gap-3 rounded-[16px] border border-[#E1E5EA] bg-white px-4 focus-within:border-[#008C78] focus-within:ring-4 focus-within:ring-[#008C78]/10">
        <Search className="h-5 w-5 text-[#7A8088]" />

        <Input
          value={q}
          onFocus={() => {
            ensureSessionToken();
            setSuggestionsOpen(true);
          }}
          onChange={(event) => {
            ensureSessionToken();
            setQ(event.target.value);
            setSuggestionsOpen(true);
          }}
          placeholder={placeholder}
          className="h-auto border-0 p-0 text-base text-[#101820] shadow-none placeholder:text-[#8A9099] focus-visible:ring-0"
        />

        {q ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              onSelect(null);
              setSessionToken(createSessionToken());
              setSuggestionsOpen(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#7A8088]"
            aria-label="Clear location"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {autocompleteQuery.isFetching ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-12 rounded-[16px]" />
          <Skeleton className="h-12 rounded-[16px]" />
        </div>
      ) : null}

      {autocompleteQuery.isError ? (
        <p className="mt-2 text-sm font-medium text-[#DC2626]">
          Could not fetch suggestions. Try again.
        </p>
      ) : null}

      {placeDetailsMutation.isError ? (
        <p className="mt-2 text-sm font-medium text-[#DC2626]">
          Could not fetch location details. Please select another result.
        </p>
      ) : null}

      {suggestions?.length ? (
        <div className="mt-3 space-y-2">
          {suggestions.slice(0, 5).map((place, index) => {
            const title =
              place.label || place.name || place.full_address || place.address || "Location";
            const subtitle = place.full_address || place.address || "";
            const placeId = place.place_id || place.provider_place_id;
            const isResolving = resolvingPlaceId && resolvingPlaceId === placeId;

            return (
              <button
                key={
                  place.id ||
                  place.provider_place_id ||
                  place.place_id ||
                  place.address ||
                  index
                }
                type="button"
                disabled={Boolean(resolvingPlaceId)}
                onClick={() => handleSelect(place)}
                className="flex w-full items-center gap-3 rounded-[16px] border border-[#E1E5EA] bg-white p-3 text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1FBF9]">
                  {place.place_type ? (
                    <Home className="h-4 w-4 text-[#008C78]" />
                  ) : (
                    <MapPin className="h-4 w-4 text-[#008C78]" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#101820]">
                    {title}
                  </p>
                  <p className="truncate text-xs text-[#4B5563]">
                    {isResolving ? "Getting details..." : subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : suggestionsOpen && isSearching && !autocompleteQuery.isFetching ? (
        <p className="mt-2 text-sm text-[#8A9099]">No suggestions found.</p>
      ) : null}
    </div>
  );
}
