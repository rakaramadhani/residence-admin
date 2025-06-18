// API Configuration utility untuk ngrok
export const getApiHeaders = () => ({
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
});

export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  return {
    ...getApiHeaders(),
    ...(token ? { Authorization: `${token}` } : {}),
  };
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://credible-promptly-shiner.ngrok-free.app/api'; 