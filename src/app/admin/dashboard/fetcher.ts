import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/admin';

// Axios instance dengan konfigurasi default
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `${token}`;
  }
  return config;
});

// Interface types
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
  clusterRef?: {
    id: number;
    nama_cluster: string;
    nominal_tagihan: number;
  };
}

export interface Pengaduan {
  id: string;
  userId: string;
  pengaduan: string;
  kategori: string;
  status_pengaduan: string;
  created_at: string;
  user: User;
}

export interface Tagihan {
  id: string;
  userId: string;
  nominal: number;
  bulan: number;
  tahun: number;
  status_bayar: "lunas" | "belumLunas";
  createdAt: string;
  metode_bayar?: string;
  updatedAt?: string;
  user?: User;
}

export interface IuranSummary {
  totalLunas: number;
  jumlahLunas: number;
  jumlahBelumLunas: number;
  totalPenghuni: number;
}

export interface NotificationData {
  userId: string;
  judul: string;
  isi: string;
  tipe: string;
}

// API Functions
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/users');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const fetchPengaduan = async (): Promise<Pengaduan[]> => {
  try {
    const response = await api.get('/pengaduan');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching pengaduan:', error);
    throw error;
  }
};

export const fetchTagihan = async (): Promise<Tagihan[]> => {
  try {
    const response = await api.get('/tagihan');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching tagihan:', error);
    throw error;
  }
};

export const fetchIuranSummary = async (bulan: number, tahun: number): Promise<IuranSummary> => {
  try {
    const response = await api.get(`/tagihan/summary?bulan=${bulan}&tahun=${tahun}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching iuran summary:', error);
    throw error;
  }
};

export const sendNotification = async (data: NotificationData): Promise<{ success: boolean }> => {
  try {
    const response = await api.post('/notification', data);
    return { success: response.status === 200 || response.status === 201 };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false };
  }
}; 