"use client"
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://residence-api-production.up.railway.app/api";

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("adminToken") : null);

// Fungsi untuk mendapatkan headers dengan ngrok bypass
const getHeaders = (token?: string | null) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `${token}` } : {}),
});

// Fetch all pengaduan
const fetchPengaduan = async() => {
    const token = getToken();
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
        const response = await axios.get(`${API_URL}/admin/pengaduan`, {
            headers: getHeaders(token)
        })
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching pengaduan:", error);
        return null;
    }
}

// Fetch pengaduan by ID
const fetchPengaduanbyID = async(id: string) => {
    const token = getToken();
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
        const response = await axios.get(`${API_URL}/admin/pengaduan/${id}`, {
            headers: getHeaders(token)
        })
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching pengaduan:", error);
        return null;
    }
}

// Update pengaduan by ID
const updatePengaduan = async(id: string, data: { status_pengaduan: string, feedback: string }) => {
    const token = getToken();
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
        const response = await axios.put(`${API_URL}/admin/pengaduan/${id}`, data, {
            headers: getHeaders(token)
        })
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating pengaduan:", error);
        return null;
    }
}

export { fetchPengaduan, fetchPengaduanbyID, updatePengaduan };

