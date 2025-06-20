// API Configuration utility
export const getApiHeaders = () => ({
  'Content-Type': 'application/json',
});

export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  return {
    ...getApiHeaders(),
    ...(token ? { Authorization: `${token}` } : {}),
  };
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://residence-api-production.up.railway.app/api'; 