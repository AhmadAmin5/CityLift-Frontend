import { api, unwrapData } from "./client";

function unwrapSavedPlaces(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.saved_places)) return data.saved_places;
  if (Array.isArray(data?.places)) return data.places;
  return [];
}

function unwrapSavedPlace(data) {
  return data?.saved_place || data?.place || data;
}

export async function getRiderProfile() {
  const response = await api.get("/riders/me");
  return unwrapData(response);
}

export async function getSavedPlaces() {
  const response = await api.get("/riders/me/saved-places");
  return unwrapSavedPlaces(unwrapData(response));
}

export async function createSavedPlace(payload) {
  const response = await api.post("/riders/me/saved-places", payload);
  return unwrapSavedPlace(unwrapData(response));
}

export async function updateSavedPlace({ saved_place_id, ...payload }) {
  const response = await api.patch(
    `/riders/me/saved-places/${saved_place_id}`,
    payload
  );
  return unwrapSavedPlace(unwrapData(response));
}

export async function deleteSavedPlace(saved_place_id) {
  const response = await api.delete(`/riders/me/saved-places/${saved_place_id}`);
  return unwrapData(response);
}
