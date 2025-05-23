"use client";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("adminToken") : null);

export interface User {
  email: string;
  username: string;
  phone: string;
  cluster: string;
  nomor_rumah: string;
  rt: string;
  rw: string;
}

export interface Order {
  user: User;
}

export interface Transaksi {
  id: string;
  orderId: string;
  transactionTime: string;
  grossAmount: string;
  currency: string;
  paymentType: string;
  transactionStatus: string;
  fraudStatus: string;
  statusCode: string;
  merchantId: string;
  order: Order;
  createdAt: string;
  updatedAt: string;
}

export const fetchAllTransaksi = async () => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  
  try {
    const response = await axios.get(`${API_URL}/admin/transaksi`, {
      headers: { Authorization: `${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDetailTransaksi = async (id: string) => {
  const token = getToken();
  if (!token) throw new Error("Token not found");
  
  try {
    const response = await axios.get(`${API_URL}/admin/transaksi/${id}`, {
      headers: { Authorization: `${token}` },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
