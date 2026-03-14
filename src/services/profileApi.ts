export const uploadResume = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append("resume", file);
  const API_URL = import.meta.env.VITE_API_URL;

  return fetch(`${API_URL}/api/profile/upload-resume`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
};
