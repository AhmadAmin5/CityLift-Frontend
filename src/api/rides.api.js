import { api, unwrapData, unwrapPaginated } from "./client";

export async function estimateRide(payload) {
  const response = await api.post("/rides/estimate", payload);
  return unwrapData(response);
}

export async function createRide(payload) {
  const response = await api.post("/rides", payload);
  return unwrapData(response);
}

export async function getRides(params) {
  const response = await api.get("/rides", {
    params,
  });

  return unwrapPaginated(response);
}

export async function getRide(rideId) {
  const response = await api.get(`/rides/${rideId}`);
  return unwrapData(response);
}

export async function getRideLive(rideId) {
  const response = await api.get(`/rides/${rideId}/live`);
  return unwrapData(response);
}

export async function getRideRoute(rideId, params) {
  const response = await api.get(`/rides/${rideId}/route`, {
    params,
  });

  return unwrapData(response);
}

export async function cancelRide({ rideId, reason }) {
  const response = await api.post(`/rides/${rideId}/cancel`, {
    reason,
  });

  return unwrapData(response);
}

export async function arriveRide(rideId) {
  const response = await api.post(`/rides/${rideId}/arrive`);
  return unwrapData(response);
}

export async function startRide(rideId) {
  const response = await api.post(`/rides/${rideId}/start`);
  return unwrapData(response);
}

export async function submitRideTracking({ rideId, ...payload }) {
  const response = await api.post(`/rides/${rideId}/tracking`, payload);
  return unwrapData(response);
}

export async function completeRide({ rideId, ...payload }) {
  const response = await api.post(`/rides/${rideId}/complete`, payload);
  return unwrapData(response);
}

export async function submitRideRating({ rideId, rating, comment }) {
  const response = await api.post(`/rides/${rideId}/rating`, {
    rating,
    comment,
  });

  return unwrapData(response);
}

export async function getRideReceipt(rideId) {
  const response = await api.get(`/rides/${rideId}/receipt`);
  return unwrapData(response);
}
