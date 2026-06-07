import { api, unwrapData } from "./client";

export async function getPricingRules() {
  const response = await api.get("/admin/pricing-rules");
  return unwrapData(response);
}

export async function createPricingRule(payload) {
  const response = await api.post("/admin/pricing-rules", payload);
  return unwrapData(response);
}

export async function updatePricingRule({ ruleId, ...payload }) {
  const response = await api.patch(`/admin/pricing-rules/${ruleId}`, payload);
  return unwrapData(response);
}

export async function reviewDriverDocument({ documentId, ...payload }) {
  const response = await api.patch(`/admin/driver-documents/${documentId}/review`, payload);
  return unwrapData(response);
}

export async function updateDriverApproval({ driverId, ...payload }) {
  const response = await api.patch(`/admin/drivers/${driverId}/approval`, payload);
  return unwrapData(response);
}

export async function upsertSurgeZone(payload) {
  const response = await api.post("/admin/surge-zones", payload);
  return unwrapData(response);
}

export async function getAdminDriverDocuments() {
  const response = await api.get("/admin/driver-documents");
  return unwrapData(response);
}

export async function getAdminMlModels() {
  const response = await api.get("/admin/ml-models");
  return unwrapData(response);
}
