import { api, unwrapData } from "./client";

function unwrapList(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function unwrapEntity(data, keys = []) {
  for (const key of keys) {
    if (data?.[key]) return data[key];
  }

  return data;
}

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

export async function getDriverDocuments() {
  const response = await api.get("/drivers/me/documents");
  return unwrapList(unwrapData(response), ["documents", "driver_documents"]);
}

export async function uploadDriverDocument({ file, document_type, vehicle_id }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", document_type);

  if (vehicle_id) {
    formData.append("vehicle_id", vehicle_id);
  }

  const response = await api.post("/drivers/me/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return unwrapEntity(unwrapData(response), ["document", "driver_document"]);
}

export async function getDriverVehicles() {
  const response = await api.get("/drivers/me/vehicles");
  return unwrapList(unwrapData(response), ["vehicles"]);
}

export async function createDriverVehicle(payload) {
  const response = await api.post("/drivers/me/vehicles", payload);
  return unwrapEntity(unwrapData(response), ["vehicle"]);
}

export async function updateDriverVehicle({ vehicle_id, ...payload }) {
  const response = await api.patch(`/drivers/me/vehicles/${vehicle_id}`, payload);
  return unwrapEntity(unwrapData(response), ["vehicle"]);
}

export async function setActiveDriverVehicle(vehicle_id) {
  const response = await api.post(
    `/drivers/me/vehicles/${vehicle_id}/set-active`
  );
  return unwrapEntity(unwrapData(response), ["vehicle"]);
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

export async function getDriverRatings() {
  const response = await api.get("/drivers/me/ratings");
  return unwrapData(response);
}

export async function getDriverEarnings(params) {
  const response = await api.get("/drivers/me/earnings", { params });
  return unwrapData(response);
}

