import api from "./axios";
import { API_BASE_URL } from "../config/api";

export const getMyProfile = () =>
  api.get("/profile/me").then((r) => r.data);

export const updateProfile = async (formData) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/profile/update`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      // DO NOT set Content-Type; browser handles the boundary automatically
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw { response: { data: errorData } }; // mimic axios error
  }
  return response.json();
};
