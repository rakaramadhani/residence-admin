"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

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

  useEffect(() => {
    console.log('🚨 Setting up Supabase realtime subscription for emergency alerts...')
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔗 API URL:', process.env.NEXT_PUBLIC_API_URL)
    
    // Listen untuk broadcast event dari backend - menggunakan channel yang sama dengan backend
    const channel = supabase.channel('all_changes')
      .on('broadcast', { event: 'new_emergency' }, (payload) => {
        console.log('🔥 Emergency alert received via broadcast:', payload)
        console.log('🔥 Payload detail:', JSON.stringify(payload, null, 2))
        
        if (payload.payload) {
          console.log('✅ Valid payload detected, fetching emergency details...')
          // Ambil detail lengkap emergency dengan user data
          fetchEmergencyDetails()
        } else {
          console.log('❌ No payload in broadcast event')
        }
      })
      .subscribe((status) => {
        console.log('📡 Emergency subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to emergency alerts')
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Channel subscription error')
        } else if (status === 'TIMED_OUT') {
          console.log('⏰ Channel subscription timed out')
        }
      })

    // Fungsi untuk mengambil detail emergency dengan user data
    const fetchEmergencyDetails = async () => {
      try {
        console.log('🔄 Fetching emergency details from API...')
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/emergency/alert`
        console.log('🔗 API URL:', apiUrl)
        
        // Ambil token dari localStorage atau sessionStorage - gunakan nama yang sama seperti fetcher lain
        const token = getToken()
        console.log('🔍 Token found:', !!token)
        console.log('🔍 Token value:', token ? `${token.substring(0, 20)}...` : 'null')
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        
        // Tambahkan Authorization header jika ada token
        if (token) {
          headers['Authorization'] = `${token}`
          console.log('🔐 Adding auth token to request')
          console.log('🔐 Authorization header:', headers['Authorization'])
        } else {
          console.log('⚠️ No auth token found')
        }
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers,
        })
        
        console.log('📡 API Response status:', response.status)
        console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
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
        } else {
          const errorText = await response.text()
          console.log('❌ API Response error:', response.statusText)
          console.log('❌ Error details:', errorText)
          
          if (response.status === 401 || response.status === 403) {
            console.log('🔐 Authentication error - admin might not be logged in')
          }
        }
      } catch (error) {
        console.error('💥 Error fetching emergency details:', error)
        console.error('💥 Error stack:', (error as Error)?.stack)
      }
    }

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up emergency subscription...')
      supabase.removeChannel(channel)
    }
  }, [])

  const value: EmergencyAlertContextType = {
    isAlertOpen,
    emergencyData,
    showAlert,
    hideAlert,
    clearEmergencyHistory,
  }

  return (
    <EmergencyAlertContext.Provider value={value}>
      {children}
    </EmergencyAlertContext.Provider>
  )
} 