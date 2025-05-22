"use client"
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("adminToken") : null);

export const fetchPeraturan = async () => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  try {
    const response = await axios.get(`${API_URL}/admin/peraturan`, {
      headers: { Authorization: `${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPeraturan = async (data) => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  try {
    const response = await axios.post(`${API_URL}/admin/peraturan`, data, {
      headers: { Authorization: `${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePeraturan = async (id, data) => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  try {
    const response = await axios.put(`${API_URL}/admin/peraturan/${id}`, data, {
      headers: { Authorization: `${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePeraturan = async (id) => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  try {
    const response = await axios.delete(`${API_URL}/admin/peraturan/${id}`, {
      headers: { Authorization: `${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
