"use client"
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Fetch all pengaduan
const fetchPengaduan = async() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
        const response = await axios.get(`${API_URL}/admin/pengaduan`, {
            headers: {
                "Authorization": `${token}`
            }
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
    const token = localStorage.getItem("adminToken");
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
        const response = await axios.get(`${API_URL}/admin/pengaduan/${id}`, {
            headers: {
                "Authorization": `${token}`
            }
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
    const token = localStorage.getItem("adminToken");
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
        const response = await axios.put(`${API_URL}/admin/pengaduan/${id}`, data, {
            headers: {
                "Authorization": `${token}`
            }
        })
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating pengaduan:", error);
        return null;
    }
}

export { fetchPengaduan, fetchPengaduanbyID, updatePengaduan };