"use client"

import { markEmergencyAsHandled } from '@/app/admin/emergency/fetcher'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEmergencyAlert } from '@/contexts/EmergencyAlertContext'
import { AlertTriangle, Clock, Home, MapPin, Phone, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { useState } from 'react'
import { EmergencyAlertSound } from './EmergencyAlertSound'

// Dynamic import untuk EmergencyMap agar tidak ada SSR issues
const EmergencyMap = dynamic(() => import('./EmergencyMap'), { ssr: false })

// Error Boundary untuk Map
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (error.message?.includes('Map container is already initialized')) {
      console.warn('Map container conflict detected, using fallback');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export const EmergencyAlertModal: React.FC = () => {
  const { isAlertOpen, emergencyData, hideAlert } = useEmergencyAlert()
  const [isHandling, setIsHandling] = useState(false)

  console.log('🚨 EmergencyAlertModal render:', { 
    isAlertOpen, 
    hasEmergencyData: !!emergencyData,
    emergencyDataId: emergencyData?.id 
  })

  if (!isAlertOpen || !emergencyData) {
    console.log('🚨 Modal not showing - isAlertOpen:', isAlertOpen, 'emergencyData:', !!emergencyData)
    return null
  }

  console.log('🚨 Modal SHOULD BE VISIBLE - rendering modal content')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short', 
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const openGoogleMaps = () => {
    if (emergencyData.latitude && emergencyData.longitude) {
      const url = `https://www.google.com/maps?q=${emergencyData.latitude},${emergencyData.longitude}`
      window.open(url, '_blank')
    }
  }

  const handleResponseEmergency = async () => {
    try {
      setIsHandling(true)
      
      // Panggil API untuk menandai emergency sebagai ditindaklanjuti
      await markEmergencyAsHandled(emergencyData.id)
      
      // Tutup modal
      hideAlert()
      
      // Navigasi ke halaman emergency
      window.location.href = `/admin/emergency`
      
    } catch (error) {
      console.error('Error handling emergency:', error)
      alert('Gagal menandai emergency sebagai ditindaklanjuti. Silakan coba lagi.')
    } finally {
      setIsHandling(false)
    }
  }

  // Fallback component untuk map
  const MapFallback = () => (
    <div className="h-36 sm:h-48 w-full flex flex-col items-center justify-center bg-gray-100 text-gray-600 rounded-lg">
      <div className="text-center">
        <div className="text-2xl mb-2">📍</div>
        <div className="text-sm font-medium">Lokasi Emergency</div>
        <div className="text-xs mt-1">
          Lat: {emergencyData?.latitude?.toFixed(6) || 'N/A'}
          <br />
          Lng: {emergencyData?.longitude?.toFixed(6) || 'N/A'}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={openGoogleMaps}
          className="mt-2 text-xs"
        >
          Buka Google Maps
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Emergency Alert Sound */}
      <EmergencyAlertSound />
      
      {/* Enhanced Backdrop with consistent blur */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
      
      {/* Modal with consistent rounded corners */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-lg mx-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-500 max-h-[95vh] overflow-y-auto rounded-xl overflow-hidden">
          
          {/* Emergency Header - Keep the unique emergency styling */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white relative rounded-t-xl">
            <Button
              variant="ghost"
              size="sm"
              onClick={hideAlert}
              className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 h-8 w-8"
            >
              <X size={16} />
            </Button>
            
            <div className="flex flex-col items-center justify-center text-center py-5 px-4">
              {/* Emergency icon */}
              <div className="bg-white/20 p-2.5 rounded-full mb-3 border border-white/30">
                <AlertTriangle className="text-white" size={20} />
              </div>
              
              <div className="text-base font-bold leading-tight mb-2">
                🚨 EMERGENCY ALERT
              </div>
              
              <div className="flex items-center justify-center text-red-100 text-xs mb-2">
                <Clock className="mr-1.5" size={12} />
                <span>{formatDate(emergencyData.created_at)}</span>
              </div>
              
              {/* Status Badge */}
              <Badge className="bg-white/20 text-white border-white/30 text-xs px-2.5 py-0.5">
                {emergencyData.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-6 space-y-5 rounded-b-xl">
            
            {/* Emergency Alert Message */}
            {emergencyData.user && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-4 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg shrink-0">
                    <AlertTriangle className="text-orange-600" size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
                      {emergencyData.user.username} membutuhkan bantuan darurat!
                    </h3>
                    <div className="flex items-center mt-1 text-xs sm:text-sm text-gray-600">
                      <Home className="mr-1" size={14} />
                      Cluster {emergencyData.user.cluster}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Location Section */}
            {emergencyData.latitude && emergencyData.longitude && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <div className="bg-blue-100 p-1.5 rounded-lg mr-2">
                      <MapPin className="text-blue-600" size={16} />
                    </div>
                    Lokasi Emergency
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openGoogleMaps}
                    className="text-xs px-3 py-1.5 h-auto border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Buka Maps
                  </Button>
                </div>
                
                {/* Mini Map with Error Boundary */}
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                  <MapErrorBoundary fallback={<MapFallback />}>
                    <EmergencyMap 
                      latitude={emergencyData.latitude} 
                      longitude={emergencyData.longitude}
                      className="h-36 sm:h-48 w-full"
                      key={`alert-map-${emergencyData.id}-${Date.now()}`}
                    />
                  </MapErrorBoundary>
                  {/* Overlay with coordinates */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <div className="text-white text-xs font-mono text-center">
                      📍 {emergencyData.latitude.toFixed(4)}, {emergencyData.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={hideAlert}
                  className="h-11 text-sm font-medium"
                  disabled={isHandling}
                >
                  Tutup
                </Button>
                <Button
                  onClick={handleResponseEmergency}
                  className="h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium"
                  disabled={isHandling}
                >
                  {isHandling ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Proses...
                    </div>
                  ) : (
                    'Respon Darurat'
                  )}
                </Button>
              </div>

              {/* Call Button */}
              {emergencyData.user?.phone && (
                <Button
                  variant="outline"
                  className="w-full h-11 border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 text-sm font-medium"
                  onClick={() => window.open(`tel:${emergencyData.user?.phone}`, '_blank')}
                >
                  <div className="flex items-center">
                    <div className="bg-green-100 p-1.5 rounded-lg mr-2">
                      <Phone size={16} className="text-green-600" />
                    </div>
                    Hubungi {emergencyData.user.phone}
                  </div>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 