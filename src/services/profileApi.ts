import { authFetch } from "./apiClient";

export const uploadResume = async (
  file: File,
  token?: string,
  previousPublicId?: string | null
) => {
  const formData = new FormData();

  formData.append("resume", file);

  // ⭐ send previous public id if exists
  if (previousPublicId) {
    formData.append("previousPublicId", previousPublicId);
  }

  const headers: any = {};

  if (token && token !== "null") {
    headers.Authorization = `Bearer ${token}`;
  }

  return authFetch("/api/profile/upload-resume", {
    method: "POST",
    headers,
    body: formData,
  });
};
