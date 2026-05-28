import { api, unwrapData } from "./client";

export async function login(payload) {
  const response = await api.post("/auth/login", payload);
  return unwrapData(response);
}

export async function registerRider(payload) {
  const response = await api.post("/auth/register/rider", payload);
  return unwrapData(response);
}

export async function registerDriver(payload) {
  const response = await api.post("/auth/register/driver", payload);
  return unwrapData(response);
}

export async function getMe() {
  const response = await api.get("/auth/me");
  return unwrapData(response);
}

export async function sendOtp(payload) {
  const response = await api.post("/auth/otp/send", payload);
  return unwrapData(response);
}

export async function verifyOtp(payload) {
  const response = await api.post("/auth/otp/verify", payload);
  return unwrapData(response);
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return unwrapData(response);
}