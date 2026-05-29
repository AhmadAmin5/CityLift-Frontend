import { api, unwrapData } from "./client";

export async function getMapConfig() {
  const response = await api.get("/maps/config");
  return unwrapData(response);
}

export async function getAddressAutocomplete(params) {
  return fetchLocationSuggestions({
    query: params.query || params.q || "",
    latitude: params.latitude,
    longitude: params.longitude,
    limit: params.limit || 5,
    sessionToken: params.sessionToken || params.session_token,
    typePreset: params.typePreset || params.type_preset || "all",
  });
}

export async function fetchLocationSuggestions(params, signal) {
  const response = await api.get("/maps/autocomplete", {
    signal,
    params: {
      query: params.query,
      latitude: params.latitude,
      longitude: params.longitude,
      limit: params.limit || 5,
      session_token: params.sessionToken,
      ...(params.typePreset && params.typePreset !== "all"
        ? { type_preset: params.typePreset }
        : {}),
    },
  });

  return unwrapData(response);
}

export async function fetchPlaceDetails(params, signal) {
  const response = await api.get("/maps/place-details", {
    signal,
    params: {
      place_id: params.placeId,
      session_token: params.sessionToken,
    },
  });

  return unwrapData(response);
}

export async function reverseGeocode(params) {
  const response = await api.get("/maps/reverse-geocode", {
    params: {
      latitude: params.latitude,
      longitude: params.longitude,
    },
  });

  return unwrapData(response);
}

export async function getNearbyDrivers(params) {
  const response = await api.get("/maps/nearby-drivers", {
    params,
  });

  return unwrapData(response);
}

export async function getSurgeZones(params) {
  const response = await api.get("/maps/surge-zones", {
    params,
  });

  return unwrapData(response);
}

export async function getRoutePreview(payload) {
  const response = await api.post("/maps/route-preview", payload);
  return unwrapData(response);
}
