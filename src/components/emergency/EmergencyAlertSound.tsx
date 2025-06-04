"use client"

import React, { useEffect, useRef } from 'react'
import { useEmergencyAlert } from '@/contexts/EmergencyAlertContext'

export const EmergencyAlertSound: React.FC = () => {
  const { isAlertOpen, emergencyData } = useEmergencyAlert()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (isAlertOpen && emergencyData) {
      // Mainkan sound alert
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          console.log('Error playing alert sound:', error)
        })
      }
    }
  }, [isAlertOpen, emergencyData])

  return (
    <audio
      ref={audioRef}
      preload="auto"
      loop
    >
      {/* Menggunakan simple beep sound untuk notification */}
      <source src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" type="audio/wav" />
    </audio>
  )
}
 