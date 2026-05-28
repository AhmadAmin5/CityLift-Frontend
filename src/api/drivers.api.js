import { api, unwrapData } from "./client";

export async function getDriverProfile() {
  const response = await api.get("/drivers/me");
  return unwrapData(response);
}

export async function updateDriverAvailability(payload) {
  const response = await api.patch("/drivers/me/availability", payload);
  return unwrapData(response);
}

export async function updateDriverLocation(payload) {
  const response = await api.post("/drivers/me/location", payload);
  return unwrapData(response);
}

export async function getDriverOffers(params) {
  const response = await api.get("/drivers/me/ride-offers", {
    params,
  });

  return unwrapData(response);
}

export async function acceptDriverOffer(offerId) {
  const response = await api.post(`/drivers/me/ride-offers/${offerId}/accept`);
  return unwrapData(response);
}

export async function declineDriverOffer({ offerId, decline_reason }) {
  const response = await api.post(`/drivers/me/ride-offers/${offerId}/decline`, {
    decline_reason,
  });

  return unwrapData(response);
}
