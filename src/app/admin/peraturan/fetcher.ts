"use client"
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://residence-api-production.up.railway.app/api";

export enum Kategori_Peraturan {
  Keamanan = "Keamanan",
  Infrastruktur = "Infrastruktur", 
  Kebersihan = "Kebersihan",
  Pelayanan = "Pelayanan",
  Lainnya = "Lainnya"
}

export interface Peraturan {
  id: number;
  judul: string;
  isi_peraturan: string;
  kategori: Kategori_Peraturan;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePeraturanData {
  judul: string;
  isi_peraturan: string;
  kategori: Kategori_Peraturan;
}

export interface UpdatePeraturanData {
  judul: string;
  isi_peraturan: string;
  kategori: Kategori_Peraturan;
}

const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("adminToken") : null);

// Fungsi untuk mendapatkan headers
const getHeaders = (token?: string | null) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `${token}` } : {}),
});

export const fetchPeraturan = async () => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  try {
    const response = await axios.get(`${API_URL}/admin/peraturan`, {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPeraturan = async (data: CreatePeraturanData) => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  try {
    const response = await axios.post(`${API_URL}/admin/peraturan`, data, {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePeraturan = async (id: number, data: UpdatePeraturanData) => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  try {
    const response = await axios.put(`${API_URL}/admin/peraturan/${id}`, data, {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePeraturan = async (id: number) => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  try {
    const response = await axios.delete(`${API_URL}/admin/peraturan/${id}`, {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
