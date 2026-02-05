export const saveProfileSection = async (
  section: string,
  data: any
) => {
  // later replace with real backend
  return fetch(`/api/profile/${section}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};
