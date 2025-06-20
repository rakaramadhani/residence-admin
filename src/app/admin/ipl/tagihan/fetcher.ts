"use client"
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://residence-api-production.up.railway.app/api";

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
  clusterRef?: {
    id: number;
    nama_cluster: string;
    nominal_tagihan: number;
  };
}

export interface Tagihan {
  id: string;
  userId: string;
  metode_bayar: string;
  bulan: number;
  tahun: number;
  nominal: number;
  status_bayar: "lunas" | "belumLunas";
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface GenerateTagihanRequest {
  userIds: string[];
  bulan: number;
  tahun: number;
  nominal?: number;
  useClusterNominal?: boolean;
}

export interface GenerateTagihanResponse {
  message: string;
  berhasil: number;
  gagal: number;
  data: {
    berhasil: Tagihan[];
    gagal: Array<{
      userId: string;
      error: string;
    }>;
  };
}

export interface SendNotificationRequest {
  userId: string | string[];
  judul: string;
  isi: string;
  tipe: string;
}

export interface SendNotificationResponse {
  success: boolean;
  sent?: number;
  failed?: number;
  responses?: Array<{
    success: boolean;
    messageId?: string;
    error?: {
      code: string;
      message: string;
    };
  }>;
  message?: string;
}

// Fetcher untuk mendapatkan semua tagihan
const fetchAllTagihan = async (): Promise<Tagihan[]> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/tagihan`, {
      headers: getHeaders(token),
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching tagihan:", error);
    throw error;
  }
};

// Fetcher untuk mengupdate tagihan
const updateTagihanData = async (
  id: string, 
  data: Partial<Pick<Tagihan, 'status_bayar' | 'metode_bayar' | 'nominal'>>
): Promise<Tagihan> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.put(`${API_URL}/admin/tagihan/${id}`, data, {
      headers: getHeaders(token),
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating tagihan:", error);
    throw error;
  }
};

// Fetcher untuk generate tagihan manual
const generateTagihanManualData = async (data: GenerateTagihanRequest): Promise<GenerateTagihanResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.post(`${API_URL}/admin/tagihan/generate`, data, {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Error generating tagihan:", error);
    throw error;
  }
};

// Fetcher untuk mendapatkan semua users
const fetchAllUsers = async (): Promise<User[]> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: getHeaders(token),
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Fetcher untuk mengirim notifikasi reminder tagihan
const sendNotificationReminder = async (data: SendNotificationRequest): Promise<SendNotificationResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.post(`${API_URL}/admin/notification`, data, {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

// Fetcher untuk menghapus tagihan
const deleteTagihanData = async (id: string): Promise<{ success: boolean; message: string }> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.delete(`${API_URL}/admin/tagihan/${id}`, {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting tagihan:", error);
    throw error;
  }
};

// Export dengan nama yang konsisten dengan pola existing
export const getTagihan = fetchAllTagihan;
export const updateTagihan = updateTagihanData;
export const generateTagihanManual = generateTagihanManualData;
export const getUsers = fetchAllUsers;
export const sendNotification = sendNotificationReminder;
export const deleteTagihan = deleteTagihanData;
