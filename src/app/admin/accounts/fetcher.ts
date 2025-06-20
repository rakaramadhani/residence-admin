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

// Fungsi untuk mendapatkan headers
const getHeaders = (token?: string | null) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `${token}` } : {}),
});

// Fetcher untuk mendapatkan semua pengguna
const fetchUsers = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Fetcher untuk mendapatkan detail pengguna
const fetchUserDetail = async (userId: string) => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/user/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user detail:", error);
    throw error;
  }
};

// Fetcher untuk membuat pengguna baru
const createUser = async (userData: Record<string, unknown>) => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.post(`${API_URL}/admin/create-user`, userData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Fetcher untuk mengupdate pengguna
const updateUser = async (userId: string, userData: Record<string, unknown>) => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.put(`${API_URL}/admin/user/${userId}/update`, userData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Fetcher untuk verifikasi pengguna
const verifyUser = async (userId: string, data: { isVerified: boolean, feedback?: string }) => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.put(`${API_URL}/admin/user/${userId}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying user:", error);
    throw error;
  }
};

// Fetcher untuk menghapus pengguna
const deleteUser = async (userId: string) => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Fetcher untuk mendapatkan daftar cluster
const fetchClusters = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    console.log("Fetching clusters from:", `${API_URL}/admin/cluster`);
    const response = await axios.get(`${API_URL}/admin/cluster`, {
      headers: getHeaders(token),
    });
    console.log("Clusters API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching clusters:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
    }
    throw error;
  }
};

export {
  createUser, deleteUser,
  fetchClusters, fetchUserDetail, fetchUsers, updateUser,
  verifyUser
};

