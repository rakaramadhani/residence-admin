"use client"

import { AlertTriangle, Clock, MapPin, Phone, User, X } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEmergencyAlert } from '@/contexts/EmergencyAlertContext'




export const EmergencyAlertModal: React.FC = () => {
  const { isAlertOpen, emergencyData, hideAlert } = useEmergencyAlert()

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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  const handleResponseEmergency = () => {
    // Navigasi ke halaman emergency detail atau langsung ke halaman emergency
    window.location.href = `/admin/emergency`
    hideAlert()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md mx-auto bg-white shadow-2xl border-2 border-red-200 animate-in slide-in-from-top-4 duration-300">
          <CardHeader className="bg-red-500 text-white rounded-t-lg relative">
            <button
              onClick={hideAlert}
              className="absolute top-4 right-4 text-white hover:text-red-200 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">
                  🚨 PERINGATAN DARURAT
                </CardTitle>
                <p className="text-red-100 text-sm">
                  Laporan darurat baru masuk
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge variant="destructive" className="px-3 py-1 text-sm font-medium">
                STATUS: {emergencyData.status.toUpperCase()}
              </Badge>
            </div>

            {/* User Information */}
            {emergencyData.user && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-gray-800 flex items-center">
                  <User className="mr-2" size={16} />
                  Informasi Penghuni
                </h4>
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <p><span className="font-medium">Nama:</span> {emergencyData.user.username}</p>
                  <p><span className="font-medium">Email:</span> {emergencyData.user.email}</p>
                  <p><span className="font-medium">No. HP:</span> {emergencyData.user.phone}</p>
                  <p><span className="font-medium">Cluster:</span> {emergencyData.user.cluster}</p>
                </div>
              </div>
            )}

            {/* Emergency Details */}
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-2" size={16} />
                <span>Waktu: {formatDate(emergencyData.created_at)}</span>
              </div>

              {emergencyData.latitude && emergencyData.longitude && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-2" size={16} />
                    <span>Lokasi tersedia</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openGoogleMaps}
                    className="text-xs"
                  >
                    Lihat Peta
                  </Button>
                </div>
              )}

              {emergencyData.kategori && (
                <div className="text-sm">
                  <span className="font-medium">Kategori:</span> {emergencyData.kategori}
                </div>
              )}

              {emergencyData.detail_kejadian && (
                <div className="text-sm">
                  <span className="font-medium">Detail:</span> {emergencyData.detail_kejadian}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={hideAlert}
                className="flex-1"
              >
                Tutup
              </Button>
              <Button
                onClick={handleResponseEmergency}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                Respon Darurat
              </Button>
            </div>

            {/* Call Button */}
            {emergencyData.user?.phone && (
              <Button
                variant="outline"
                className="w-full border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => window.open(`tel:${emergencyData.user?.phone}`, '_blank')}
              >
                <Phone className="mr-2" size={16} />
                Hubungi {emergencyData.user.phone}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
} 