"use client"

import { checkEmergencyEndpoints, debugEmergencyAlert, getEmergencyAlert } from '@/app/admin/emergency/fetcher'
import { Button } from '@/components/ui/button'
import { useEmergencyAlert } from '@/contexts/EmergencyAlertContext'
import { AlertTriangle, Bug, Database, Link, RefreshCw, TestTube2 } from 'lucide-react'
import React, { useState } from 'react'

export const EmergencyTestButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)
  const [isTestingAPI, setIsTestingAPI] = useState(false)
  const [isCheckingEndpoints, setIsCheckingEndpoints] = useState(false)
  const [isManualChecking, setIsManualChecking] = useState(false)
  const { showAlert, manualCheckAlert } = useEmergencyAlert()

  const simulateEmergency = async () => {
    setIsLoading(true)
    
    try {
      console.log('🧪 Starting emergency test simulation...')
      
      // Generate unique ID untuk setiap test
      const uniqueId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Simulate emergency data seperti yang akan diterima dari backend
      const mockEmergencyData = {
        id: uniqueId,
        userId: 'test-user-id',
        latitude: -6.2088 + (Math.random() - 0.5) * 0.01, // Random location nearby
        longitude: 106.8456 + (Math.random() - 0.5) * 0.01,
        kategori: 'Kebakaran',
        detail_kejadian: 'Simulasi laporan darurat untuk testing sistem alert',
        status: 'pending',
        created_at: new Date().toISOString(),
        user: {
          id: 'test-user-id',
          username: 'Test User',
          email: 'testuser@example.com',
          phone: '081234567890',
          cluster: 'Cluster A'
        }
      }

      console.log('🧪 Mock emergency data:', mockEmergencyData)

      // Delay untuk simulasi
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('🧪 Calling showAlert function...')
      // Show alert
      showAlert(mockEmergencyData)
      console.log('🧪 showAlert called successfully')
      
    } catch (error) {
      console.error('💥 Error simulating emergency:', error)
      alert('Error saat simulasi emergency. Cek console untuk detail.')
    } finally {
      setIsLoading(false)
    }
  }

  const runDebugTests = async () => {
    setIsDebugging(true)
    try {
      console.log('🐛 Running comprehensive debug tests...')
      await debugEmergencyAlert()
      alert('Debug tests selesai! Cek console untuk detail hasil.')
    } catch (error) {
      console.error('💥 Error during debug:', error)
      alert('Error saat debug. Cek console untuk detail.')
    } finally {
      setIsDebugging(false)
    }
  }

  const testEmergencyAlert = async () => {
    setIsTestingAPI(true)
    try {
      console.log('🔬 Testing emergency alert API directly...')
      const alertData = await getEmergencyAlert()
      console.log('🔬 API Response:', alertData)
      
      if (alertData.hasAlert && alertData.data) {
        console.log('✅ Found pending emergency alert!')
        // Create compatible emergency data
        const emergencyData = {
          id: alertData.data.id,
          userId: alertData.data.userId,
          latitude: alertData.data.latitude,
          longitude: alertData.data.longitude,
          kategori: alertData.data.kategori || undefined,
          detail_kejadian: alertData.data.detail_kejadian || undefined,
          status: alertData.data.status || 'pending',
          created_at: alertData.data.created_at,
          user: alertData.data.user ? {
            id: alertData.data.user.id,
            username: alertData.data.user.username || 'Unknown',
            email: alertData.data.user.email,
            phone: alertData.data.user.phone || '',
            cluster: alertData.data.user.cluster || ''
          } : undefined
        }
        showAlert(emergencyData)
        alert('Emergency alert ditemukan dan ditampilkan!')
      } else {
        console.log('ℹ️ No pending emergency alert found')
        alert('Tidak ada emergency alert yang pending saat ini.')
      }
    } catch (error) {
      console.error('💥 Error testing emergency alert API:', error)
      alert(`Error saat test API: ${error}`)
    } finally {
      setIsTestingAPI(false)
    }
  }

  const checkEndpoints = async () => {
    setIsCheckingEndpoints(true)
    try {
      console.log('🔍 Checking emergency endpoints...')
      await checkEmergencyEndpoints()
      alert('Endpoint check selesai! Cek console untuk detail hasil.')
    } catch (error) {
      console.error('💥 Error checking endpoints:', error)
      alert('Error saat check endpoints. Cek console untuk detail.')
    } finally {
      setIsCheckingEndpoints(false)
    }
  }

  const handleManualCheck = async () => {
    setIsManualChecking(true)
    try {
      console.log('🔍 Manual check for pending emergency...')
      await manualCheckAlert()
      alert('Manual check selesai! Cek console untuk detail hasil.')
    } catch (error) {
      console.error('💥 Error during manual check:', error)
      alert('Error saat manual check. Cek console untuk detail.')
    } finally {
      setIsManualChecking(false)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
      <Button
        onClick={simulateEmergency}
        disabled={isLoading}
        variant="outline"
        className="border-orange-500 text-orange-600 hover:bg-orange-50"
      >
        {isLoading ? (
          <div className="animate-spin mr-2">
            <TestTube2 size={16} />
          </div>
        ) : (
          <AlertTriangle size={16} className="mr-2" />
        )}
        {isLoading ? 'Mengirim...' : 'Test Emergency'}
      </Button>

      <Button
        onClick={testEmergencyAlert}
        disabled={isTestingAPI}
        variant="outline"
        className="border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        {isTestingAPI ? (
          <div className="animate-spin mr-2">
            <Database size={16} />
          </div>
        ) : (
          <Database size={16} className="mr-2" />
        )}
        {isTestingAPI ? 'Checking...' : 'Test API'}
      </Button>

      <Button
        onClick={handleManualCheck}
        disabled={isManualChecking}
        variant="outline"
        className="border-cyan-500 text-cyan-600 hover:bg-cyan-50"
      >
        {isManualChecking ? (
          <div className="animate-spin mr-2">
            <RefreshCw size={16} />
          </div>
        ) : (
          <RefreshCw size={16} className="mr-2" />
        )}
        {isManualChecking ? 'Checking...' : 'Manual Check'}
      </Button>

      <Button
        onClick={checkEndpoints}
        disabled={isCheckingEndpoints}
        variant="outline"
        className="border-green-500 text-green-600 hover:bg-green-50"
      >
        {isCheckingEndpoints ? (
          <div className="animate-spin mr-2">
            <Link size={16} />
          </div>
        ) : (
          <Link size={16} className="mr-2" />
        )}
        {isCheckingEndpoints ? 'Checking...' : 'Check Endpoints'}
      </Button>

      <Button
        onClick={runDebugTests}
        disabled={isDebugging}
        variant="outline"
        className="border-purple-500 text-purple-600 hover:bg-purple-50"
      >
        {isDebugging ? (
          <div className="animate-spin mr-2">
            <Bug size={16} />
          </div>
        ) : (
          <Bug size={16} className="mr-2" />
        )}
        {isDebugging ? 'Debugging...' : 'Debug All'}
      </Button>
    </div>
  )
} 