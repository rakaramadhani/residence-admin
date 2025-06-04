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

export interface EmergencyUser {
  id: string;
  username: string | null;
  email: string;
  phone: string | null;
  cluster: string | null;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  kategori: string | null;
  detail_kejadian: string | null;
  created_at: string;
  updatedAt: string;
  status?: string;
  user?: EmergencyUser;
}

export interface EmergencyAlertResponse {
  message: string;
  data: EmergencyAlert | null;
  hasAlert: boolean;
}

// Fetcher untuk mendapatkan emergency alert
export const getEmergencyAlert = async (): Promise<EmergencyAlertResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/emergency/alert`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching emergency alert:", error);
    throw error;
  }
};

// Fetcher untuk mendapatkan semua emergency (untuk redirect)
export const getAllEmergency = async () => {
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
    return response.data;
  } catch (error) {
    console.error("Error fetching all emergency:", error);
    throw error;
  }
}; 