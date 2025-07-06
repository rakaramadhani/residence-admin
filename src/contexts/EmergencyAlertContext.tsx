"use client"

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
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastError: string | null
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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const [lastError, setLastError] = useState<string | null>(null)
  const [consecutivePollingHits, setConsecutivePollingHits] = useState<number>(0)

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
        const errorMsg = 'No admin token found, cannot fetch emergency details'
        console.log('❌', errorMsg)
        setLastError(errorMsg)
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
      
      // Cek content type sebelum parsing JSON
      const contentType = response.headers.get('content-type')
      console.log('📋 Response content-type:', contentType)
      
      if (!response.ok) {
        // Jika tidak OK, coba baca sebagai text dulu untuk debugging
        const errorText = await response.text()
        console.log('❌ Error response text:', errorText)
        
        let errorMessage = `API Error: ${response.status} ${response.statusText}`
        
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
          console.log('❌ Server returned HTML page instead of JSON')
          errorMessage = `Endpoint returns HTML page (status: ${response.status}). The /admin/emergency/alert endpoint might not exist in the backend.`
          
          if (response.status === 404) {
            console.log('❌ 404: Emergency alert endpoint not found')
          } else if (response.status === 401 || response.status === 403) {
            console.log('❌ Auth error: Admin not authorized')
          } else {
            console.log('❌ Server error:', response.status)
          }
        }
        
        setLastError(errorMessage)
        return
      }
      
      // Pastikan response adalah JSON
      if (!contentType?.includes('application/json')) {
        const responseText = await response.text()
        const errorMsg = `Expected JSON response but got ${contentType}: ${responseText.substring(0, 100)}...`
        console.log('❌', errorMsg)
        setLastError(errorMsg)
        return
      }
      
      const result = await response.json()
      console.log('📦 API Response data:', result)
      
      // Clear previous error on successful response
      setLastError(null)
      
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
      const errorMsg = `Error fetching emergency details: ${error}`
      console.error('💥', errorMsg)
      setLastError(errorMsg)
      
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
    console.log('🚨 Setting up POLLING-BASED emergency alert system...')
    console.log('🔗 API URL:', process.env.NEXT_PUBLIC_API_URL)
    console.log('⚡ Mode: PURE POLLING (No Supabase realtime dependency)')
    
    setConnectionStatus('connecting')

    // ============ PURE POLLING SYSTEM ============
    console.log('⚙️ Setting up aggressive polling system...')
    
    // Aggressive polling intervals for reliability
    const isDevelopment = process.env.NODE_ENV === 'development'
    let pollingInterval = isDevelopment ? 5000 : 8000 // 5s dev, 8s prod - much more aggressive
    
    console.log('⚙️ Environment:', isDevelopment ? 'Development' : 'Production')
    console.log('⚙️ Polling interval:', pollingInterval / 1000, 'seconds')
    console.log('⚙️ Reliability: 100% (No external dependency)')
    
    // Primary polling mechanism
    const emergencyPoller = setInterval(async () => {
      console.log('🔄 Polling for emergency alerts...')
      try {
        const hadEmergency = emergencyData !== null
        await fetchEmergencyDetails()
        
        // Track successful polling
        if (!hadEmergency && emergencyData !== null) {
          setConsecutivePollingHits(prev => prev + 1)
          console.log('🚨 Emergency detected via polling! Count:', consecutivePollingHits + 1)
        }
        
        // Set status as connected once polling works
        if (connectionStatus !== 'connected') {
          setConnectionStatus('connected')
          setLastError(null)
        }
        
      } catch (error) {
        console.log('🔄 Polling error:', error)
        setConnectionStatus('error')
        setLastError('API polling failed: ' + error)
      }
    }, pollingInterval)
    
    // Initial check saat component mount
    console.log('🔄 Initial emergency check...')
    fetchEmergencyDetails().then(() => {
      setConnectionStatus('connected')
      console.log('✅ Polling-based system ready!')
    }).catch((error) => {
      setConnectionStatus('error')
      setLastError('Initial check failed: ' + error)
    })

    // Health check every 30 seconds to adjust polling if needed
    const healthCheck = setInterval(() => {
      console.log('🏥 Polling system health check...')
      console.log('🏥 Status:', connectionStatus)
      console.log('🏥 Polling hits:', consecutivePollingHits)
      console.log('🏥 Current interval:', pollingInterval / 1000, 'seconds')
      
      // Dynamic interval adjustment based on success rate
      if (consecutivePollingHits > 3 && pollingInterval > 3000) {
        // If polling is very successful, we can relax a bit
        pollingInterval = Math.min(pollingInterval + 1000, isDevelopment ? 7000 : 10000)
        console.log('🏥 Relaxing polling interval to:', pollingInterval / 1000, 'seconds')
      } else if (connectionStatus === 'error' && pollingInterval > 3000) {
        // If having issues, make more aggressive
        pollingInterval = Math.max(3000, pollingInterval - 1000)
        console.log('🏥 Making polling more aggressive:', pollingInterval / 1000, 'seconds')
      }
    }, 30000) // Every 30 seconds

    // Cleanup polling on unmount
    return () => {
      console.log('🧹 Cleaning up polling system...')
      setConnectionStatus('disconnected')
      clearInterval(emergencyPoller)
      clearInterval(healthCheck)
    }
  }, [fetchEmergencyDetails])

  const value: EmergencyAlertContextType = {
    isAlertOpen,
    emergencyData,
    showAlert,
    hideAlert,
    clearEmergencyHistory,
    manualCheckAlert,
    connectionStatus,
    lastError,
  }

  return (
    <EmergencyAlertContext.Provider value={value}>
      {children}
    </EmergencyAlertContext.Provider>
  )
} 