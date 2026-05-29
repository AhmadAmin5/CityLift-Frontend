import { api, unwrapData } from "./client";

export async function updateCurrentUser(payload) {
  const response = await api.patch("/users/me", payload);
  return unwrapData(response);
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append("profile_photo", file);

  const response = await api.post("/users/me/profile-photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return unwrapData(response);
}
