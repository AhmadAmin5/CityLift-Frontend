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

export function createSessionToken() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function hasValidCoordinates(location) {
  return Boolean(
    location &&
      typeof location.latitude === "number" &&
      typeof location.longitude === "number" &&
      Number.isFinite(location.latitude) &&
      Number.isFinite(location.longitude)
  );
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
    provider: raw.provider || fallback.provider || "google",
    provider_place_id:
      raw.provider_place_id ||
      raw.place_id ||
      raw.id ||
      fallback.provider_place_id ||
      null,
    place_id:
      raw.place_id ||
      raw.provider_place_id ||
      raw.id ||
      fallback.place_id ||
      fallback.provider_place_id ||
      null,
    name: raw.name || fallback.name || null,
    place_type: raw.place_type || fallback.place_type || null,
    primary_type: raw.primary_type || fallback.primary_type || null,
    business_status: raw.business_status || fallback.business_status || null,
    latitude,
    longitude,
    address:
      raw.address ||
      raw.place_name ||
      raw.full_address ||
      raw.name ||
      fallback.address ||
      "Selected location",
  };
}

export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}
