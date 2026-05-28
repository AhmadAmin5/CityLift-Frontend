import { api, unwrapData } from "./client";

export async function getRiderProfile() {
  const response = await api.get("/riders/me");
  return unwrapData(response);
}

export async function getSavedPlaces() {
  const response = await api.get("/riders/me/saved-places");
  return unwrapData(response);
}