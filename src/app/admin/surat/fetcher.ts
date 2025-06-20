"use client"
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://residence-api-production.up.railway.app/api";

export interface Surat {
  id: string;
  userId: string;
  deskripsi?: string;
  fasilitas: string;
  keperluan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  createdAt: string;
  file?: string;
  status: "requested" | "approved" | "rejected";
  feedback?: string;
  user: {
    username?: string;
    email: string;
    phone?: string;
    cluster?: string;
    nomor_rumah?: string;
    rt?: string;
    rw?: string;
  };
}

export interface UpdateSuratData {
  status: string;
  feedback?: string;
}

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("adminToken");
  }
  return null;
};

// Fungsi untuk mendapatkan headers dengan ngrok bypass
const getHeaders = (token?: string | null) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `${token}` } : {}),
});

// Fetcher untuk mendapatkan semua surat
export const fetchAllSurat = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/surat`, {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching surat:", error);
    throw error;
  }
};

// Fetcher untuk mendapatkan detail surat
export const fetchDetailSurat = async (id: string) => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/surat/${id}`, {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching surat detail:", error);
    throw error;
  }
};

// Fetcher untuk mengupdate status surat
export const updateStatusSurat = async (id: string, data: UpdateSuratData) => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.put(`${API_URL}/admin/surat/${id}`, data, {
      headers: getHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating surat:", error);
    throw error;
  }
};

// Fungsi untuk memeriksa apakah file sudah siap
export const checkFileStatus = async (id: string) => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/surat/${id}`, {
      headers: getHeaders(token),
    });
    return response.data?.data?.file ? true : false;
  } catch (error) {
    console.error("Error checking file status:", error);
    return false;
  }
};

// Fungsi download menggunakan XMLHttpRequest dengan debugging yang lebih baik
export const downloadWithXHR = async (id: string): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const downloadUrl = `${API_URL}/admin/surat/${id}/download`;
    
    console.log('Starting download:', downloadUrl);
    console.log('Using token:', token.substring(0, 20) + '...');
    
    xhr.open('GET', downloadUrl, true);
    xhr.setRequestHeader('Authorization', `${token}`);
    xhr.responseType = 'blob';
    xhr.timeout = 30000; // 30 seconds timeout

    xhr.onload = function() {
      console.log('XHR status:', xhr.status);
      console.log('XHR response type:', typeof xhr.response);
      
      if (xhr.status === 200) {
        try {
          const blob = xhr.response;
          console.log('Blob size:', blob.size);
          
          if (blob.size === 0) {
            reject(new Error('File kosong atau tidak ditemukan'));
            return;
          }
          
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `surat_perizinan_${id}.pdf`;
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }, 100);
          
          resolve();
        } catch (error) {
          console.error('Error processing blob:', error);
          reject(new Error('Gagal memproses file'));
        }
      } else if (xhr.status === 401) {
        reject(new Error('Akses ditolak. Silakan login ulang.'));
      } else if (xhr.status === 404) {
        reject(new Error('File tidak ditemukan.'));
      } else {
        // Coba baca response sebagai text untuk debugging
        const reader = new FileReader();
        reader.onload = function() {
          console.error('Error response:', reader.result);
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        };
        reader.readAsText(xhr.response);
      }
    };

    xhr.onerror = function() {
      console.error('Network error occurred');
      reject(new Error('Network error. Periksa koneksi internet Anda.'));
    };

    xhr.ontimeout = function() {
      console.error('Request timeout');
      reject(new Error('Request timeout. Silakan coba lagi.'));
    };

    xhr.send();
  });
};

// Fungsi alternatif menggunakan fetch API
export const downloadWithFetch = async (id: string): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await fetch(`${API_URL}/admin/surat/${id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `${token}`,
      },
    });

    console.log('Fetch response status:', response.status);
    console.log('Fetch response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Download error response:', errorText);
      
      if (response.status === 401) {
        throw new Error("Akses ditolak. Silakan login ulang.");
      } else if (response.status === 404) {
        throw new Error("File tidak ditemukan.");
      } else if (response.status === 400) {
        throw new Error("Permintaan tidak valid.");
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    }

    const blob = await response.blob();
    console.log('Fetch blob size:', blob.size);
    
    if (blob.size === 0) {
      throw new Error('File kosong atau tidak ditemukan');
    }
    
    // Buat URL untuk blob dan trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `surat_perizinan_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    
  } catch (error) {
    console.error("Error downloading surat:", error);
    throw error;
  }
};