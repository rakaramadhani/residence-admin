'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface SuratData {
  id: string
  nama: string
  nik: string
  alamat: string
  fasilitas: string
  keperluan: string
  tanggalMulai: string
  tanggalSelesai: string
  status: string
  createdAt: string
  deskripsi?: string
}

interface ValidationResponse {
  success: boolean
  message: string
  data: SuratData | null
}

export default function ValidateSuratPage() {
  const params = useParams()
  const id = params.id as string
  
  const [data, setData] = useState<SuratData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSuratData = async () => {
      try {
        // Get base URL and clean it
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://residence-api-production.up.railway.app/api'
        
        // Remove trailing slash if exists
        apiUrl = apiUrl.replace(/\/$/, '')
        
        // Construct final URL - API URL already includes /api
        const finalUrl = `${apiUrl}/validate-surat/${id}`
        console.log('Fetching from URL:', finalUrl) // Debug log
        
                  const response = await fetch(finalUrl, {
            headers: {
              "Content-Type": "application/json"
            }
          })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result: ValidationResponse = await response.json()
        
        if (result.success && result.data) {
          setData(result.data)
        } else {
          setError(result.message || 'Surat tidak ditemukan')
        }
      } catch (err) {
        setError('Terjadi kesalahan dalam memuat data surat')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchSuratData()
    }
  }, [id])

  const formatTanggal = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatWaktu = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          text: '✅ SURAT VALID & DISETUJUI',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300'
        }
      case 'rejected':
        return {
          text: '❌ PERMOHONAN DITOLAK',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300'
        }
      default:
        return {
          text: '⏳ MENUNGGU PERSETUJUAN',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300'
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data surat...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-green-700 mb-2">
                🏘️ PERUMAHAN CHERRY FIELD
              </h1>
              <p className="text-sm text-gray-600">
                Jl. Ciganitri, Desa Cipagalo, Kecamatan Bojongsoang<br />
                Kabupaten Bandung, Jawa Barat 40287
              </p>
            </div>
            
            <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
              <div className="font-bold text-lg mb-2">❌ SURAT TIDAK VALID</div>
              <div>{error || 'Surat dengan ID tersebut tidak ditemukan dalam sistem.'}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(data.status)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center">
            <h1 className="text-3xl font-bold mb-2">🏘️ PERUMAHAN CHERRY FIELD</h1>
            <p className="text-green-100 text-sm mb-4">
              Jl. Ciganitri, Desa Cipagalo, Kecamatan Bojongsoang<br />
              Kabupaten Bandung, Jawa Barat 40287
            </p>
            <h2 className="text-xl font-semibold">Validasi Surat Perizinan Fasilitas</h2>
          </div>

          {/* Status */}
          <div className="p-6">
            <div className={`${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} border px-4 py-3 rounded-lg text-center font-bold text-lg mb-6`}>
              {statusInfo.text}
            </div>

            {/* Detail Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b">
                    <td className="bg-gray-50 font-semibold py-3 px-4 w-1/3">ID Surat</td>
                    <td className="py-3 px-4">{data.id}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="bg-gray-50 font-semibold py-3 px-4">Nama Pemohon</td>
                    <td className="py-3 px-4 font-medium">{data.nama}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="bg-gray-50 font-semibold py-3 px-4">NIK</td>
                    <td className="py-3 px-4">{data.nik}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="bg-gray-50 font-semibold py-3 px-4">Alamat</td>
                    <td className="py-3 px-4">{data.alamat}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="bg-gray-50 font-semibold py-3 px-4">Fasilitas</td>
                    <td className="py-3 px-4 font-medium">{data.fasilitas}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="bg-gray-50 font-semibold py-3 px-4">Keperluan</td>
                    <td className="py-3 px-4">{data.keperluan}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="bg-gray-50 font-semibold py-3 px-4">Tanggal Penggunaan</td>
                    <td className="py-3 px-4">{formatTanggal(data.tanggalMulai)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="bg-gray-50 font-semibold py-3 px-4">Waktu</td>
                    <td className="py-3 px-4">
                      {formatWaktu(data.tanggalMulai)} - {formatWaktu(data.tanggalSelesai)} WIB
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="bg-gray-50 font-semibold py-3 px-4">Status</td>
                    <td className="py-3 px-4">
                      <span className="font-bold uppercase">{data.status}</span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="bg-gray-50 font-semibold py-3 px-4">Tanggal Dibuat</td>
                    <td className="py-3 px-4">{formatTanggal(data.createdAt)}</td>
                  </tr>
                  {data.deskripsi && (
                    <tr className="border-b">
                      <td className="bg-gray-50 font-semibold py-3 px-4">Deskripsi</td>
                      <td className="py-3 px-4">{data.deskripsi}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 text-center text-sm text-gray-600 border-t">
            <div className="font-semibold text-green-700 mb-2">
              ✓ Dokumen ini terverifikasi secara digital
            </div>
            <div className="mb-1">Sistem Manajemen Perumahan Cherry Field</div>
            <div>Divalidasi pada: {new Date().toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>
    </div>
  )
} 