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

// Fetcher untuk mendapatkan semua pengguna
const fetchUsers = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
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
const createUser = async (userData: any) => {
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
const updateUser = async (userId: string, userData: any) => {
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
    const response = await axios.get(`${API_URL}/admin/options/clusters`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching clusters:", error);
    throw error;
  }
};

export { 
  fetchUsers, 
  fetchUserDetail, 
  createUser, 
  updateUser, 
  verifyUser, 
  deleteUser,
  fetchClusters 
};
