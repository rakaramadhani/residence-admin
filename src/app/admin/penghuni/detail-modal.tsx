"use client"

import { useState, useEffect } from 'react'
import { fetchPenghunibyID } from './fetcher'
import Modal from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface User {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  cluster?: string;
  nomor_rumah?: string;
  rt?: string;
  rw?: string;
  createdAt: string;
}

interface Penghuni {
  id: string;
  userId: string;
  nama: string;
  nik: string;
  gender: string;
  user: User;
}

interface DetailModalProps {
  penghuniId: string | null;
  onClose: () => void;
  isOpen: boolean;
}

const DetailModal = ({ penghuniId, onClose, isOpen }: DetailModalProps) => {
  const [penghuni, setPenghuni] = useState<Penghuni | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!penghuniId || !isOpen) return;
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetchPenghunibyID(penghuniId)
        if (response && response.data) {
          setPenghuni(response.data)
        } else {
          setError('Data penghuni tidak ditemukan')
        }
      } catch (err) {
        console.error('Error fetching penghuni detail:', err)
        setError('Gagal memuat data penghuni')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [penghuniId, isOpen])

  if (!isOpen) return null

  return (
    <Modal onClose={onClose} title="Informasi Penghuni">
      {loading ? (
        <div className="flex justify-center items-center py-6">
          <p>Memuat...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          <p>{error}</p>
        </div>
      ) : penghuni ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Nama:</label>
              <Input 
                value={penghuni.nama} 
                readOnly 
                className="bg-gray-50"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Pengguna:</label>
                <Input 
                  value={penghuni.user.username || 'N/A'} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">NIK:</label>
                <Input 
                  value={penghuni.nik} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Jenis Kelamin:</label>
                <Input 
                  value={penghuni.gender === 'laki-laki' ? 'Laki-Laki' : 'Perempuan'}
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Cluster:</label>
                <Input 
                  value={penghuni.user.cluster || 'N/A'} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Nomor:</label>
                <Input 
                  value={penghuni.user.nomor_rumah || 'N/A'} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">RT:</label>
                <Input 
                  value={penghuni.user.rt || 'N/A'} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">RW:</label>
                <Input 
                  value={penghuni.user.rw || 'N/A'} 
                  readOnly 
                  className="bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Tutup
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p>Tidak ada data</p>
          <Button onClick={onClose} variant="outline" className="mt-2">
            Tutup
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default DetailModal
