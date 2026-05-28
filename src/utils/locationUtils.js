export function unwrapLocationResponse(data) {
  if (!data) return null;

  return (
    data.location ||
    data.place ||
    data.result ||
    (typeof data.address === "object" ? data.address : null) ||
    data.data ||
    data
  );
}

export function unwrapAutocompleteResponse(data) {
  if (!data) return [];

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.suggestions)) return data.suggestions;
  if (Array.isArray(data.places)) return data.places;
  if (Array.isArray(data.data)) return data.data;

  return [];
}

export function normalizeLocation(place, fallback = {}) {
  const raw = unwrapLocationResponse(place);

  if (!raw) return null;

  const latitude = Number(raw.latitude ?? raw.lat ?? fallback.latitude);
  const longitude = Number(raw.longitude ?? raw.lng ?? raw.lon ?? fallback.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    address:
      raw.address ||
      raw.place_name ||
      raw.full_address ||
      raw.name ||
      fallback.address ||
      "Selected location",
    provider: raw.provider || fallback.provider || "mapbox",
    provider_place_id:
      raw.provider_place_id ||
      raw.place_id ||
      raw.id ||
      fallback.provider_place_id ||
      null,
  };
}
