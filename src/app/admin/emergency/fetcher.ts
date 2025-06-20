"use client"
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://residence-api-production.up.railway.app/api";

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
}

export interface Emergency {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  kategori: string | null;
  detail_kejadian: string | null;
  status?: string;
  created_at: string;
  updatedAt: string;
  user?: User;
}

export interface EmergencyAlert {
  message: string;
  data: Emergency | null;
  hasAlert: boolean;
}

// Endpoint checker function
export const checkEmergencyEndpoints = async (): Promise<void> => {
  const token = getToken();
  console.log('🔍 Checking emergency endpoints...');
  console.log('🔍 API Base URL:', API_URL);
  console.log('🔍 Token available:', !!token);

  if (!token) {
    console.log('❌ No token available for endpoint testing');
    return;
  }

  const endpoints = [
    { path: '/admin/emergency', name: 'Get All Emergency' },
    { path: '/admin/emergency/alert', name: 'Get Emergency Alert' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 Testing: ${endpoint.name} (${endpoint.path})`);
      
      const response = await fetch(`${API_URL}${endpoint.path}`, {
        method: 'GET',
        headers: getHeaders(token),
      });

      console.log(`📊 ${endpoint.name}: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
          console.log(`❌ ${endpoint.name}: Returns HTML (likely endpoint doesn't exist)`);
        } else {
          console.log(`❌ ${endpoint.name}: ${errorText.substring(0, 200)}...`);
        }
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          console.log(`✅ ${endpoint.name}: OK (JSON response)`);
        } else {
          console.log(`⚠️ ${endpoint.name}: OK but not JSON (${contentType})`);
        }
      }

    } catch (error) {
      console.log(`💥 ${endpoint.name}: Error -`, error);
    }
  }
};

// Fetcher untuk mendapatkan semua emergency
const fetchAllEmergency = async (): Promise<Emergency[]> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.get(`${API_URL}/admin/emergency`, {
      headers: getHeaders(token),
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching emergency:", error);
    throw error;
  }
};

// Export dengan nama yang konsisten
export const getEmergency = fetchAllEmergency;

// Fungsi untuk mendapatkan emergency alert (untuk real-time notification)
export const getEmergencyAlert = async (): Promise<EmergencyAlert> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    console.log('🔄 Fetching emergency alert from:', `${API_URL}/admin/emergency/alert`);
    
    const response = await fetch(`${API_URL}/admin/emergency/alert`, {
      method: 'GET',
      headers: getHeaders(token),
    });

    console.log('📊 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      
      if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
        throw new Error(`Endpoint returns HTML page (status: ${response.status}). The /admin/emergency/alert endpoint might not exist in the backend.`);
      } else {
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const responseText = await response.text();
      throw new Error(`Expected JSON response but got ${contentType}: ${responseText.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('📦 Emergency alert response:', data);
    return data;
    
  } catch (error) {
    console.error("Error fetching emergency alert:", error);
    throw error;
  }
};

// Debug function untuk test emergency alert system
export const debugEmergencyAlert = async (): Promise<void> => {
  console.log('🐛 DEBUG: Testing emergency alert system...');
  
  try {
    const token = getToken();
    console.log('🔍 Token available:', !!token);
    
    if (!token) {
      console.log('❌ No admin token found');
      return;
    }

    // Test 0: Check endpoints availability
    console.log('🧪 Test 0: Checking endpoints availability...');
    await checkEmergencyEndpoints();

    // Test 1: Check if we can fetch all emergencies
    console.log('🧪 Test 1: Fetching all emergencies...');
    const allEmergencies = await getEmergency();
    console.log('📊 All emergencies count:', allEmergencies.length);
    console.log('📊 Recent emergencies:', allEmergencies.slice(0, 3));

    // Test 2: Check emergency alert endpoint
    console.log('🧪 Test 2: Checking emergency alert endpoint...');
    const alertData = await getEmergencyAlert();
    console.log('🚨 Alert data:', alertData);
    console.log('🚨 Has alert:', alertData.hasAlert);
    console.log('🚨 Emergency data:', alertData.data);

  } catch (error) {
    console.error('💥 Debug error:', error);
  }
};

// Fungsi untuk update emergency
export const updateEmergency = async (id: string, data: { kategori: string; detail_kejadian: string; status?: string }): Promise<Emergency> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.put(`${API_URL}/admin/emergency/${id}`, data, {
      headers: getHeaders(token),
    });
    return response.data.data;
  } catch (error) {
    console.error("Error updating emergency:", error);
    throw error;
  }
};

// Fungsi untuk delete emergency
export const deleteEmergency = async (id: string): Promise<void> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    await axios.delete(`${API_URL}/admin/emergency/${id}`, {
      headers: getHeaders(token),
    });
  } catch (error) {
    console.error("Error deleting emergency:", error);
    throw error;
  }
};

// Fungsi untuk menandai emergency sebagai ditindaklanjuti
export const markEmergencyAsHandled = async (id: string): Promise<Emergency> => {
  const token = getToken();
  if (!token) {
    throw new Error("Token not found");
  }

  try {
    const response = await axios.put(`${API_URL}/admin/emergency/${id}/handle`, {}, {
      headers: getHeaders(token),
    });
    return response.data.data;
  } catch (error) {
    console.error("Error marking emergency as handled:", error);
    throw error;
  }
};
