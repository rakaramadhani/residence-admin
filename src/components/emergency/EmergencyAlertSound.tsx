"use client"

import { useEmergencyAlert } from '@/contexts/EmergencyAlertContext'
import React, { useEffect, useRef } from 'react'

export const EmergencyAlertSound: React.FC = () => {
  const { isAlertOpen, emergencyData } = useEmergencyAlert()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playedAlerts = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (isAlertOpen && emergencyData && emergencyData.id) {
      // Cek apakah alert ini sudah pernah diputar
      if (!playedAlerts.current.has(emergencyData.id)) {
        console.log('🔊 Playing emergency alarm for:', emergencyData.id)
        
        // Tandai alert ini sebagai sudah diputar
        playedAlerts.current.add(emergencyData.id)
        
        // Mainkan sound alarm
        if (audioRef.current) {
          audioRef.current.currentTime = 0 // Reset ke awal
          audioRef.current.volume = 0.8 // Set volume 80%
          
          audioRef.current.play().catch(error => {
            console.log('Error playing emergency alarm:', error)
          })
        }
      }
    }
  }, [isAlertOpen, emergencyData])

  // Stop alarm ketika modal ditutup
  useEffect(() => {
    if (!isAlertOpen && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [isAlertOpen])

  return (
    <audio
      ref={audioRef}
      preload="auto"
      loop
    >
      {/* Menggunakan file alarm yang sudah ada */}
      <source 
        src="/audio/emergency-alarm.mp3" 
        type="audio/mpeg" 
      />
      {/* Fallback untuk browser yang tidak support mp3 */}
      <source 
        src="data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" 
        type="audio/wav" 
      />
      Your browser does not support the audio element.
    </audio>
  )
}
 