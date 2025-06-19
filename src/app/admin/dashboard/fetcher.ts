import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/admin` : 'https://credible-promptly-shiner.ngrok-free.app/api/admin';

// Axios instance dengan konfigurasi default
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
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

// New interfaces for additional dashboard components
export interface Emergency {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  kategori?: string;
  detail_kejadian?: string;
  status?: string;
  created_at: string;
  updatedAt: string;
  user: User;
}

export interface EmergencyAlert {
  message: string;
  data: Emergency | null;
  hasAlert: boolean;
}

export interface Broadcast {
  id: string;
  userId: string;
  kategori: string;
  broadcast: string;
  tanggal_acara?: string;
  foto?: string;
  status_broadcast: "uploaded" | "verifying" | "approved" | "rejected";
  feedback?: string;
  createdAt: string;
  user: User;
}

export interface Cluster {
  id: number;
  nama_cluster: string;
  nominal_tagihan: number;
  createdAt: string;
  updatedAt: string;
}

export interface Surat {
  id: string;
  userId: string;
  deskripsi?: string;
  fasilitas?: string;
  keperluan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  createdAt: string;
  file?: string;
  status: "requested" | "approved" | "rejected";
  feedback?: string;
  user: User;
}

export interface GuestPermission {
  id: string;
  userId: string;
  guestName: string;
  startVisitDate: string;
  endVisitDate: string;
  qrUrl?: string;
  status: "scheduled" | "arrived";
  createdAt: string;
  user: User;
}

// New interface for GuestHistory (matches backend schema)
export interface GuestHistory {
  id: string;
  userId: string;
  guestName: string;
  startVisitDate: string;
  endVisitDate: string;
  createdAt: string;
  user: User;
}

export interface Transaksi {
  id: string;
  orderId: string;
  userId: string;
  grossAmount: number;
  currency: string;
  paymentType: string;
  transactionStatus: string;
  fraudStatus: string;
  vaBank?: string;
  vaNumber?: string;
  transactionTime?: string;
  settlementTime?: string;
  expiryTime?: string;
  order: Tagihan & { user: User };
}

// Existing API Functions
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

// New API Functions for additional dashboard components
export const fetchEmergency = async (): Promise<Emergency[]> => {
  try {
    const response = await api.get('/emergency');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching emergency:', error);
    throw error;
  }
};

export const fetchEmergencyAlert = async (): Promise<EmergencyAlert> => {
  try {
    const response = await api.get('/emergency/alert');
    return response.data;
  } catch (error) {
    console.error('Error fetching emergency alert:', error);
    throw error;
  }
};

export const fetchBroadcast = async (): Promise<Broadcast[]> => {
  try {
    const response = await api.get('/broadcast');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching broadcast:', error);
    throw error;
  }
};

export const fetchClusters = async (): Promise<Cluster[]> => {
  try {
    const response = await api.get('/cluster');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching clusters:', error);
    throw error;
  }
};

export const fetchSurat = async (): Promise<Surat[]> => {
  try {
    const response = await api.get('/surat');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching surat:', error);
    throw error;
  }
};

export const fetchGuestPermissions = async (): Promise<GuestHistory[]> => {
  try {
    console.log('Fetching guest permissions from API...');
    const response = await api.get('/guest-permission/history');
    console.log('Guest permissions API response:', response.data);
    
    if (!response.data || !response.data.data) {
      console.error('Invalid response structure:', response.data);
      throw new Error('Invalid response structure from API');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching guest permissions:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
    throw error;
  }
};

export const fetchTransaksi = async (): Promise<Transaksi[]> => {
  try {
    const response = await api.get('/transaksi');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching transaksi:', error);
    throw error;
  }
};

// Helper functions for creating and updating data
export const createBroadcast = async (data: FormData): Promise<{ success: boolean; data?: Broadcast }> => {
  try {
    // Get admin user ID (assuming it's stored somewhere or use a default)
    const adminUserId = localStorage.getItem('adminUserId') || 'admin-id';
    const response = await api.post(`/${adminUserId}/broadcast`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Error creating broadcast:', error);
    return { success: false };
  }
};

export const updateSuratStatus = async (id: string, status: string, feedback?: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.put(`/surat/${id}`, { status, feedback });
    return { success: response.status === 200 };
  } catch (error) {
    console.error('Error updating surat status:', error);
    return { success: false };
  }
};

export const updatePengaduanStatus = async (id: string, status_pengaduan: string, feedback?: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.put(`/pengaduan/${id}`, { status_pengaduan, feedback });
    return { success: response.status === 200 };
  } catch (error) {
    console.error('Error updating pengaduan status:', error);
    return { success: false };
  }
};