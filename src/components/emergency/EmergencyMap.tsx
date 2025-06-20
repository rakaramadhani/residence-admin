"use client"

import { useEffect, useRef, useState } from 'react'

interface EmergencyMapProps {
  latitude: number
  longitude: number
  className?: string
}

// Import type untuk Leaflet
type LeafletMap = import('leaflet').Map

// Simple map fallback yang elegan
const MapFallback: React.FC<{ 
  latitude: number
  longitude: number 
  className?: string
  reason?: string 
}> = ({ latitude, longitude, className, reason }) => (
  <div className={`${className} flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-gray-700 border-2 border-blue-200`}>
    <div className="text-center p-4">
      <div className="text-3xl mb-3">📍</div>
      <div className="text-sm font-semibold mb-2">Lokasi Emergency</div>
      <div className="text-xs mb-3 space-y-1">
        <div><span className="font-medium">Latitude:</span> {latitude.toFixed(6)}</div>
        <div><span className="font-medium">Longitude:</span> {longitude.toFixed(6)}</div>
      </div>
      {reason && (
        <div className="text-xs text-gray-500 mb-3 italic">{reason}</div>
      )}
      <div className="space-y-2">
        <button
          onClick={() => {
            const url = `https://www.google.com/maps?q=${latitude},${longitude}&zoom=15`
            window.open(url, '_blank')
          }}
          className="w-full px-4 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
        >
          🗺️ Google Maps
        </button>
        <button
          onClick={() => {
            const url = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`
            window.open(url, '_blank')
          }}
          className="w-full px-4 py-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors shadow-sm"
        >
          🌍 OpenStreetMap
        </button>
      </div>
    </div>
  </div>
)

// Main Emergency Map Component
const EmergencyMap: React.FC<EmergencyMapProps> = ({ 
  latitude, 
  longitude, 
  className = "h-64 w-full rounded-lg border" 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Generate unique container ID berdasarkan koordinat
  const containerId = `emergency-map-${Math.abs(Math.round(latitude * 1000000))}-${Math.abs(Math.round(longitude * 1000000))}`

  useEffect(() => {
    let mounted = true

    const initializeMap = async () => {
      // Validasi koordinat
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        console.error('Invalid coordinates:', { latitude, longitude })
        setHasError(true)
        return
      }

      // Validasi range koordinat (untuk Indonesia)
      if (latitude < -12 || latitude > 8 || longitude < 95 || longitude > 142) {
        console.warn('Coordinates outside Indonesia range:', { latitude, longitude })
      }

      try {
        if (!mapContainerRef.current || hasError) return

        console.log('🗺️ Initializing map with coordinates:', { latitude, longitude })

        // Clear existing content
        mapContainerRef.current.innerHTML = ''

        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100))

        if (!mounted || !mapContainerRef.current) return

        // Dynamic import Leaflet
        const L = await import('leaflet')
        const leaflet = L.default || L

        // Fix default icon paths with proper typing
        const defaultIcon = leaflet.Icon.Default.prototype as typeof leaflet.Icon.Default.prototype & { _getIconUrl?: () => void }
        delete defaultIcon._getIconUrl
        leaflet.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        // Create map with simpler initialization
        const map = leaflet.map(mapContainerRef.current, {
          center: [latitude, longitude],
          zoom: 15,
          scrollWheelZoom: false,
          attributionControl: true,
          zoomControl: true
        })

        // Add OpenStreetMap tile layer
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map)

        // Create custom red icon for emergency
        const emergencyIcon = leaflet.icon({
          iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
              <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>
              <text x="12" y="16" text-anchor="middle" fill="white" font-size="14" font-weight="bold">!</text>
            </svg>
          `),
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        })

        // Add marker
        const marker = leaflet.marker([latitude, longitude], { icon: emergencyIcon }).addTo(map)
        
        // Add popup
        marker.bindPopup(`
          <div style="text-align: center; padding: 8px; min-width: 200px;">
            <div style="color: #dc2626; font-weight: bold; margin-bottom: 8px;">
              🚨 Emergency Location
            </div>
            <div style="font-size: 12px; color: #666;">
              <strong>Coordinates:</strong><br/>
              ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
            </div>
            <button 
              onclick="window.open('https://www.google.com/maps?q=${latitude},${longitude}', '_blank')"
              style="margin-top: 8px; padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;"
            >
              Open in Google Maps
            </button>
          </div>
        `, {
          maxWidth: 250,
          closeButton: true
        })

        // Open popup automatically
        marker.openPopup()

        // Force resize after a short delay
        setTimeout(() => {
          if (map && mounted) {
            map.invalidateSize()
            map.setView([latitude, longitude], 15)
            console.log('✅ Map initialized successfully')
          }
        }, 200)

        mapInstanceRef.current = map
        setIsMapLoaded(true)

      } catch (error) {
        console.error('💥 Error initializing map:', error)
        setHasError(true)
      }
    }

    initializeMap()

    return () => {
      mounted = false
      
      // Cleanup map instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
          console.log('🧹 Map cleaned up')
        } catch (e) {
          console.warn('Map cleanup warning:', e)
        }
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, containerId, hasError])

  // Jika ada error, tampilkan fallback
  if (hasError) {
    return (
      <MapFallback 
        latitude={latitude}
        longitude={longitude}
        className={className}
        reason="Map gagal dimuat"
      />
    )
  }

  return (
    <div className={className}>
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-200">
        
        {/* Map container */}
        <div 
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ minHeight: '200px' }}
        />

        {/* Loading overlay */}
        {!isMapLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Loading map...</div>
            </div>
          </div>
        )}

        {/* Coordinate overlay (always visible) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <div className="text-white text-xs font-mono text-center">
            📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </div>
        </div>

        {/* External link button */}
        <div 
          className="absolute top-2 right-2 bg-white/90 rounded-lg p-1 shadow-sm cursor-pointer hover:bg-white transition-colors z-[1000]"
          onClick={() => {
            const url = `https://www.google.com/maps?q=${latitude},${longitude}&zoom=15`
            window.open(url, '_blank')
          }}
          title="Buka di Google Maps"
        >
          <span className="text-xs text-gray-600">🗺️</span>
        </div>

      </div>
    </div>
  )
}

export default EmergencyMap 