export const uploadResume = async (file: File, token?: string) => {
  const formData = new FormData();
  formData.append("resume", file);

  const API_URL = import.meta.env.VITE_API_URL;

  const headers: any = {};

  // ✅ ONLY send token if it exists
  if (token && token !== "null") {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}/api/profile/upload-resume`, {
    method: "POST",
    headers,
    body: formData,
  });
};