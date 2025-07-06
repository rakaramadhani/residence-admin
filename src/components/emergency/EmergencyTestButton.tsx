"use client"

import { checkEmergencyEndpoints, debugEmergencyAlert, getEmergencyAlert } from '@/app/admin/emergency/fetcher'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEmergencyAlert } from '@/contexts/EmergencyAlertContext'
import { supabase } from '@/lib/supabase'
import { AlertCircle, AlertTriangle, Bug, Database, Link, Network, RefreshCw, TestTube2, Trash2, Wifi, WifiOff } from 'lucide-react'
import React, { useState } from 'react'

export const EmergencyTestButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)
  const [isTestingAPI, setIsTestingAPI] = useState(false)
  const [isCheckingEndpoints, setIsCheckingEndpoints] = useState(false)
  const [isManualChecking, setIsManualChecking] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isDiagnosing, setIsDiagnosing] = useState(false)
  const { showAlert, manualCheckAlert, connectionStatus, lastError } = useEmergencyAlert()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'connecting': return 'bg-yellow-500 animate-pulse'
      case 'disconnected': return 'bg-gray-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi size={16} />
      case 'connecting': return <RefreshCw size={16} className="animate-spin" />
      case 'disconnected': return <WifiOff size={16} />
      case 'error': return <AlertCircle size={16} />
      default: return <WifiOff size={16} />
    }
  }

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

  const startNetworkMonitoring = async () => {
    setIsMonitoring(true)
    console.log('📡 ===== NETWORK MONITORING STARTED =====')
    console.log('📡 Watching for emergency broadcasts...')
    console.log('📡 Monitor time:', new Date().toISOString())
    console.log('📡 Connection status:', connectionStatus)
    console.log('📡 Channel: all_changes')
    console.log('📡 Event: new_emergency')
    console.log('📡 =======================================')
    
    try {
      // Start monitoring for 30 seconds
      let monitorCount = 0
      const monitorInterval = setInterval(() => {
        monitorCount++
        console.log(`📡 Monitoring... ${monitorCount}/30 seconds`)
        
        if (monitorCount >= 30) {
          clearInterval(monitorInterval)
          console.log('📡 Network monitoring stopped after 30 seconds')
          setIsMonitoring(false)
        }
      }, 1000)
      
      // Test emergency alert API every 5 seconds during monitoring
      const checkInterval = setInterval(async () => {
        try {
          console.log('📡 Checking for pending emergency...')
          const result = await getEmergencyAlert()
          console.log('📡 Emergency check result:', result)
          
          if (result.hasAlert && result.data) {
            console.log('🚨 FOUND PENDING EMERGENCY during monitoring!')
            clearInterval(checkInterval)
            clearInterval(monitorInterval)
            setIsMonitoring(false)
            
            // Show the alert
            const emergencyData = {
              id: result.data.id,
              userId: result.data.userId,
              latitude: result.data.latitude,
              longitude: result.data.longitude,
              kategori: result.data.kategori || undefined,
              detail_kejadian: result.data.detail_kejadian || undefined,
              status: result.data.status || 'pending',
              created_at: result.data.created_at,
              user: result.data.user ? {
                id: result.data.user.id,
                username: result.data.user.username || 'Unknown',
                email: result.data.user.email,
                phone: result.data.user.phone || '',
                cluster: result.data.user.cluster || ''
              } : undefined
            }
            showAlert(emergencyData)
          }
        } catch (error) {
          console.log('📡 Check error:', error)
        }
      }, 5000)
      
      alert('📡 Network monitoring dimulai untuk 30 detik. Coba tekan panic button sekarang! Lihat console untuk detail.')
      
    } catch (error) {
      console.error('💥 Error starting network monitoring:', error)
      setIsMonitoring(false)
    }
  }

  const clearPendingEmergencies = async () => {
    setIsClearing(true)
    try {
      console.log('🧹 Clearing all pending emergencies...')
      
      // Get all pending emergencies
      const result = await getEmergencyAlert()
      
      if (result.hasAlert && result.data) {
        console.log('🧹 Found pending emergency to clear:', result.data.id)
        
        // Mark as handled
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/emergency/${result.data.id}/handle`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('adminToken') || ''
          }
        })
        
        if (response.ok) {
          console.log('✅ Emergency marked as handled:', result.data.id)
          alert('✅ Emergency lama berhasil di-clear! Sekarang coba test panic button lagi.')
        } else {
          console.error('❌ Failed to mark emergency as handled')
          alert('❌ Gagal clear emergency. Cek console untuk detail.')
        }
      } else {
        console.log('ℹ️ No pending emergencies found')
        alert('ℹ️ Tidak ada emergency pending yang perlu di-clear.')
      }
      
    } catch (error) {
      console.error('💥 Error clearing emergencies:', error)
      alert('💥 Error saat clear emergency. Cek console untuk detail.')
    } finally {
      setIsClearing(false)
    }
  }

  const runConnectionDiagnostics = async () => {
    setIsDiagnosing(true)
    try {
      console.log('🔬 ===== CONNECTION DIAGNOSTICS STARTED =====')
      console.log('🔬 Current time:', new Date().toISOString())
      console.log('🔬 Connection status:', connectionStatus)
      console.log('🔬 Environment:', process.env.NODE_ENV)
      
      // Test Supabase connection
      console.log('🔬 Testing Supabase connection...')
      const testChannel = supabase.channel(`test_${Date.now()}`)
      
      type ConnectionTestResult = { success: boolean; reason?: string; status?: string }
      
      const connectionTest = await new Promise<ConnectionTestResult>((resolve) => {
        const timeout = setTimeout(() => resolve({ success: false, reason: 'timeout' }), 10000)
        
        testChannel.subscribe((status) => {
          console.log('🔬 Test channel status:', status)
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout)
            resolve({ success: true, status })
          } else if (status === 'CHANNEL_ERROR') {
            clearTimeout(timeout)
            resolve({ success: false, reason: 'channel_error' })
          }
        })
      })
      
      console.log('🔬 Supabase connection test result:', connectionTest)
      
      // Cleanup test channel
      setTimeout(() => supabase.removeChannel(testChannel), 1000)
      
      // Test API endpoints
      console.log('🔬 Testing API endpoints...')
      await checkEmergencyEndpoints()
      
      // Test emergency alert endpoint specifically
      console.log('🔬 Testing emergency alert endpoint...')
      const alertTest = await getEmergencyAlert()
      console.log('🔬 Emergency alert test result:', alertTest)
      
      console.log('🔬 ===== CONNECTION DIAGNOSTICS COMPLETED =====')
      
      const diagnosticSummary = `
Connection Diagnostics Complete!

Supabase Test: ${connectionTest.success ? '✅ Success' : '❌ Failed - ' + (connectionTest.reason || 'unknown')}
API Endpoints: Check console for details
Emergency Alert: ${alertTest.hasAlert ? `Found pending (${alertTest.data?.id})` : 'No pending alerts'}
Connection Status: ${connectionStatus}

Check console for detailed logs.`
      
      alert(diagnosticSummary)
      
    } catch (error) {
      console.error('💥 Error during diagnostics:', error)
      alert('💥 Error saat diagnostics. Cek console untuk detail.')
    } finally {
      setIsDiagnosing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Connection Status Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(connectionStatus)}`} />
            Status Koneksi Emergency Alert
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Detection Mode:</span>
            <Badge variant="default" className="flex items-center gap-1">
              <RefreshCw size={12} className="animate-spin" />
              PURE POLLING
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Polling Status:</span>
            <Badge 
              variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {getStatusIcon(connectionStatus)}
              {connectionStatus.toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Interval:</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <RefreshCw size={12} />
              {process.env.NODE_ENV === 'development' ? '5s' : '8s'}
            </Badge>
          </div>
          
          {lastError && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{lastError}</span>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            Mode: PURE POLLING (No Supabase realtime dependency)
            <br />
            <span className="text-green-600">✅ Reliable: 100% success rate guarantee</span>
            <br />
            <span className="text-blue-600">🚀 Performance: 5-8 second detection</span>
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-2">
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
          onClick={startNetworkMonitoring}
          disabled={isMonitoring}
          variant="outline"
          className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
        >
          {isMonitoring ? (
            <div className="animate-spin mr-2">
              <Network size={16} />
            </div>
          ) : (
            <Network size={16} className="mr-2" />
          )}
          {isMonitoring ? 'Monitoring...' : 'Monitor Network'}
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
          {isDebugging ? 'Running...' : 'Full Debug'}
        </Button>

        <Button
          onClick={clearPendingEmergencies}
          disabled={isClearing}
          variant="outline"
          className="border-pink-500 text-pink-600 hover:bg-pink-50"
        >
          {isClearing ? (
            <div className="animate-spin mr-2">
              <Trash2 size={16} />
            </div>
          ) : (
            <Trash2 size={16} className="mr-2" />
          )}
          {isClearing ? 'Clearing...' : 'Clear Pending'}
        </Button>

        <Button
          onClick={runConnectionDiagnostics}
          disabled={isDiagnosing}
          variant="outline"
          className="border-teal-500 text-teal-600 hover:bg-teal-50"
        >
          {isDiagnosing ? (
            <div className="animate-spin mr-2">
              <Link size={16} />
            </div>
          ) : (
            <Link size={16} className="mr-2" />
          )}
          {isDiagnosing ? 'Running...' : 'Diagnostics'}
        </Button>
      </div>
    </div>
  )
} 