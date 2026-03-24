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

  const API_URL = import.meta.env.VITE_API_URL;

  const headers: any = {};

  if (token && token !== "null") {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}/api/profile/upload-resume`, {
    method: "POST",
    headers,
    body: formData,
  });
};