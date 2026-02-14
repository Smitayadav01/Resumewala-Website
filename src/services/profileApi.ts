export const uploadResume = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append("resume", file);

  return fetch("http://localhost:5000/api/profile/upload-resume", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
};
