"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, TestTube2 } from 'lucide-react'
import { useEmergencyAlert } from '@/contexts/EmergencyAlertContext'

export const EmergencyTestButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { showAlert } = useEmergencyAlert()

  const simulateEmergency = async () => {
    setIsLoading(true)
    
    try {
      console.log('🧪 Starting emergency test simulation...')
      
      // Simulate emergency data seperti yang akan diterima dari backend
      const mockEmergencyData = {
        id: `test-${Date.now()}`,
        userId: 'test-user-id',
        latitude: -6.2088,
        longitude: 106.8456,
        kategori: 'Kebakaran',
        detail_kejadian: 'Simulasi laporan darurat untuk testing',
        status: 'pending',
        created_at: new Date().toISOString(),
        user: {
          id: 'test-user-id',
          username: 'Test User',
          email: 'testuser@example.com',
          no_hp: '081234567890',
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
      {isLoading ? 'Mengirim...' : 'Test Emergency Alert'}
    </Button>
  )
} 