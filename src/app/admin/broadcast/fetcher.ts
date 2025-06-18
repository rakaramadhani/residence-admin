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

export interface Broadcast {
  id: string;
  userId: string;
  kategori: string;
  broadcast: string;
  tanggal_acara: string | null;
  foto: string | null;
  status_broadcast: string;
  feedback: string | null;
  createdAt: string;
  user?: User;
}

// Fetcher untuk mendapatkan admin details
export const getAdminDetails = async (): Promise<User> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/details`, {
      headers: getHeaders(token),
    });
    console.log("Admin details:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching admin details:", error);
    throw error;
  }
};

// Fetcher untuk mendapatkan semua broadcast
export const getBroadcast = async (): Promise<Broadcast[]> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/broadcast`, {
      headers: getHeaders(token),
    });
    console.log("Response data:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching broadcast:", error);
    throw error;
  }
};

// Fetcher untuk mendapatkan semua users
export const getUsers = async (): Promise<User[]> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: getHeaders(token),
    });
    console.log("Users data:", response.data);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Fetcher untuk membuat broadcast baru dengan file upload
export const createBroadcast = async (broadcastData: {
  kategori: string;
  broadcast: string;
  tanggal_acara?: string;
  foto?: File;
}): Promise<Broadcast> => {
  const token = getToken();
  
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    // Dapatkan admin details untuk mendapatkan admin ID
    const adminDetails = await getAdminDetails();
    
    // Buat FormData untuk multipart/form-data
    const formData = new FormData();
    formData.append('kategori', broadcastData.kategori);
    formData.append('broadcast', broadcastData.broadcast);
    
    if (broadcastData.tanggal_acara) {
      formData.append('tanggal_acara', broadcastData.tanggal_acara);
    }
    
    if (broadcastData.foto) {
      formData.append('foto', broadcastData.foto);
    }

    const response = await axios.post(`${API_URL}/admin/${adminDetails.id}/broadcast`, formData, {
      headers: {
        Authorization: `${token}`,
        // Tidak set Content-Type, biar browser yang set untuk multipart/form-data
      },
    });
    
    console.log("Create broadcast response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error creating broadcast:", error);
    throw error;
  }
};

// Fetcher untuk update broadcast (approve/reject)
export const updateBroadcast = async (id: string, updateData: {
  status_broadcast?: string;
  feedback?: string;
}): Promise<Broadcast> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.put(`${API_URL}/admin/broadcast/${id}`, updateData, {
      headers: getHeaders(token),
    });
    console.log("Update broadcast response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error updating broadcast:", error);
    throw error;
  }
};
