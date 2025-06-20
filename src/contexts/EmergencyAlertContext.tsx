"use client"

import { supabase } from '@/lib/supabase';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

// Utility function untuk get token - sama seperti di fetcher.ts
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("adminToken") : null);

export interface EmergencyData {
  id: string
  userId: string
  latitude?: number
  longitude?: number
  kategori?: string
  detail_kejadian?: string
  status: string
  created_at: string
  user?: {
    id: string
    username: string
    email: string
    phone: string
    cluster: string
  }
}

interface EmergencyAlertContextType {
  isAlertOpen: boolean
  emergencyData: EmergencyData | null
  showAlert: (data: EmergencyData) => void
  hideAlert: () => void
  clearEmergencyHistory: () => void
  manualCheckAlert: () => void
}

const EmergencyAlertContext = createContext<EmergencyAlertContextType | undefined>(undefined)

export const useEmergencyAlert = () => {
  const context = useContext(EmergencyAlertContext)
  if (context === undefined) {
    throw new Error('useEmergencyAlert must be used within an EmergencyAlertProvider')
  }
  return context
}

interface EmergencyAlertProviderProps {
  children: ReactNode
}

export const EmergencyAlertProvider: React.FC<EmergencyAlertProviderProps> = ({ children }) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [emergencyData, setEmergencyData] = useState<EmergencyData | null>(null)
  const [shownEmergencyIds, setShownEmergencyIds] = useState<Set<string>>(new Set())

  const showAlert = (data: EmergencyData) => {
    if (shownEmergencyIds.has(data.id)) {
      console.log('⚠️ Emergency already shown, skipping:', data.id)
      return
    }

    console.log('🚨 Showing new emergency alert:', data.id)
    setEmergencyData(data)
    setIsAlertOpen(true)
    
    setShownEmergencyIds(prev => new Set([...prev, data.id]))
  }

  const hideAlert = () => {
    setIsAlertOpen(false)
    setEmergencyData(null)
  }

  const clearEmergencyHistory = () => {
    console.log('🧹 Clearing emergency history...')
    setShownEmergencyIds(new Set())
  }

  // Fungsi untuk mengambil detail emergency dengan user data
  const fetchEmergencyDetails = useCallback(async () => {
    try {
      console.log('🔄 Fetching emergency details from API...')
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/emergency/alert`
      console.log('🔗 API URL:', apiUrl)
      
      // Ambil token dari localStorage
      const token = getToken()
      console.log('🔍 Token found:', !!token)
      
      if (!token) {
        console.log('❌ No admin token found, cannot fetch emergency details')
        return
      }
      
              const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      
      console.log('🔐 Request headers:', headers)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      })
      
      console.log('📡 API Response status:', response.status)
      console.log('📡 API Response status text:', response.statusText)
      console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))
      
      // Cek content type sebelum parsing JSON
      const contentType = response.headers.get('content-type')
      console.log('📋 Response content-type:', contentType)
      
      if (!response.ok) {
        // Jika tidak OK, coba baca sebagai text dulu untuk debugging
        const errorText = await response.text()
        console.log('❌ Error response text:', errorText)
        
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
          console.log('❌ Server returned HTML page instead of JSON')
          console.log('❌ This usually means:')
          console.log('   - Endpoint does not exist (404)')
          console.log('   - Authentication failed (redirect to login)')
          console.log('   - Server error (500 error page)')
          
          if (response.status === 404) {
            console.log('❌ 404: Emergency alert endpoint not found')
          } else if (response.status === 401 || response.status === 403) {
            console.log('❌ Auth error: Admin not authorized')
          } else {
            console.log('❌ Server error:', response.status)
          }
        }
        return
      }
      
      // Pastikan response adalah JSON
      if (!contentType?.includes('application/json')) {
        const responseText = await response.text()
        console.log('❌ Non-JSON response received:', responseText)
        return
      }
      
      const result = await response.json()
      console.log('📦 API Response data:', result)
      
      if (result.data && result.hasAlert) {
        console.log('🚨 Showing emergency alert modal...')
        console.log('🚨 Emergency data to show:', result.data)
        showAlert(result.data)
      } else {
        console.log('ℹ️ No pending emergency alert found')
        console.log('ℹ️ Result data:', result.data)
        console.log('ℹ️ Result hasAlert:', result.hasAlert)
      }
      
    } catch (error) {
      console.error('💥 Error fetching emergency details:', error)
      
      // Enhanced error logging
      if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
        console.error('💥 JSON Parse Error - Server returned HTML instead of JSON')
        console.error('💥 This means the API endpoint is returning an error page')
        console.error('💥 Check if the endpoint exists and authentication is working')
      } else {
        console.error('💥 Error stack:', (error as Error)?.stack)
      }
    }
  }, [])

  // Manual check function untuk debugging
  const manualCheckAlert = async () => {
    console.log('🔍 Manual check alert triggered...')
    await fetchEmergencyDetails()
  }

  useEffect(() => {
    console.log('🚨 Setting up Supabase realtime subscription for emergency alerts...')
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔗 API URL:', process.env.NEXT_PUBLIC_API_URL)
    
    // Listen untuk broadcast event dari backend - menggunakan channel yang sama dengan backend
    const channel = supabase.channel('all_changes')
      .on('broadcast', { event: 'new_emergency' }, (payload) => {
        console.log('🔥 ===== EMERGENCY BROADCAST RECEIVED =====')
        console.log('🔥 Event timestamp:', new Date().toISOString())
        console.log('🔥 Payload received:', payload)
        console.log('🔥 Payload detail:', JSON.stringify(payload, null, 2))
        console.log('🔥 =========================================')
        
        if (payload.payload) {
          console.log('✅ Valid payload detected, fetching emergency details...')
          // Ambil detail lengkap emergency dengan user data
          fetchEmergencyDetails()
        } else {
          console.log('❌ No payload in broadcast event')
          // Tetap coba fetch untuk jaga-jaga
          console.log('🔄 Trying to fetch anyway...')
          fetchEmergencyDetails()
        }
      })
      .subscribe((status) => {
        console.log('📡 Emergency subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to emergency alerts')
          console.log('🎧 Listening for broadcast on channel: all_changes')
          console.log('🎧 Event name: new_emergency')
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Channel subscription error')
        } else if (status === 'TIMED_OUT') {
          console.log('⏰ Channel subscription timed out')
        }
      })

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up emergency subscription...')
      supabase.removeChannel(channel)
    }
  }, [fetchEmergencyDetails])

  const value: EmergencyAlertContextType = {
    isAlertOpen,
    emergencyData,
    showAlert,
    hideAlert,
    clearEmergencyHistory,
    manualCheckAlert,
  }

  return (
    <EmergencyAlertContext.Provider value={value}>
      {children}
    </EmergencyAlertContext.Provider>
  )
} 