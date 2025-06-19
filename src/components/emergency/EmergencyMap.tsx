"use client"

import dynamic from 'next/dynamic'
import React from 'react'

interface EmergencyMapProps {
  latitude: number
  longitude: number
  className?: string
}

// Dynamic import untuk menghindari SSR issues dengan Leaflet
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

const EmergencyMap: React.FC<EmergencyMapProps> = ({ 
  latitude, 
  longitude, 
  className = "h-64 w-full rounded-lg border" 
}) => {
  // Import Leaflet icon fix untuk production
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet')
      
      // Fix untuk default icons Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    }
  }, [])

  const position: [number, number] = [latitude, longitude]

  return (
    <div className={className}>
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-center">
              <strong>🚨 Lokasi Emergency</strong>
              <br />
              <span className="text-sm text-gray-600">
                Lat: {latitude.toFixed(6)}
                <br />
                Lng: {longitude.toFixed(6)}
              </span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default EmergencyMap 