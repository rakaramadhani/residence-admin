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

const fetchPenghuni = async() => {
    const token = getToken();
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
        const response = await axios.get(`${API_URL}/admin/penghuni`, {
            headers: getHeaders(token)
        })
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching penghuni:", error);
        return null;
    }
}

const fetchPenghunibyID = async(id: string) => {
    const token = getToken();
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
        const response = await axios.get(`${API_URL}/admin/penghuni/${id}`, {
            headers: getHeaders(token)
        })
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching penghuni:", error);
        return null;
    }
}

export { fetchPenghuni, fetchPenghunibyID };

