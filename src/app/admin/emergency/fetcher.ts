"use client"
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://credible-promptly-shiner.ngrok-free.app/api";

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("adminToken");
  }
  return null;
};

// Fungsi untuk mendapatkan headers dengan ngrok bypass
const getHeaders = (token?: string | null) => ({
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
  ...(token ? { Authorization: `${token}` } : {}),
});

export interface User {
  id: string;
  username: string | null;
  email: string;
  phone: string | null;
  role: string;
  cluster: string | null;
  nomor_rumah: string | null;
  rt: string | null;
  rw: string | null;
}

export interface Emergency {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  kategori: string | null;
  detail_kejadian: string | null;
  created_at: string;
  updatedAt: string;
  user?: User;
}

// Fetcher untuk mendapatkan semua emergency
const fetchAllEmergency = async (): Promise<Emergency[]> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/emergency`, {
      headers: getHeaders(token),
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching emergency:", error);
    throw error;
  }
};

// Export dengan nama yang konsisten
export const getEmergency = fetchAllEmergency;

// Fungsi untuk update emergency
export const updateEmergency = async (id: string, data: { kategori: string; detail_kejadian: string }): Promise<Emergency> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.put(`${API_URL}/admin/emergency/${id}`, data, {
      headers: getHeaders(token),
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating emergency:", error);
    throw error;
  }
};

// Fungsi untuk delete emergency
export const deleteEmergency = async (id: string): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    await axios.delete(`${API_URL}/admin/emergency/${id}`, {
      headers: getHeaders(token),
    });
  } catch (error) {
    console.error("Error deleting emergency:", error);
    throw error;
  }
};
