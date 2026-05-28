import { api, unwrapData } from "./client";

export async function getMapConfig() {
  const response = await api.get("/maps/config");
  return unwrapData(response);
}

export async function getAddressAutocomplete(params) {
  const searchText = params.q || params.query || "";

  const response = await api.get("/maps/autocomplete", {
    params: {
      query: searchText,
      q: searchText,
      latitude: params.latitude,
      longitude: params.longitude,
      limit: params.limit || 5,
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