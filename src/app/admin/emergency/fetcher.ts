"use client"
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("adminToken");
  }
  return null;
};

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
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching emergency:", error);
    throw error;
  }
};

// Export dengan nama yang konsisten
export const getEmergency = fetchAllEmergency;
