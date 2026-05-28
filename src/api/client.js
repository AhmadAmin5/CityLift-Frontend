import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export function getApiErrorMessage(error) {
  return error?.response?.data?.message || "Something went wrong";
}

export function unwrapData(response) {
  return response.data.data;
}

export function unwrapPaginated(response) {
  return {
    data: response.data.data,
    meta: response.data.meta,
  };
}