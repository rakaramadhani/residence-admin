// src/app/admin/cluster/fetcher.ts
"use client"
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://credible-promptly-shiner.ngrok-free.app/api";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("adminToken") : null);

// Fungsi untuk mendapatkan headers dengan ngrok bypass
const getHeaders = (token?: string | null) => ({
  "Content-Type": "application/json",
  "ngrok-skip-browser-warning": "true",
  ...(token ? { Authorization: `${token}` } : {}),
});

export const fetchClusters = async () => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  const res = await axios.get(`${API_URL}/admin/cluster`, {
    headers: getHeaders(token),
  });
  return res.data;
};

export const createCluster = async (data: { nama_cluster: string; nominal_tagihan: number }) => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  const res = await axios.post(`${API_URL}/admin/cluster`, data, {
    headers: getHeaders(token),
  });
  return res.data;
};

export const updateCluster = async (id: number, data: { nama_cluster: string; nominal_tagihan: number }) => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  const res = await axios.put(`${API_URL}/admin/cluster/${id}`, data, {
    headers: getHeaders(token),
  });
  return res.data;
};

export const deleteCluster = async (id: number) => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  const res = await axios.delete(`${API_URL}/admin/cluster/${id}`, {
    headers: getHeaders(token),
  });
  return res.data;
};