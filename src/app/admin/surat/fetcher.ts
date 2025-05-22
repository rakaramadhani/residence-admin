"use client"
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Fungsi untuk mendapatkan token dari localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("adminToken");
  }
  return null;
};

// Fetcher untuk mendapatkan semua surat
const fetchAllSurat = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/surat`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching surat:", error);
    throw error;
  }
};

// Fetcher untuk mendapatkan detail surat
const fetchDetailSurat = async (id: string) => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/surat/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching surat detail:", error);
    throw error;
  }
};

// Fetcher untuk mengupdate status surat
const updateStatusSurat = async (id: string, data: { status: string, feedback?: string }) => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.put(`${API_URL}/admin/surat/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating surat:", error);
    throw error;
  }
};

// Fungsi untuk memeriksa apakah file sudah siap
const checkFileStatus = async (id: string) => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/surat/${id}`, {
      headers: {
        Authorization: `${token}`,
      },
    });
    return response.data?.data?.file ? true : false;
  } catch (error) {
    console.error("Error checking file status:", error);
    return false;
  }
};

// Fungsi untuk mendapatkan URL download surat
const getDownloadUrl = (id: string) => {
  return `${API_URL}/admin/surat/${id}/download`;
};

// Fungsi untuk langsung download file dengan metode window.open
const openDownloadSurat = (id: string) => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }
  
  // Sekarang gunakan metode window.open langsung dengan token sebagai parameter
  const downloadUrl = `${API_URL}/admin/surat/${id}/download`;
  
  // Gunakan metode 1: window.open dengan URL yang menyertakan token
  window.open(`${downloadUrl}?token=${encodeURIComponent(token)}`, "_blank");
};

// Fungsi alternatif untuk download menggunakan XMLHttpRequest
const downloadWithXHR = (id: string) => {
  return new Promise((resolve, reject) => {
    const token = getToken();
    if (!token) {
      reject(new Error("Token not found"));
      return;
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${API_URL}/admin/surat/${id}/download`, true);
    xhr.setRequestHeader('Authorization', `${token}`);
    xhr.responseType = 'blob';
    
    xhr.onload = function() {
      if (this.status === 200) {
        const blob = new Blob([this.response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `surat_perizinan_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        resolve(true);
      } else {
        reject(new Error(`HTTP status ${this.status}: ${this.statusText}`));
      }
    };
    
    xhr.onerror = function() {
      reject(new Error('Network error occurred'));
    };
    
    xhr.send();
  });
};

export { 
  fetchAllSurat, 
  fetchDetailSurat, 
  updateStatusSurat,
  getDownloadUrl,
  openDownloadSurat,
  checkFileStatus,
  downloadWithXHR
};
